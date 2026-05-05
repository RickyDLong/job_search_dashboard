"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Sparkles,
  ChevronRight,
  Target,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { getDashboardStats, getActivityLog } from "@/lib/queries";
import { STAGE_CONFIG } from "@/lib/constants";
import type { Job, ActivityLogEntry } from "@/types/database";

/* ═══════════════════════════════════════════ */
export default function DashboardPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([getDashboardStats(), getActivityLog(8)]);
        setStats(s);
        setActivities(a);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", gap: 12 }}>
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading dashboard...</span>
      </div>
    );
  }

  const { jobs } = stats;
  const activeJobs = jobs.filter((j: Job) => !["rejected", "accepted"].includes(j.stage));
  const hotJobs = [...activeJobs].sort((a: Job, b: Job) => b.match_score - a.match_score).slice(0, 5);

  const pipelineStages = [
    { stage: "Discovered", count: stats.stageDistribution["discovered"] || 0, color: "#06b6d4" },
    { stage: "Saved", count: stats.stageDistribution["saved"] || 0, color: "#3b82f6" },
    { stage: "Applied", count: stats.stageDistribution["applied"] || 0, color: "#00d4aa" },
    { stage: "Screen", count: stats.stageDistribution["phone_screen"] || 0, color: "#f0a500" },
    { stage: "Technical", count: stats.stageDistribution["technical"] || 0, color: "#6366f1" },
    { stage: "Final", count: stats.stageDistribution["final_round"] || 0, color: "#8b5cf6" },
    { stage: "Offer", count: (stats.stageDistribution["offer"] || 0) + (stats.stageDistribution["accepted"] || 0), color: "#10b981" },
  ];

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
    .sort((a, b) => b.count - a.count);

  const activityDots: Record<string, string> = {
    applied: "#00d4aa", response: "#3b82f6", interview: "#6366f1",
    offer: "#8b5cf6", rejected: "#ef4444", follow_up: "#f0a500", note: "#06b6d4",
  };

  // Weekly goal tracking -- filters by actual applied_date this week
  const weeklyTarget = 10;
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const thisWeekApps = jobs.filter((j: Job) =>
    j.applied_date && new Date(j.applied_date) >= weekStart
  ).length;
  const goalProgress = Math.min((thisWeekApps / weeklyTarget) * 100, 100);

  // Styles
  // Dark card (default)
  const card = {
    background: "var(--card-bg)",
    borderRadius: 16,
    border: "1px solid var(--card-border)",
    padding: "22px 24px",
    display: "flex" as const,
    flexDirection: "column" as const,
    transition: "border-color 250ms",
  };

  // Light/inverted card (warm light grey — contrast accent)
  const cardLight = {
    ...card,
    background: "var(--card-light)",
    border: "1px solid var(--card-light-border)",
  };

  const label = { fontSize: 10, color: "var(--text-muted)", fontWeight: 600 as const, letterSpacing: "0.06em", textTransform: "uppercase" as const };
  const labelLight = { ...label, color: "var(--card-light-text-muted)" };
  const title = { fontSize: 14, fontWeight: 600 as const, color: "var(--text-primary)" };
  const titleLight = { ...title, color: "var(--card-light-text)" };

  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 10, minHeight: "calc(100vh - 32px)" }}>

      {/* ══ Row 0: Header ══════════════════════ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 0" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Overview
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a
            href="https://atlas-board.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="quick-link"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", border: "1px solid var(--card-border)" }}
          >
            <Target size={12} />
            Atlas Board
            <ExternalLink size={9} style={{ opacity: 0.4 }} />
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: "var(--accent-muted)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
            <div className="animate-pulse-glow" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />
            Agent Online
          </div>
        </div>
      </div>

      {/* ══ Row 1: KPI strip ═══════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {[
          { val: stats.totalJobs, label: "Total Tracked", icon: <Target size={14} />, color: "#06b6d4" },
          { val: stats.totalApplications, label: "Applied", icon: <ArrowUpRight size={14} />, color: "#00d4aa" },
          { val: stats.interviews, label: "Interviews", icon: <Clock size={14} />, color: "#6366f1" },
          { val: stats.offers, label: "Offers", icon: <Sparkles size={14} />, color: "#8b5cf6" },
          { val: `${stats.responseRate}%`, label: "Response Rate", icon: <TrendingUp size={14} />, color: "#f0a500" },
        ].map((kpi) => (
          <div key={kpi.label} style={{ ...card, flexDirection: "row", alignItems: "center", gap: 14, padding: "16px 20px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${kpi.color}10`, color: kpi.color, flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {kpi.val}
              </div>
              <div style={{ ...label, marginTop: 3 }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ Row 2: Main content ════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 10, minHeight: 0 }}>

        {/* ── Left column ──────────────────── */}
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 10, minHeight: 0 }}>

          {/* Pipeline Card */}
          <div style={{ ...card, justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={title}>Pipeline</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{stats.totalJobs} positions tracked</span>
            </div>

            {/* Stage labels */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${pipelineStages.length}, 1fr)`, gap: 4, marginTop: 14 }}>
              {pipelineStages.map((s) => (
                <span key={s.stage} style={{ fontSize: 10, color: s.count > 0 ? "var(--text-secondary)" : "var(--text-muted)", fontWeight: 500 }}>{s.stage}</span>
              ))}
            </div>

            {/* Custom bars */}
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 0, minHeight: 60 }}>
              {(() => {
                const maxCount = Math.max(...pipelineStages.map(s => s.count), 1);
                return pipelineStages.map((s) => (
                  <div key={s.stage} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 5 }}>
                    {s.count > 0 && (
                      <span style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 500 }}>{s.count}</span>
                    )}
                    <div
                      style={{
                        width: "36%",
                        maxWidth: 24,
                        height: s.count > 0 ? `${Math.max((s.count / maxCount) * 85, 12)}%` : 0,
                        background: s.color,
                        borderRadius: 4,
                        opacity: s.count > 0 ? 0.7 : 0,
                        transition: "height 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>
                ));
              })()}
            </div>

            {/* Weekly goal progress */}
            <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 14, marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>Weekly application goal</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: goalProgress >= 100 ? "#00d4aa" : "#f0a500" }}>
                  {thisWeekApps}/{weeklyTarget}
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.04)" }}>
                <div style={{
                  height: "100%",
                  borderRadius: 2,
                  width: `${goalProgress}%`,
                  background: goalProgress >= 100 ? "#00d4aa" : "linear-gradient(90deg, #f0a500, #00d4aa)",
                  transition: "width 800ms ease-out",
                }} />
              </div>
            </div>
          </div>

          {/* Sources + Match Distribution row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, minHeight: 0 }}>

            {/* Sources — LIGHT/INVERTED */}
            <div style={{ ...cardLight }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={titleLight}>Sources</span>
                <span style={labelLight}>response %</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
                {sourceBreakdown.map((src, i) => {
                  const colors = ["#1a1a1a", "#3a3a3a", "#2a2a2a", "#444444", "#333333", "#4a4a4a"];
                  const c = colors[i % colors.length];
                  const max = Math.max(...sourceBreakdown.map(s => s.count), 1);
                  return (
                    <div key={src.source}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--card-light-text)" }}>{src.source}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, color: "var(--card-light-text-muted)" }}>{src.count}</span>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 4, background: "rgba(0,0,0,0.08)", color: "var(--card-light-text-secondary)" }}>{src.rate}%</span>
                        </div>
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: "rgba(0,0,0,0.1)" }}>
                        <div style={{ height: "100%", borderRadius: 2, width: `${(src.count / max) * 100}%`, background: c, opacity: 0.7, transition: "width 700ms ease-out" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Match Score Distribution */}
            <div style={{ ...card }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={title}>Match Scores</span>
                <span style={{ padding: "3px 10px", borderRadius: 8, border: "1px solid var(--card-border)", fontSize: 9, color: "var(--text-muted)", fontWeight: 500 }}>
                  Distribution
                </span>
              </div>

              <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 300, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1, margin: "8px 0 2px" }}>
                {stats.avgMatchScore}%
              </div>
              <div style={label}>average fit</div>

              {/* Distribution bars */}
              <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 5, marginTop: 14, paddingBottom: 2 }}>
                {(() => {
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
                  const max = Math.max(...buckets.map(b => b.count), 1);
                  return buckets.map((b, i) => {
                    const isHighlight = b.count === max && b.count > 0;
                    return (
                      <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        {b.count > 0 && (
                          <span style={{ fontSize: 9, color: isHighlight ? "#fff" : "var(--text-muted)", fontWeight: isHighlight ? 600 : 400 }}>
                            {b.count}
                          </span>
                        )}
                        <div style={{
                          width: "75%",
                          height: `${Math.max((b.count / max) * 100, b.count > 0 ? 8 : 3)}%`,
                          minHeight: b.count > 0 ? 6 : 3,
                          background: i >= 4 ? "#00d4aa" : i >= 2 ? "#3b82f6" : "var(--bg-hover)",
                          borderRadius: 3,
                          opacity: b.count > 0 ? 0.7 : 0.2,
                        }} />
                        <span style={{ fontSize: 8, color: "var(--text-muted)" }}>{b.label}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ─────────────────── */}
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 10, minHeight: 0 }}>

          {/* Hot Opportunities */}
          <div style={{ ...card }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={title}>Hot Opportunities</span>
              <span style={{ ...label, color: "#00d4aa" }}>{hotJobs.length} active</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {hotJobs.map((job: Job) => (
                <div
                  key={job.id}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "var(--bg-elevated)", cursor: "pointer", transition: "background 200ms, border-color 200ms", border: "1px solid transparent" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "transparent"; }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: `${STAGE_CONFIG[job.stage].color}12`, color: STAGE_CONFIG[job.stage].color, flexShrink: 0 }}>
                    {job.match_score}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.company}</div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.role}</div>
                  </div>
                  <ChevronRight size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div style={{ ...card, minHeight: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={title}>Activity</span>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px rgba(0,212,170,0.4)" }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, overflow: "hidden" }}>
              {activities.map((a) => (
                <div
                  key={a.id}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.02)" }}
                >
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: activityDots[a.type] || "var(--text-muted)", marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>
                      {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ Row 3: Quick actions / resources ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { title: "Portfolio", desc: "rickydlong.dev", href: "https://rickydlong.dev", color: "#00d4aa" },
          { title: "Atlas Board", desc: "Task management", href: "https://atlas-board.vercel.app", color: "#6366f1" },
          { title: "Resumes", desc: `${stats.totalResumes} versions tracked`, href: "/resumes", color: "#3b82f6" },
        ].map((link) => (
          <a
            key={link.title}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="quick-link"
            style={{
              ...card,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: link.color, flexShrink: 0, opacity: 0.7 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{link.title}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{link.desc}</div>
            </div>
            <ExternalLink size={12} style={{ color: "var(--text-muted)" }} />
          </a>
        ))}
      </div>
    </div>
  );
}
