interface ImportanceBarProps {
  score?: number;
}

const COLORS: Record<string, { bar: string; text: string; label: string }> = {
  high: { bar: "bg-red-500", text: "text-red-700", label: "필독" },
  mid: { bar: "bg-orange-400", text: "text-orange-700", label: "주목" },
  low: { bar: "bg-gray-300", text: "text-gray-500", label: "" },
};

function getLevel(score: number) {
  if (score >= 8) return COLORS.high;
  if (score >= 5) return COLORS.mid;
  return COLORS.low;
}

export default function ImportanceBar({ score }: ImportanceBarProps) {
  if (score == null) return null;

  const { bar, text, label } = getLevel(score);
  const widthPercent = (score / 10) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${bar}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <span className={`text-xs font-medium tabular-nums ${text}`}>
        {score}
        {label && <span className="ml-0.5">{` ${label}`}</span>}
      </span>
    </div>
  );
}
