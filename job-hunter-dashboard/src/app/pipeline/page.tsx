"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { getJobs, updateJobStage } from "@/lib/queries";
import { STAGE_CONFIG, STAGE_ORDER } from "@/lib/constants";
import type { Job, PipelineStage } from "@/types/database";
import JobDetailModal from "@/components/JobDetailModal";
import { PipelineColumn } from "@/components/pipeline";

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
          const draggedJob = draggedJobId ? jobs.find(j => j.id === draggedJobId) : null;

          return (
            <PipelineColumn
              key={stage}
              stage={stage}
              jobs={stageJobs}
              isDropTarget={dragOverStage === stage}
              isValidDrop={!!draggedJob && draggedJob.stage !== stage}
              movingJobId={movingJobId}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              onJobClick={setSelectedJob}
            />
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
