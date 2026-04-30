"use client";

import { useState, useEffect } from "react";
import { FileText, Upload, Star, Eye, Download, ArrowRightLeft, Plus, Loader2 } from "lucide-react";
import { getResumes } from "@/lib/queries";
import type { Resume } from "@/types/database";

function AtsScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const color = score >= 90 ? "#00d4aa" : score >= 80 ? "#f0a500" : "#ef4444";
  const dim = size === "lg" ? 52 : size === "md" ? 40 : 32;
  const fontSize = size === "lg" ? 14 : size === "md" ? 10 : 9;
  const strokeW = size === "lg" ? 3.5 : 3;
  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg viewBox="0 0 36 36" style={{ width: dim, height: dim, transform: "rotate(-90deg)" }}>
          <circle cx="18" cy="18" r="16" fill="none" stroke="var(--bg-hover)" strokeWidth={strokeW} />
          <circle
            cx="18" cy="18" r="16" fill="none" stroke={color} strokeWidth={strokeW}
            strokeDasharray={`${(score / 100) * 100.53} 100.53`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold" style={{ color, fontSize }}>
          {score}
        </span>
      </div>
      {size !== "sm" && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>ATS</span>}
    </div>
  );
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getResumes();
        setResumes(data);
      } catch (err) {
        console.error("Failed to load resumes:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 }}>
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading resumes...</span>
      </div>
    );
  }

  const masterResume = resumes.find((r) => r.type === "master");
  const tailoredResumes = resumes.filter((r) => r.type === "tailored");

  const card = {
    background: "var(--card-bg)",
    borderRadius: 16,
    border: "1px solid var(--card-border)",
    transition: "border-color 250ms, box-shadow 250ms",
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Header ───────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Resume Vault
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            {resumes.length} resumes · Master + {tailoredResumes.length} tailored versions
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 500, border: "1px solid var(--card-border)", color: "var(--text-secondary)", background: "var(--card-bg)", cursor: "pointer", transition: "border-color 200ms" }}
          >
            <Upload size={15} />
            Upload
          </button>
          <button
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, background: "var(--accent)", color: "var(--text-inverse)", cursor: "pointer", border: "none" }}
          >
            <Plus size={15} />
            New Tailored
          </button>
        </div>
      </div>

      {/* ── Master Resume ────────────────── */}
      {masterResume && (
        <div style={{ ...card, padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Star size={14} style={{ color: "var(--accent)", fill: "var(--accent)" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>
              Master Resume
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 60, height: 60, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--card-light)", flexShrink: 0 }}>
                <FileText size={28} style={{ color: "var(--card-light-text)" }} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                  {masterResume.name}
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                  v{masterResume.version} · Updated {new Date(masterResume.last_modified).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <AtsScoreBadge score={masterResume.ats_score} size="lg" />
              <div style={{ display: "flex", gap: 6 }}>
                {[Eye, Download].map((Icon, i) => (
                  <button
                    key={i}
                    style={{ padding: 10, borderRadius: 10, color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer", transition: "background 150ms" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {masterResume.keywords && masterResume.keywords.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--card-border)" }}>
              {masterResume.keywords.map((kw) => (
                <span key={kw} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, fontWeight: 500, background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tailored Versions ────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <ArrowRightLeft size={14} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
            Tailored Versions
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 14 }}>
          {tailoredResumes.map((resume) => (
            <div
              key={resume.id}
              style={{ ...card, padding: "24px 28px", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-elevated)", flexShrink: 0 }}>
                    <FileText size={20} style={{ color: "var(--text-secondary)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{resume.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                      v{resume.version} · {new Date(resume.last_modified).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <AtsScoreBadge score={resume.ats_score} size="md" />
              </div>

              {resume.linked_job_title && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "8px 12px", borderRadius: 10, background: "var(--bg-elevated)" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, opacity: 0.6 }} />
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    {resume.linked_job_title}
                  </span>
                </div>
              )}

              {resume.keywords && resume.keywords.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {resume.keywords.map((kw) => (
                    <span key={kw} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "var(--bg-hover)", color: "var(--text-muted)" }}>
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--card-border)" }}>
                {[Eye, Download].map((Icon, i) => (
                  <button
                    key={i}
                    style={{ padding: 8, borderRadius: 8, color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer", transition: "background 150ms" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {tailoredResumes.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "40px 0", gridColumn: "1 / -1" }}>
              No tailored resumes yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
