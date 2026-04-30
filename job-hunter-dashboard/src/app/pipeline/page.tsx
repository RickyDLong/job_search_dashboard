"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Plus, GripVertical, ExternalLink, Flag, Loader2 } from "lucide-react";
import { getJobs, updateJobStage } from "@/lib/queries";
import { STAGE_CONFIG, STAGE_ORDER } from "@/lib/constants";
import type { Job, PipelineStage } from "@/types/database";
import JobDetailModal from "@/components/JobDetailModal";

function JobCard({
  job,
  onDragStart,
  onClick,
}: {
  job: Job;
  onDragStart: (e: React.DragEvent, jobId: string) => void;
  onClick: () => void;
}) {
  const didDrag = useRef(false);

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
        border: "1px solid var(--border-default)",
        cursor: "grab",
        transition: "border-color 200ms, box-shadow 200ms, opacity 200ms, transform 200ms",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = STAGE_CONFIG[job.stage].color;
        e.currentTarget.style.boxShadow = `0 0 16px ${STAGE_CONFIG[job.stage].color}12`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-default)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GripVertical size={13} style={{ color: "var(--text-muted)", opacity: 0.4, cursor: "grab" }} />
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
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            background: `${STAGE_CONFIG[job.stage].color}18`,
            color: STAGE_CONFIG[job.stage].color,
            flexShrink: 0,
          }}
        >
          {job.match_score}
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
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
          <Flag size={10} style={{ color: "#ef4444" }} />
          <span style={{ fontSize: 10, color: "#ef4444" }}>
            {job.red_flags[0]}
          </span>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-default)" }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {job.days_in_stage}d in stage · {job.source}
        </span>
        <ExternalLink size={12} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [movingJobId, setMovingJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, jobId: string) => {
    setDraggedJobId(jobId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", jobId);
    // Make the dragged element semi-transparent
    requestAnimationFrame(() => {
      const el = e.currentTarget as HTMLElement;
      el.style.opacity = "0.4";
      el.style.transform = "scale(0.97)";
    });
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = "1";
    el.style.transform = "scale(1)";
    setDraggedJobId(null);
    setDragOverStage(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if we're leaving the column entirely, not entering a child
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverStage(null);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("text/plain");
    setDragOverStage(null);
    setDraggedJobId(null);

    if (!jobId) return;

    const job = jobs.find(j => j.id === jobId);
    if (!job || job.stage === targetStage) return;

    // Optimistic update — move it immediately in the UI
    setJobs(prev => prev.map(j =>
      j.id === jobId ? { ...j, stage: targetStage, days_in_stage: 0 } : j
    ));
    setMovingJobId(jobId);

    try {
      await updateJobStage(jobId, targetStage);
    } catch (err) {
      console.error("Failed to update job stage:", err);
      // Revert on failure
      setJobs(prev => prev.map(j =>
        j.id === jobId ? { ...j, stage: job.stage, days_in_stage: job.days_in_stage } : j
      ));
    } finally {
      // Brief delay so the user sees the card settle
      setTimeout(() => setMovingJobId(null), 400);
    }
  }, [jobs]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: 12 }}>
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading pipeline...</span>
      </div>
    );
  }

  const filteredJobs = jobs.filter(
    (j) =>
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Pipeline
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            {jobs.length} positions tracked · Drag cards to move between stages
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid var(--card-border)",
              background: "var(--card-bg)",
            }}
          >
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search positions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "var(--text-primary)",
                width: 180,
              }}
            />
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              background: "var(--accent)",
              color: "var(--text-inverse)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={15} />
            Add Position
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, minHeight: "calc(100vh - 160px)" }}>
        {STAGE_ORDER.map((stage) => {
          const stageJobs = filteredJobs.filter((j) => j.stage === stage);
          const config = STAGE_CONFIG[stage];
          const isDropTarget = dragOverStage === stage;
          const draggedJob = draggedJobId ? jobs.find(j => j.id === draggedJobId) : null;
          const isValidDrop = draggedJob && draggedJob.stage !== stage;

          return (
            <div
              key={stage}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
              style={{
                flexShrink: 0,
                width: 320,
                borderRadius: 16,
                border: `1px solid ${isDropTarget && isValidDrop ? config.color : "var(--card-border)"}`,
                background: isDropTarget && isValidDrop
                  ? `color-mix(in srgb, ${config.color} 4%, var(--card-bg))`
                  : "var(--card-bg)",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 200ms, background 200ms, box-shadow 200ms",
                boxShadow: isDropTarget && isValidDrop ? `0 0 24px ${config.color}10` : "none",
              }}
            >
              {/* Column Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: `1px solid ${isDropTarget && isValidDrop ? `${config.color}30` : "var(--card-border)"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: config.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{config.label}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: "var(--card-light)",
                      color: "var(--card-light-text)",
                    }}
                  >
                    {stageJobs.length}
                  </span>
                </div>
                <button
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
                onDragEnd={handleDragEnd}
              >
                {stageJobs.map((job) => (
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
                      onDragStart={handleDragStart}
                      onClick={() => setSelectedJob(job)}
                    />
                  </div>
                ))}

                {/* Drop zone indicator */}
                {stageJobs.length === 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 80,
                      borderRadius: 12,
                      border: `2px dashed ${isDropTarget && isValidDrop ? config.color : "var(--border-default)"}`,
                      transition: "border-color 200ms, background 200ms",
                      background: isDropTarget && isValidDrop ? `${config.color}08` : "transparent",
                    }}
                  >
                    <p style={{ fontSize: 11, color: isDropTarget && isValidDrop ? config.color : "var(--text-muted)", transition: "color 200ms" }}>
                      {isDropTarget && isValidDrop ? "Release to move here" : "Drop here"}
                    </p>
                  </div>
                )}

                {/* Ghost drop indicator when column has cards */}
                {stageJobs.length > 0 && isDropTarget && isValidDrop && (
                  <div
                    style={{
                      height: 48,
                      borderRadius: 12,
                      border: `2px dashed ${config.color}`,
                      background: `${config.color}06`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "fadeIn 200ms ease-out",
                    }}
                  >
                    <p style={{ fontSize: 10, color: config.color, fontWeight: 500 }}>Drop here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={(updatedJob) => {
            setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
            setSelectedJob(updatedJob);
          }}
          onContactsChanged={() => {
            // Contacts modified from modal — Contacts page will pull fresh data on visit
          }}
        />
      )}
    </div>
  );
}
