"use client";

import { memo } from "react";
import { Plus } from "lucide-react";
import { STAGE_CONFIG } from "@/lib/constants";
import { JobCard } from "./JobCard";
import type { Job, PipelineStage } from "@/types/database";

// ─── Types ───────────────────────────────────────────────────────

interface PipelineColumnProps {
  /** The pipeline stage this column represents */
  stage: PipelineStage;
  /** Filtered jobs belonging to this stage */
  jobs: Job[];
  /** Whether this column is currently a valid drop target */
  isDropTarget: boolean;
  /** Whether the dragged card can legally land here */
  isValidDrop: boolean;
  /** ID of a job that was just moved (for animation) */
  movingJobId: string | null;
  /** Drag event handlers */
  onDragOver: (e: React.DragEvent, stage: PipelineStage) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stage: PipelineStage) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, jobId: string) => void;
  /** Called when a card is clicked to open details */
  onJobClick: (job: Job) => void;
}

// ─── Component ───────────────────────────────────────────────────

/**
 * A single kanban column in the pipeline board.
 * Handles drag-and-drop zone rendering and card list display.
 */
export const PipelineColumn = memo(function PipelineColumn({
  stage,
  jobs,
  isDropTarget,
  isValidDrop,
  movingJobId,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onDragStart,
  onJobClick,
}: PipelineColumnProps) {
  const config = STAGE_CONFIG[stage];
  const active = isDropTarget && isValidDrop;

  return (
    <div
      onDragOver={(e) => onDragOver(e, stage)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, stage)}
      style={{
        flexShrink: 0,
        width: 320,
        borderRadius: 16,
        border: `1px solid ${active ? config.color : "var(--card-border)"}`,
        background: active
          ? `color-mix(in srgb, ${config.color} 4%, var(--card-bg))`
          : "var(--card-bg)",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 200ms, background 200ms, box-shadow 200ms",
        boxShadow: active ? `0 0 24px ${config.color}10` : "none",
      }}
    >
      {/* Column Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 18px",
        borderBottom: `1px solid ${active ? `${config.color}30` : "var(--card-border)"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: config.color }} aria-hidden />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{config.label}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
            background: "var(--card-light)", color: "var(--card-light-text)",
          }}>
            {jobs.length}
          </span>
        </div>
        <button
          aria-label={`Add job to ${config.label}`}
          style={{ padding: 6, borderRadius: 8, color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer", transition: "background 150ms" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Cards */}
      <div
        style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}
        onDragEnd={onDragEnd}
      >
        {jobs.map((job) => (
          <div
            key={job.id}
            style={{
              transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms",
              transform: movingJobId === job.id ? "scale(1.02)" : "scale(1)",
              animation: movingJobId === job.id ? "fadeIn 300ms ease-out" : undefined,
            }}
          >
            <JobCard
              job={job}
              onDragStart={onDragStart}
              onClick={() => onJobClick(job)}
            />
          </div>
        ))}

        {/* Empty state drop zone */}
        {jobs.length === 0 && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: 80, borderRadius: 12,
            border: `2px dashed ${active ? config.color : "var(--border-default)"}`,
            transition: "border-color 200ms, background 200ms",
            background: active ? `${config.color}08` : "transparent",
          }}>
            <p style={{ fontSize: 11, color: active ? config.color : "var(--text-muted)", transition: "color 200ms" }}>
              {active ? "Release to move here" : "Drop here"}
            </p>
          </div>
        )}

        {/* Ghost drop indicator when column has cards */}
        {jobs.length > 0 && active && (
          <div style={{
            height: 48, borderRadius: 12,
            border: `2px dashed ${config.color}`,
            background: `${config.color}06`,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 200ms ease-out",
          }}>
            <p style={{ fontSize: 10, color: config.color, fontWeight: 500 }}>Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
});

PipelineColumn.displayName = "PipelineColumn";

export default PipelineColumn;
