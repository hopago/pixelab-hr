"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {
  data: Array<{ name: string; mean: number }>;
};

export function CultureRadar({ data }: Props) {
  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="78%">
          <PolarGrid stroke="#E5E5EA" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#0A0A0A", fontWeight: 600 }}
          />
          <PolarRadiusAxis
            domain={[0, 5]}
            tick={{ fontSize: 10, fill: "#8E8E93" }}
            stroke="#E5E5EA"
          />
          <Radar
            dataKey="mean"
            stroke="#0F03FC"
            fill="#0F03FC"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: "#0A0A0A",
              border: "none",
              fontSize: 12,
              fontFamily: "JetBrains Mono, monospace",
              color: "#fff",
            }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
