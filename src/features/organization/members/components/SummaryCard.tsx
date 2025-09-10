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
  <Card className={`border-l-4 ${colorClass} bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20 hover:shadow-lg transition-all duration-300 backdrop-blur-sm border-blue-200/60 dark:border-blue-700/60`}>
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-bold flex items-center justify-between text-gray-900 dark:text-gray-100">
        <span>{title}</span>
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
        {value.toLocaleString()}
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{description}</p>
    </CardContent>
  </Card>
);
