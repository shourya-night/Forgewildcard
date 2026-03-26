import { Apple, CakeSlice, Coffee, Cookie, GlassWater, LucideIcon, UtensilsCrossed } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Apple,
  CakeSlice,
  Coffee,
  Cookie,
  GlassWater,
  UtensilsCrossed,
  IceCreamCone: CakeSlice,
};

export function IconBadge({ iconKey }: { iconKey: string }) {
  const Icon = iconMap[iconKey] ?? UtensilsCrossed;
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-forge-blue via-forge-yellow to-forge-orange text-slate-900">
      <Icon size={18} />
    </span>
  );
}
