// EcoKin Smart — Taxe déchets ménagers.
// Génération de factures mensuelles, paiements et reçus.
import { useEffect, useState, useCallback } from "react";
import type { Household, BinType, HouseholdKind } from "./household-store";

export type PaymentMethod = "mobile_money" | "bank" | "card";

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
const EVT = "ecokin:tax";

const BASE_TARIFF: Record<BinType, number> = {
  "120L": 5000,
  "240L": 9000,
  "660L": 22000,
};

const KIND_COEF: Record<HouseholdKind, number> = { menage: 1, pme: 1.5 };

export function monthlyAmount(h: Pick<Household, "binType" | "kind" | "occupants">) {
  const base = BASE_TARIFF[h.binType] ?? 5000;
  const occCoef = 1 + Math.max(0, h.occupants - 4) * 0.05; // +5% par occupant au-delà de 4
  return Math.round(base * KIND_COEF[h.kind] * occCoef);
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
}

export function useWasteTax(household?: Household) {
  const [payments, setPayments] = useState<Payment[]>([]);

  const refresh = useCallback(() => setPayments(readPayments()), []);
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
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

  return {
    invoices: merged.sort((a, b) => (a.period < b.period ? 1 : -1)),
    payments: householdPayments.sort((a, b) => (a.paidAt < b.paidAt ? 1 : -1)),
    allPayments: payments,
    totalDue,
    totalPaid,
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

export const PAYMENT_PROVIDERS: Record<PaymentMethod, string[]> = {
  mobile_money: ["Orange Money", "Airtel Money", "M-Pesa (Vodacom)", "Africell Money"],
  bank: ["Rawbank", "Equity BCDC", "TMB", "FBNBank"],
  card: ["Visa", "Mastercard"],
};

export function formatCdf(n: number) {
  return `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} CDF`;
}
