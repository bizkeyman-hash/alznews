interface ImportanceBarProps {
  score?: number;
}

const COLORS: Record<string, { bar: string; text: string; label: string; shadow: string }> = {
  high: { bar: "bg-gradient-to-r from-red-500 to-orange-500", text: "text-red-400", label: "필독", shadow: "shadow-sm shadow-red-500/30" },
  mid: { bar: "bg-gradient-to-r from-amber-500 to-yellow-500", text: "text-amber-400", label: "주목", shadow: "shadow-sm shadow-amber-500/20" },
  low: { bar: "bg-[#3D4163]", text: "text-[#636789]", label: "", shadow: "" },
};

function getLevel(score: number) {
  if (score >= 8) return COLORS.high;
  if (score >= 5) return COLORS.mid;
  return COLORS.low;
}

export default function ImportanceBar({ score }: ImportanceBarProps) {
  if (score == null) return null;

  const { bar, text, label, shadow } = getLevel(score);
  const widthPercent = (score / 10) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-[#23263B]">
        <div
          className={`h-full rounded-full transition-all ${bar} ${shadow}`}
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
