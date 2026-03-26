"use client";

interface Score {
  id: string;
  label: string;
  score: number;
  max: number;
}

function getBarColor(score: number): string {
  if (score >= 3) return "#22C55E";
  if (score >= 2) return "#F59E0B";
  return "#EF4444";
}

export function DiagGauges({ scores }: { scores: Score[] }) {
  const data = scores.map((s) => ({
    name: s.label,
    score: Math.round(s.score * 100) / 100,
    max: s.max,
  }));

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{item.name}</span>
            <span className="text-sm font-bold" style={{ color: getBarColor(item.score) }}>
              {item.score.toFixed(1)} / {item.max}
            </span>
          </div>
          <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.score / item.max) * 100}%`,
                backgroundColor: getBarColor(item.score),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
