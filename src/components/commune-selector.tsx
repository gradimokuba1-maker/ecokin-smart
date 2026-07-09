import { COMMUNES } from "@/lib/eco-store";

type Props = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  label?: string;
};

export function CommuneSelector({ value, onChange, required, disabled, label = "Commune" }: Props) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      >
        <option value="">Choisir une commune</option>
        {COMMUNES.map((commune) => (
          <option key={commune.id} value={commune.id}>
            {commune.name}
          </option>
        ))}
      </select>
    </div>
  );
}
