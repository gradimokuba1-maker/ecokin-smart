import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type DataCardItem = {
  title: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
};

export function DataCards({ items }: { items: DataCardItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              {Icon && <Icon className={`h-4 w-4 ${item.color ?? "text-eco"}`} />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
