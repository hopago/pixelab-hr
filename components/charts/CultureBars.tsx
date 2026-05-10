"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: Array<{ name: string; mean: number; sd: number; tag: string }>;
};

export function CultureBars({ data }: Props) {
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EFEFF3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#0A0A0A", fontWeight: 600 }}
            axisLine={{ stroke: "#0A0A0A" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: "#8E8E93", fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#F7F7F9" }}
            contentStyle={{
              background: "#0A0A0A",
              border: "none",
              fontSize: 12,
              color: "#fff",
            }}
            formatter={(v, _n, ctx) => {
              const num = typeof v === "number" ? v : Number(v ?? 0);
              const sd =
                (ctx as { payload?: { sd?: number } } | undefined)?.payload
                  ?.sd ?? 0;
              return [
                `${num.toFixed(2)} (σ ${Number(sd).toFixed(2)})`,
                "평균",
              ];
            }}
          />
          <Bar dataKey="mean">
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.mean >= 3.5 ? "#0F03FC" : "#0A0A0A"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
