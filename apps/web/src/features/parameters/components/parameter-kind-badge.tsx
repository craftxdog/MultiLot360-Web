import { Braces, Hash, ToggleLeft, Type } from "lucide-react";
import { getParameterValueKind } from "../utils/parameter-formatters";

const kinds = {
  boolean: { label: "Booleano", icon: ToggleLeft },
  number: { label: "Número", icon: Hash },
  json: { label: "Avanzado", icon: Braces },
  text: { label: "Texto", icon: Type },
};

export function ParameterKindBadge({ value }: { value: string }) {
  const kind = kinds[getParameterValueKind(value)];
  const Icon = kind.icon;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {kind.label}
    </span>
  );
}
