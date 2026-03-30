import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function InsightsMetricCard({
  title,
  value,
  delta,
}: {
  title: string;
  value: string;
  delta: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-xs text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
      </CardContent>
    </Card>
  );
}

export function LabelRow({ labels }: { labels: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {labels.map((label) => (
        <Badge key={label} variant="outline" className="text-[11px]">
          {label}
        </Badge>
      ))}
    </div>
  );
}

export function ActivityTimeline({
  items,
}: {
  items: Array<{ id: string; title: string; meta: string; type?: "success" | "info" | "warning" }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono text-sm">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="mt-1 flex flex-col items-center">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  item.type === "success" && "bg-emerald-500",
                  item.type === "warning" && "bg-amber-500",
                  (!item.type || item.type === "info") && "bg-primary",
                )}
              />
              <span className="mt-1 h-6 w-px bg-border" />
            </div>
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.meta}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
