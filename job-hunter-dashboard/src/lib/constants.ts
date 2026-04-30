import type { PipelineStage } from "@/types/database";

export const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string; bgColor: string }> = {
  discovered: { label: "Discovered", color: "#06b6d4", bgColor: "rgba(6, 182, 212, 0.12)" },
  saved: { label: "Saved", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.12)" },
  applied: { label: "Applied", color: "#00d4aa", bgColor: "rgba(0, 212, 170, 0.12)" },
  phone_screen: { label: "Phone Screen", color: "#f0a500", bgColor: "rgba(240, 165, 0, 0.12)" },
  technical: { label: "Technical", color: "#6366f1", bgColor: "rgba(99, 102, 241, 0.12)" },
  final_round: { label: "Final Round", color: "#8b5cf6", bgColor: "rgba(139, 92, 246, 0.12)" },
  offer: { label: "Offer", color: "#10b981", bgColor: "rgba(16, 185, 129, 0.12)" },
  accepted: { label: "Accepted", color: "#00d4aa", bgColor: "rgba(0, 212, 170, 0.12)" },
  rejected: { label: "Rejected", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.12)" },
};

export const STAGE_ORDER: PipelineStage[] = [
  "discovered", "saved", "applied", "phone_screen",
  "technical", "final_round", "offer",
];

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  warm: { color: "#00d4aa", bg: "rgba(0, 212, 170, 0.12)" },
  cold: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)" },
  referral: { color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)" },
  internal: { color: "#f0a500", bg: "rgba(240, 165, 0, 0.12)" },
};

export const REMOTE_LABELS: Record<string, { label: string; color: string }> = {
  fully_remote: { label: "Fully Remote", color: "#00d4aa" },
  hybrid: { label: "Hybrid", color: "#f0a500" },
  onsite: { label: "On-site", color: "#ef4444" },
};

export const ACTIVITY_COLORS: Record<string, string> = {
  applied: "#00d4aa",
  response: "#3b82f6",
  interview: "#6366f1",
  offer: "#8b5cf6",
  rejected: "#ef4444",
  follow_up: "#f0a500",
  note: "#06b6d4",
};
