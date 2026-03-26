"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ParentControls } from "@/components/forge/parent-controls";

const palette = ["#77BEF0", "#FFCB61", "#FF894F", "#EA5B6F"];

export function ParentDashboard({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Wallet Balance", `₹${data.stats.walletBalance.toFixed(0)}`],
          ["Monthly Spend", `₹${data.stats.monthlySpend.toFixed(0)}`],
          ["Remaining Monthly Allowance", `₹${data.stats.remainingAllowance.toFixed(0)}`],
          ["Healthy Meal Ratio", `${data.stats.healthyRatio.toFixed(1)}%`],
          ["Spent Today", `₹${data.stats.spentToday.toFixed(0)}`],
        ].map(([title, value], idx) => (
          <div key={String(title)} className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-sm">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-bold" style={{ color: palette[idx % palette.length] }}>{value}</p>
          </div>
        ))}
      </section>

      <ParentControls students={data.students} />

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Weekly Spending Trend"><ResponsiveContainer width="100%" height={240}><LineChart data={data.charts.weeklySpend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="spend" stroke="#77BEF0" strokeWidth={3} /></LineChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Monthly Spending Trend"><ResponsiveContainer width="100%" height={240}><BarChart data={data.charts.monthlySpend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="spend">{data.charts.monthlySpend.map((_: any, idx: number) => <Cell key={idx} fill={palette[idx % 4]} />)}</Bar></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Meal Category Breakdown"><ResponsiveContainer width="100%" height={260}><PieChart><Tooltip /><Pie data={data.charts.categoryBreakdown} dataKey="value" nameKey="name" outerRadius={90}>{data.charts.categoryBreakdown.map((_: any, idx: number) => <Cell key={idx} fill={palette[idx % 4]} />)}</Pie></PieChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Healthy vs Less Healthy"><ResponsiveContainer width="100%" height={260}><PieChart><Tooltip /><Pie data={data.charts.healthMix} dataKey="value" nameKey="name" outerRadius={90}>{data.charts.healthMix.map((_: any, idx: number) => <Cell key={idx} fill={palette[idx % 4]} />)}</Pie></PieChart></ResponsiveContainer></ChartCard>
      </section>
      <ChartCard title="Top Meals"><ResponsiveContainer width="100%" height={250}><BarChart data={data.charts.topMeals}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#EA5B6F" /></BarChart></ResponsiveContainer></ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-sm"><h3 className="mb-3 font-semibold">{title}</h3>{children}</div>;
}
