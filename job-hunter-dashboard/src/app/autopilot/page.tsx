"use client";

import { useState, useEffect } from "react";
import {
  Rocket,
  Search,
  BarChart3,
  FileText,
  Send,
  Mail,
  Brain,
  Play,
  Pause,
  Settings,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ArrowRight,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { getAutopilotStats, getAutopilotConfig, updateAutopilotConfig } from "@/lib/queries";

const PIPELINE_STAGES = [
  { key: "scout", label: "Scout", icon: Search, desc: "Discover roles", color: "#6366f1" },
  { key: "analyst", label: "Analyst", icon: BarChart3, desc: "Score & rank", color: "#00d4aa" },
  { key: "author", label: "Author", icon: FileText, desc: "Tailor resume", color: "#f59e0b" },
  { key: "applicant", label: "Applicant", icon: Send, desc: "Submit apps", color: "#3b82f6" },
  { key: "hunter", label: "Hunter", icon: Search, desc: "Find recruiters", color: "#ec4899" },
  { key: "outreach", label: "Outreach", icon: Mail, desc: "Email contacts", color: "#8b5cf6" },
];

const SOURCE_COLORS: Record<string, string> = {
  linkedin: "#0a66c2",
  indeed: "#2164f3",
  weworkremotely: "#00d4aa",
  remoteok: "#ff5733",
  otta: "#6366f1",
  wellfound: "#000",
};

export default function AutopilotPage() {
  const [stats, setStats] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "discovered" | "outreach" | "learning">("overview");

  useEffect(() => {
    async function load() {
      try {
        const [statsData, configData] = await Promise.all([
          getAutopilotStats(),
          getAutopilotConfig(),
        ]);
        setStats(statsData);
        setConfig(configData);
      } catch (err) {
        console.error("Failed to load autopilot data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleEnabled = async () => {
    if (!config) return;
    try {
      const updated = await updateAutopilotConfig({ enabled: !config.enabled });
      setConfig(updated);
    } catch (err) {
      console.error("Failed to toggle autopilot:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 }}>
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading autopilot...</span>
      </div>
    );
  }

  const kpis = [
    { label: "Jobs Discovered", value: stats?.totalDiscovered || 0, icon: Search, color: "#6366f1" },
    { label: "Applications Sent", value: stats?.totalApplied || 0, icon: Send, color: "#3b82f6" },
    { label: "Emails Sent", value: stats?.totalEmailed || 0, icon: Mail, color: "#8b5cf6" },
    { label: "Responses", value: stats?.totalResponses || 0, icon: CheckCircle2, color: "#00d4aa" },
  ];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Autopilot
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                background: config?.enabled ? "rgba(0,212,170,0.12)" : "var(--bg-hover)",
                color: config?.enabled ? "#00d4aa" : "var(--text-muted)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: config?.enabled ? "#00d4aa" : "var(--text-muted)",
                  animation: config?.enabled ? "pulse 2s infinite" : "none",
                }}
              />
              {config?.enabled ? "Active" : "Paused"}
            </div>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            Autonomous job discovery, resume tailoring, and recruiter outreach
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
              borderRadius: 12, fontSize: 13, fontWeight: 500, border: "1px solid var(--card-border)",
              background: "var(--card-bg)", color: "var(--text-secondary)", cursor: "pointer",
            }}
          >
            <Settings size={15} />
            Settings
          </button>
          <button
            onClick={toggleEnabled}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
              borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
              background: config?.enabled ? "#ef4444" : "var(--accent)",
              color: "var(--text-inverse)",
            }}
          >
            {config?.enabled ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Activate</>}
          </button>
        </div>
      </div>

      {/* Pipeline Flow Diagram */}
      <div
        style={{
          background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--card-border)",
          padding: "28px 32px", overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Zap size={14} style={{ color: "var(--accent)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Pipeline Flow
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, justifyContent: "space-between" }}>
          {PIPELINE_STAGES.map((stage, i) => {
            const count = stats?.statusBreakdown?.[stage.key] || 0;
            const isLastRunStage = stats?.lastRun?.stage === stage.key;
            return (
              <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
                <div
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                    padding: "20px 16px", borderRadius: 14, flex: 1,
                    background: isLastRunStage ? `${stage.color}0a` : "var(--bg-elevated)",
                    border: `1px solid ${isLastRunStage ? stage.color : "var(--border-default)"}`,
                    transition: "all 200ms",
                    position: "relative",
                  }}
                >
                  {isLastRunStage && stats?.lastRun?.status === "running" && (
                    <div
                      style={{
                        position: "absolute", top: 8, right: 8, width: 8, height: 8,
                        borderRadius: "50%", background: stage.color, animation: "pulse 1.5s infinite",
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 12,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: `${stage.color}15`, color: stage.color,
                    }}
                  >
                    <stage.icon size={18} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{stage.label}</p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{stage.desc}</p>
                  </div>
                  <div
                    style={{
                      fontSize: 18, fontWeight: 800, color: stage.color, opacity: count > 0 ? 1 : 0.2,
                    }}
                  >
                    {count}
                  </div>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", padding: "0 4px", flexShrink: 0 }}>
                    <ArrowRight size={16} style={{ color: "var(--text-muted)", opacity: 0.3 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--card-border)",
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{kpi.label}</span>
              <kpi.icon size={14} style={{ color: kpi.color }} />
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--card-border)", paddingBottom: 0 }}>
        {(["overview", "discovered", "outreach", "learning"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
              background: "transparent",
              color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
              borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
              textTransform: "capitalize",
              transition: "all 150ms",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Recent Runs */}
          <div
            style={{
              background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--card-border)",
              padding: "24px 28px",
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Recent Runs</h3>
            {stats?.runs?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stats.runs.slice(0, 5).map((run: any) => (
                  <div
                    key={run.id}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: 10, background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {run.status === "completed" ? (
                        <CheckCircle2 size={14} style={{ color: "#00d4aa" }} />
                      ) : run.status === "running" ? (
                        <Loader2 size={14} className="animate-spin" style={{ color: "#6366f1" }} />
                      ) : run.status === "failed" ? (
                        <XCircle size={14} style={{ color: "#ef4444" }} />
                      ) : (
                        <Clock size={14} style={{ color: "var(--text-muted)" }} />
                      )}
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>
                          Stage: {run.stage}
                        </p>
                        <p style={{ fontSize: 10, color: "var(--text-muted)" }}>
                          {new Date(run.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 10, color: "var(--text-secondary)" }}>
                      <span>{run.jobs_discovered} found</span>
                      <span>{run.applications_sent} applied</span>
                      <span>{run.emails_sent} emailed</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "30px 0", textAlign: "center" }}>
                <Rocket size={24} style={{ color: "var(--text-muted)", opacity: 0.3, marginBottom: 10 }} />
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>No runs yet. Activate autopilot to start.</p>
              </div>
            )}
          </div>

          {/* Source Distribution */}
          <div
            style={{
              background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--card-border)",
              padding: "24px 28px",
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Jobs by Source</h3>
            {Object.keys(stats?.sourceBreakdown || {}).length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(stats.sourceBreakdown).map(([source, count]: [string, any]) => {
                  const max = Math.max(...Object.values(stats.sourceBreakdown) as number[]);
                  return (
                    <div key={source}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                          {source}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>{count}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: "var(--bg-elevated)" }}>
                        <div
                          style={{
                            height: "100%", borderRadius: 3,
                            width: `${(count / max) * 100}%`,
                            background: SOURCE_COLORS[source] || "var(--accent)",
                            transition: "width 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: "30px 0", textAlign: "center" }}>
                <Globe size={24} style={{ color: "var(--text-muted)", opacity: 0.3, marginBottom: 10 }} />
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Source data will appear after first run.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "discovered" && (
        <div
          style={{
            background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--card-border)",
            padding: "24px 28px",
          }}
        >
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Discovered Jobs</h3>
          {stats?.discovered?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.discovered.slice(0, 20).map((job: any) => (
                <div
                  key={job.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 16px", borderRadius: 10, background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)", transition: "border-color 200ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{job.title}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                      {job.company} · {job.location} {job.salary_range && `· ${job.salary_range}`}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700,
                        background: job.match_score >= 80 ? "rgba(0,212,170,0.12)" : job.match_score >= 60 ? "rgba(245,158,11,0.12)" : "var(--bg-hover)",
                        color: job.match_score >= 80 ? "#00d4aa" : job.match_score >= 60 ? "#f59e0b" : "var(--text-muted)",
                      }}
                    >
                      {job.match_score}
                    </div>
                    <span
                      style={{
                        fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        background: "var(--bg-hover)", color: "var(--text-muted)",
                      }}
                    >
                      {job.status}
                    </span>
                    <span
                      style={{
                        fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                        background: `${SOURCE_COLORS[job.source] || "var(--accent)"}18`,
                        color: SOURCE_COLORS[job.source] || "var(--accent)",
                        textTransform: "capitalize",
                      }}
                    >
                      {job.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <Search size={28} style={{ color: "var(--text-muted)", opacity: 0.2, marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No jobs discovered yet.</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Activate autopilot to start scanning job boards.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "outreach" && (
        <div
          style={{
            background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--card-border)",
            padding: "24px 28px",
          }}
        >
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Outreach Queue</h3>
          {stats?.outreach?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.outreach.map((email: any) => (
                <div
                  key={email.id}
                  style={{
                    padding: "16px 18px", borderRadius: 10, background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{email.subject}</p>
                    <span
                      style={{
                        fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                        textTransform: "uppercase",
                        background: email.status === "sent" ? "rgba(0,212,170,0.12)" : email.status === "failed" ? "rgba(239,68,68,0.12)" : "var(--bg-hover)",
                        color: email.status === "sent" ? "#00d4aa" : email.status === "failed" ? "#ef4444" : "var(--text-muted)",
                      }}
                    >
                      {email.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {email.body?.substring(0, 120)}...
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <Mail size={28} style={{ color: "var(--text-muted)", opacity: 0.2, marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No outreach emails yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "learning" && (
        <div
          style={{
            background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--card-border)",
            padding: "24px 28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Brain size={14} style={{ color: "var(--accent)" }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Learning Engine</h3>
          </div>
          {stats?.learning?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stats.learning.map((entry: any) => (
                <div
                  key={entry.id}
                  style={{
                    padding: "14px 16px", borderRadius: 10, background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                        textTransform: "uppercase", background: "var(--bg-hover)", color: "var(--text-muted)",
                      }}
                    >
                      {entry.category.replace("_", " ")}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{entry.signal}</p>
                  {entry.adjustment && (
                    <p style={{ fontSize: 11, color: "var(--accent)", marginTop: 6 }}>
                      Adjustment: {entry.adjustment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <Brain size={28} style={{ color: "var(--text-muted)", opacity: 0.2, marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No learning data yet.</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                The system logs patterns and adjusts strategy over time.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && config && (
        <div
          style={{
            background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--card-border)",
            padding: "28px 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Settings size={14} style={{ color: "var(--text-muted)" }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Autopilot Settings</h3>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Target Roles */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Target Roles
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {config.target_roles?.map((role: string) => (
                  <span
                    key={role}
                    style={{
                      fontSize: 11, padding: "5px 12px", borderRadius: 8,
                      background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Keywords */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Target Keywords
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {config.target_keywords?.map((kw: string) => (
                  <span
                    key={kw}
                    style={{
                      fontSize: 11, padding: "5px 12px", borderRadius: 8,
                      background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)",
                      color: "#00d4aa",
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Thresholds */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Thresholds
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "var(--bg-elevated)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Min Match Score</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{config.min_match_score}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "var(--bg-elevated)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Max Apps / Run</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{config.max_applications_per_run}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "var(--bg-elevated)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Max Emails / Run</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{config.max_emails_per_run}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "var(--bg-elevated)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Run Interval</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Every {config.run_interval_hours}h</span>
                </div>
              </div>
            </div>

            {/* Email Config */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Email Configuration
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "var(--bg-elevated)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Send Via</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", textTransform: "capitalize" }}>{config.email_send_via}</span>
                </div>
                <div
                  style={{
                    padding: "10px 12px", borderRadius: 8,
                    background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <AlertTriangle size={12} style={{ color: "#f59e0b" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b" }}>Proton Mail Setup</span>
                  </div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    Proton Mail requires Bridge for SMTP. Currently using Gmail connector as fallback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
