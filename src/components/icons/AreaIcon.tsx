import {
  Scale,
  Briefcase,
  ShoppingBag,
  Stethoscope,
  Building2,
  type LucideProps,
} from "lucide-react";

const map = {
  trabalhista: Briefcase,
  civil: Scale,
  consumidor: ShoppingBag,
  medico: Stethoscope,
  empresarial: Building2,
  balanca: Scale,
} as const;

export function AreaIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = map[name as keyof typeof map] ?? Scale;
  return <Icon {...props} />;
}
