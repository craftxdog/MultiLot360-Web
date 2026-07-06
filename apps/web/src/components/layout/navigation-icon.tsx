import {
  Banknote,
  Ban,
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  Gauge,
  Landmark,
  ListChecks,
  LockKeyhole,
  ReceiptText,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Ticket,
  Trophy,
  UsersRound,
} from "lucide-react";
import type { NavigationIcon } from "@/config/navigation";

type NavigationIconProps = {
  name: NavigationIcon;
  className?: string;
};

const icons = {
  banknote: Banknote,
  ban: Ban,
  "bar-chart": BarChart3,
  "calendar-clock": CalendarClock,
  "clipboard-check": ClipboardCheck,
  gauge: Gauge,
  landmark: Landmark,
  "list-checks": ListChecks,
  "lock-keyhole": LockKeyhole,
  "receipt-text": ReceiptText,
  settings: Settings2,
  "shield-check": ShieldCheck,
  sliders: SlidersHorizontal,
  ticket: Ticket,
  trophy: Trophy,
  users: UsersRound,
} satisfies Record<NavigationIcon, React.ComponentType<{ className?: string; strokeWidth?: number }>>;

export function NavigationIcon({ name, className }: NavigationIconProps) {
  const Icon = icons[name];

  return <Icon className={className} strokeWidth={1.8} />;
}
