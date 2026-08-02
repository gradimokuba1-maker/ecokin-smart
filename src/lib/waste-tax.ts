// EcoKin Smart — Contribution obligatoire déchets ménagers.
// Génération de factures mensuelles, paiements et reçus.
import { useEffect, useState, useCallback } from "react";
import type { Household, BinType, HouseholdKind } from "./household-store";

export type PaymentMethod = "mobile_money" | "bank" | "card" | "international";
export type PaymentProviderLabels = Record<PaymentMethod, string>;

export type Invoice = {
  id: string;
  householdId: string;
  period: string; // YYYY-MM
  amountCdf: number;
  dueDate: string; // ISO
  status: "due" | "paid" | "late";
};

export type Payment = {
  id: string;
  invoiceId: string;
  householdId: string;
  method: PaymentMethod;
  provider: string;
  reference: string;
  amountCdf: number;
  paidAt: string;
};

const K_PAY = "ecokin_waste_tax_v1";
const K_RATES = "ecokin_waste_tax_rates_v1";
const EVT = "ecokin:contribution";
const LEGACY_EVT = "ecokin:tax";

const BASE_TARIFF: Record<BinType, number> = {
  "120L": 5000,
  "240L": 9000,
  "660L": 22000,
};

const KIND_COEF: Record<HouseholdKind, number> = { menage: 1, pme: 1.5 };

export type WasteTaxRates = {
  bin: Record<BinType, number>;
  pmeMultiplier: number;
};

const DEFAULT_RATES: WasteTaxRates = {
  bin: { ...BASE_TARIFF },
  pmeMultiplier: KIND_COEF.pme,
};

function readRates(): WasteTaxRates {
  if (typeof window === "undefined") return DEFAULT_RATES;
  try {
    const saved = JSON.parse(localStorage.getItem(K_RATES) ?? "{}") as Partial<WasteTaxRates>;
    return {
      bin: { ...DEFAULT_RATES.bin, ...saved.bin },
      pmeMultiplier:
        Number.isFinite(saved.pmeMultiplier) && (saved.pmeMultiplier ?? 0) > 0
          ? saved.pmeMultiplier!
          : DEFAULT_RATES.pmeMultiplier,
    };
  } catch {
    return DEFAULT_RATES;
  }
}

function writeRates(rates: WasteTaxRates) {
  if (typeof window === "undefined") return;
  localStorage.setItem(K_RATES, JSON.stringify(rates));
  window.dispatchEvent(new Event(EVT));
  window.dispatchEvent(new Event(LEGACY_EVT));
}

export function monthlyAmount(h: Pick<Household, "binType" | "kind" | "occupants">) {
  const rates = readRates();
  const base = rates.bin[h.binType] ?? BASE_TARIFF[h.binType] ?? 5000;
  const occCoef = 1 + Math.max(0, h.occupants - 4) * 0.05; // +5% par occupant au-delà de 4
  const kindCoef = h.kind === "pme" ? rates.pmeMultiplier : KIND_COEF.menage;
  return Math.round(base * kindCoef * occCoef);
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Génère les 12 dernières factures mensuelles pour un ménage donné.
export function generateInvoices(h: Household): Invoice[] {
  const start = new Date(h.createdAt);
  const now = new Date();
  const list: Invoice[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), 1);
  while (d <= now) {
    const period = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    const due = new Date(d.getFullYear(), d.getMonth(), 15);
    list.push({
      id: `INV-${h.id}-${period}`,
      householdId: h.id,
      period,
      amountCdf: monthlyAmount(h),
      dueDate: due.toISOString(),
      status: due.getTime() < now.getTime() ? "late" : "due",
    });
    d.setMonth(d.getMonth() + 1);
  }
  return list;
}

function readPayments(): Payment[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(K_PAY) || "[]");
  } catch {
    return [];
  }
}

function writePayments(list: Payment[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(K_PAY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVT));
  window.dispatchEvent(new Event(LEGACY_EVT));
}

export function useWasteTax(household?: Household) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rates, setRates] = useState<WasteTaxRates>(DEFAULT_RATES);

  const refresh = useCallback(() => {
    setPayments(readPayments());
    setRates(readRates());
  }, []);
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener(EVT, h);
    window.addEventListener(LEGACY_EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener(LEGACY_EVT, h);
      window.removeEventListener("storage", h);
    };
  }, [refresh]);

  const invoices: Invoice[] = household ? generateInvoices(household) : [];
  const paidIds = new Set(payments.map((p) => p.invoiceId));
  const merged = invoices.map<Invoice>((inv) =>
    paidIds.has(inv.id) ? { ...inv, status: "paid" } : inv,
  );
  const householdPayments = household
    ? payments.filter((p) => p.householdId === household.id)
    : payments;

  const totalDue = merged.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amountCdf, 0);
  const totalPaid = householdPayments.reduce((s, p) => s + p.amountCdf, 0);

  const updateRates = (nextRates: WasteTaxRates) => {
    const normalized: WasteTaxRates = {
      bin: {
        "120L": Math.max(0, Number(nextRates.bin["120L"]) || 0),
        "240L": Math.max(0, Number(nextRates.bin["240L"]) || 0),
        "660L": Math.max(0, Number(nextRates.bin["660L"]) || 0),
      },
      pmeMultiplier: Math.max(0.1, Number(nextRates.pmeMultiplier) || DEFAULT_RATES.pmeMultiplier),
    };
    writeRates(normalized);
    setRates(normalized);
  };

  return {
    invoices: merged.sort((a, b) => (a.period < b.period ? 1 : -1)),
    payments: householdPayments.sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1)),
    allPayments: payments,
    totalDue,
    totalPaid,
    rates,
    updateRates,
    pay(invoice: Invoice, method: PaymentMethod, provider: string, reference: string) {
      const next: Payment = {
        id: `PAY-${Date.now().toString(36).toUpperCase()}`,
        invoiceId: invoice.id,
        householdId: invoice.householdId,
        method,
        provider,
        reference,
        amountCdf: invoice.amountCdf,
        paidAt: new Date().toISOString(),
      };
      writePayments([next, ...readPayments()]);
      return next;
    },
  };
}

export const PAYMENT_METHOD_LABELS: PaymentProviderLabels = {
  mobile_money: "Mobile Money",
  bank: "Banque",
  card: "Carte bancaire",
  international: "Paiement international",
};

export const PAYMENT_PROVIDERS: Record<PaymentMethod, string[]> = {
  mobile_money: ["M-Pesa", "Orange Money", "Airtel Money", "Afrimoney"],
  bank: [
    "Rawbank",
    "Equity BCDC",
    "FirstBank DRC",
    "Advans Banque Congo",
    "Ecobank RDC",
    "Standard Bank RDC",
    "Sofibanque",
    "Access Bank RDC",
  ],
  card: ["Visa", "Mastercard"],
  international: ["PayPal"],
};

export function formatCdf(n: number) {
  return `${Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} CDF`;
}
