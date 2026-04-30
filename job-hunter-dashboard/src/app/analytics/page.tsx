"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Target, Zap, Award } from "lucide-react";
import { getDashboardStats } from "@/lib/queries";
import { STAGE_CONFIG } from "@/lib/constants";
import type { Job, PipelineStage } from "@/types/database";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 }}>
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading analytics...</span>
      </div>
    );
  }

  const { jobs } = stats;

  // Stage distribution
  const stageDistribution = Object.entries(stats.stageDistribution).map(([stage, count]) => ({
    name: STAGE_CONFIG[stage as PipelineStage]?.label || stage,
    value: count,
    color: STAGE_CONFIG[stage as PipelineStage]?.color || "#666",
  })).filter(s => s.value > 0);

  // Source breakdown
  const sourceCounts: Record<string, { total: number; responded: number }> = {};
  jobs.forEach((job: Job) => {
    const src = job.source || "Unknown";
    if (!sourceCounts[src]) sourceCounts[src] = { total: 0, responded: 0 };
    sourceCounts[src].total += 1;
    if (["phone_screen", "technical", "final_round", "offer", "accepted"].includes(job.stage)) {
      sourceCounts[src].responded += 1;
    }
  });
  const sourceBreakdown = Object.entries(sourceCounts)
    .map(([source, data]) => ({ source, count: data.total, rate: data.total > 0 ? Math.round((data.responded / data.total) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate);

  // Match score buckets
  const buckets = [
    { label: "60–69", count: 0 }, { label: "70–79", count: 0 },
    { label: "80–84", count: 0 }, { label: "85–89", count: 0 },
    { label: "90–94", count: 0 }, { label: "95+", count: 0 },
  ];
  jobs.forEach((j: Job) => {
    const s = j.match_score;
    if (s >= 95) buckets[5].count++;
    else if (s >= 90) buckets[4].count++;
    else if (s >= 85) buckets[3].count++;
    else if (s >= 80) buckets[2].count++;
    else if (s >= 70) buckets[1].count++;
    else buckets[0].count++;
  });

  // Source volume sorted by count
  const sourceByVolume = [...sourceBreakdown].sort((a, b) => b.count - a.count);

  // Top-level stats
  const totalDiscovered = jobs.length;
  const totalApplied = stats.totalApplications;
  const conversionRate = totalDiscovered > 0 ? Math.round((totalApplied / totalDiscovered) * 100) : 0;
  const interviewRate = totalApplied > 0 ? Math.round((stats.interviews / totalApplied) * 100) : 0;
  const bestSource = sourceBreakdown.length > 0 ? sourceBreakdown[0] : null;

  // Pipeline total for donut
  const pipelineTotal = stageDistribution.reduce((sum, s) => sum + s.value, 0);

  const card = {
    background: "var(--card-bg)",
    borderRadius: 16,
    border: "1px solid var(--card-border)",
    transition: "border-color 250ms",
  };

  const cardLight = {
    ...card,
    background: "var(--card-light)",
    border: "1px solid var(--card-light-border)",
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ─────────────────────────── */}
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Analytics
        </h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          Job search performance metrics and insights
        </p>
      </div>

      {/* ── KPI Strip ──────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { val: String(totalDiscovered), label: "Total Discovered", sub: "Positions tracked", icon: <Target size={15} />, color: "#06b6d4" },
          { val: `${conversionRate}%`, label: "Conversion Rate", sub: "Discovered → Applied", icon: <TrendingUp size={15} />, color: "#00d4aa" },
          { val: `${interviewRate}%`, label: "Interview Rate", sub: "Applied → Interview", icon: <Zap size={15} />, color: "#6366f1" },
          { val: bestSource ? bestSource.source : "—", label: "Best Source", sub: bestSource ? `${bestSource.rate}% response rate` : "No data", icon: <Award size={15} />, color: "#8b5cf6", isLight: true },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              ...(kpi.isLight ? cardLight : card),
              padding: "24px 28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: kpi.isLight ? "rgba(0,0,0,0.08)" : `${kpi.color}12`, color: kpi.isLight ? "var(--card-light-text)" : kpi.color }}>
                {kpi.icon}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: kpi.isLight ? "var(--card-light-text-muted)" : "var(--text-muted)" }}>
                {kpi.label}
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 400, color: kpi.isLight ? "var(--card-light-text)" : "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {kpi.val}
            </div>
            <div style={{ fontSize: 11, color: kpi.isLight ? "var(--card-light-text-secondary)" : "var(--text-muted)", marginTop: 6 }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1 ───────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Response Rate by Source — horizontal bars */}
        <div style={{ ...card, padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Response Rate by Source</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>% response</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sourceBreakdown.map((src, i) => {
              const barColors = ["#00d4aa", "#3b82f6", "#8b5cf6", "#f0a500", "#06b6d4"];
              const c = barColors[i % barColors.length];
              return (
                <div key={src.source}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{src.source}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{src.rate}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--bg-hover)" }}>
                    <div style={{
                      height: "100%",
                      borderRadius: 3,
                      width: `${Math.max(src.rate, 2)}%`,
                      background: c,
                      opacity: 0.8,
                      transition: "width 700ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }} />
                  </div>
                </div>
              );
            })}
            {sourceBreakdown.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>No source data yet</p>
            )}
          </div>
        </div>

        {/* Pipeline Distribution — donut via CSS */}
        <div style={{ ...card, padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Pipeline Distribution</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>{pipelineTotal} total</span>
          </div>

          {stageDistribution.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {/* CSS Donut */}
              <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: 160, height: 160, transform: "rotate(-90deg)" }}>
                  {(() => {
                    let offset = 0;
                    return stageDistribution.map((s) => {
                      const pct = (s.value / pipelineTotal) * 100;
                      const dash = (pct / 100) * 100.53;
                      const el = (
                        <circle
                          key={s.name}
                          cx="18" cy="18" r="16"
                          fill="none"
                          stroke={s.color}
                          strokeWidth="3"
                          strokeDasharray={`${dash} ${100.53 - dash}`}
                          strokeDashoffset={`${-offset}`}
                          strokeLinecap="round"
                        />
                      );
                      offset += dash;
                      return el;
                    });
                  })()}
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "#fff", lineHeight: 1 }}>{pipelineTotal}</span>
                  <span style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 3 }}>TOTAL</span>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {stageDistribution.map((s) => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.value}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{Math.round((s.value / pipelineTotal) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>No pipeline data yet</p>
          )}
        </div>
      </div>

      {/* ── Charts Row 2 ───────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Match Score Distribution — vertical bars */}
        <div style={{ ...card, padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Match Score Distribution</span>
            <span style={{ padding: "3px 10px", borderRadius: 8, border: "1px solid var(--card-border)", fontSize: 9, color: "var(--text-muted)", fontWeight: 500 }}>
              avg {stats.avgMatchScore}%
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 180, paddingTop: 20 }}>
            {(() => {
              const max = Math.max(...buckets.map(b => b.count), 1);
              return buckets.map((b, i) => {
                const barColor = i >= 4 ? "#00d4aa" : i >= 2 ? "#3b82f6" : "var(--bg-active)";
                const isMax = b.count === max && b.count > 0;
                return (
                  <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 6 }}>
                    {b.count > 0 && (
                      <span style={{ fontSize: 11, color: isMax ? "#fff" : "var(--text-muted)", fontWeight: isMax ? 600 : 400 }}>
                        {b.count}
                      </span>
                    )}
                    <div style={{
                      width: "65%",
                      maxWidth: 48,
                      height: b.count > 0 ? `${Math.max((b.count / max) * 100, 10)}%` : "3%",
                      background: barColor,
                      borderRadius: "6px 6px 2px 2px",
                      opacity: b.count > 0 ? 0.75 : 0.15,
                      transition: "height 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }} />
                    <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{b.label}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Positions by Source — vertical bars */}
        <div style={{ ...card, padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Positions by Source</span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>{jobs.length} total</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 180, paddingTop: 20 }}>
            {(() => {
              const max = Math.max(...sourceByVolume.map(s => s.count), 1);
              const barColors = ["#6366f1", "#3b82f6", "#00d4aa", "#f0a500", "#06b6d4"];
              return sourceByVolume.map((src, i) => (
                <div key={src.source} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>
                    {src.count}
                  </span>
                  <div style={{
                    width: "65%",
                    maxWidth: 48,
                    height: `${Math.max((src.count / max) * 100, 10)}%`,
                    background: barColors[i % barColors.length],
                    borderRadius: "6px 6px 2px 2px",
                    opacity: 0.75,
                    transition: "height 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }} />
                  <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap", maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", textAlign: "center" }}>
                    {src.source}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
