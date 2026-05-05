"use client";

import { useRef, memo } from "react";
import { GripVertical, ExternalLink, Flag, AlertTriangle } from "lucide-react";
import { STAGE_CONFIG } from "@/lib/constants";
import type { Job } from "@/types/database";

// ─── Types ───────────────────────────────────────────────────────

interface JobCardProps {
  /** The job data to render */
  job: Job;
  /** Called when the user begins dragging the card */
  onDragStart: (e: React.DragEvent, jobId: string) => void;
  /** Called on click (not drag) to open detail view */
  onClick: () => void;
}

// ─── Constants ───────────────────────────────────────────────────

/** Visual styles for source_type categorization */
const SOURCE_TYPE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  job_board: { bg: "#7c3aed18", color: "#7c3aed", label: "Job Board" },
  freelance: { bg: "#10b98118", color: "#10b981", label: "Freelance" },
  direct: { bg: "#6b728018", color: "#6b7280", label: "Direct" },
  referral: { bg: "#f59e0b18", color: "#f59e0b", label: "Referral" },
};

/** Platform-specific badge colors */
const SOURCE_BADGES: Record<string, { bg: string; color: string }> = {
  indeed: { bg: "#2557a718", color: "#2557a7" },
  linkedin: { bg: "#0a66c218", color: "#0a66c2" },
  upwork: { bg: "#14a80018", color: "#14a800" },
  fiverr: { bg: "#1dbf7318", color: "#1dbf73" },
  toptal: { bg: "#204ecf18", color: "#204ecf" },
  builtin: { bg: "#f4511e18", color: "#f4511e" },
};

// ─── Helpers ─────────────────────────────────────────────────────

function getSourceBadge(source: string) {
  const key = source?.toLowerCase().replace("autopilot:", "") || "";
  for (const [name, style] of Object.entries(SOURCE_BADGES)) {
    if (key.includes(name)) return { name, ...style };
  }
  return { name: key || "other", bg: "var(--bg-hover)", color: "var(--text-muted)" };
}

// ─── Component ───────────────────────────────────────────────────

/**
 * Draggable pipeline card representing a single job application.
 * Shows company, role, match score, salary, tags, and status indicators.
 */
export const JobCard = memo(function JobCard({ job, onDragStart, onClick }: JobCardProps) {
  const didDrag = useRef(false);
  const needsAttention = job.needs_attention;
  const attentionReason = job.attention_reason;
  const sourceType = (job as Record<string, unknown> & { source_type?: string }).source_type || "job_board";
  const sourceStyle = SOURCE_TYPE_STYLES[sourceType] || SOURCE_TYPE_STYLES.job_board;
  const sourceBadge = getSourceBadge(job.source);
  const stageColor = STAGE_CONFIG[job.stage]?.color || "var(--accent)";

  return (
    <div
      draggable
      onDragStart={(e) => { didDrag.current = true; onDragStart(e, job.id); }}
      onDragEnd={() => { setTimeout(() => { didDrag.current = false; }, 50); }}
      onMouseDown={() => { didDrag.current = false; }}
      onClick={() => { if (!didDrag.current) onClick(); }}
      style={{
        background: "var(--bg-elevated)",
        borderRadius: 14,
        padding: "16px 18px",
        border: needsAttention ? "2px solid #f59e0b" : "1px solid var(--border-default)",
        cursor: "grab",
        transition: "border-color 200ms, box-shadow 200ms, opacity 200ms, transform 200ms",
        userSelect: "none",
        boxShadow: needsAttention ? "0 0 12px #f59e0b20" : "none",
        position: "relative" as const,
      }}
      onMouseEnter={(e) => {
        if (!needsAttention) {
          e.currentTarget.style.borderColor = stageColor;
          e.currentTarget.style.boxShadow = `0 0 16px ${stageColor}12`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = needsAttention ? "#f59e0b" : "var(--border-default)";
        e.currentTarget.style.boxShadow = needsAttention ? "0 0 12px #f59e0b20" : "none";
      }}
    >
      {/* Attention Banner */}
      {needsAttention && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px", marginBottom: 10, borderRadius: 8,
          background: "#f59e0b14", border: "1px solid #f59e0b30",
        }}>
          <AlertTriangle size={12} style={{ color: "#f59e0b", flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600, lineHeight: 1.3 }}>
            {attentionReason || "Needs your attention"}
          </span>
        </div>
      )}

      {/* Header: Company + Role + Score */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GripVertical size={13} style={{ color: "var(--text-muted)", opacity: 0.4, cursor: "grab" }} aria-hidden />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              {job.company}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
              {job.role}
            </p>
          </div>
        </div>
        <div
          aria-label={`Match score: ${job.match_score}`}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            background: `${stageColor}18`,
            color: stageColor,
            flexShrink: 0,
          }}
        >
          {job.match_score}
        </div>
      </div>

      {/* Meta Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {job.salary && (
          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
            {job.salary}
          </span>
        )}
        {job.dual_contract_compatible && (
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, fontWeight: 600, background: "var(--accent)", color: "var(--text-inverse)" }}>
            Dual
          </span>
        )}
        <span style={{
          fontSize: 10, padding: "2px 7px", borderRadius: 6, fontWeight: 600,
          background: sourceBadge.bg, color: sourceBadge.color,
          textTransform: "capitalize",
        }}>
          {sourceBadge.name}
        </span>
        {sourceType === "freelance" && (
          <span style={{
            fontSize: 9, padding: "2px 6px", borderRadius: 6, fontWeight: 700,
            background: sourceStyle.bg, color: sourceStyle.color,
            letterSpacing: "0.05em",
          }}>
            FREELANCE
          </span>
        )}
      </div>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {job.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: "var(--bg-hover)", color: "var(--text-muted)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Red Flags */}
      {job.red_flags && job.red_flags.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-default)" }}>
          <Flag size={10} style={{ color: "#ef4444" }} aria-hidden />
          <span style={{ fontSize: 10, color: "#ef4444" }}>
            {job.red_flags[0]}
          </span>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-default)" }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {job.days_in_stage}d in stage
        </span>
        <ExternalLink size={12} style={{ color: "var(--text-muted)", opacity: 0.4 }} aria-hidden />
      </div>
    </div>
  );
});

JobCard.displayName = "JobCard";

export default JobCard;
