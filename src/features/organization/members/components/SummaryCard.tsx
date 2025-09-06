import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type SummaryCardProps = {
  icon: React.ElementType;
  title: string;
  value: number;
  description: string;
  colorClass: string;
};

export const SummaryCard = ({
  icon: Icon,
  title,
  value,
  description,
  colorClass,
}: SummaryCardProps) => (
  <Card className={`border-l-4 ${colorClass}`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium flex items-center justify-between">
        <span>{title}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);
