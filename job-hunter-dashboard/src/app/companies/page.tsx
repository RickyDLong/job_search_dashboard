"use client";

import { Search, Plus, Star, AlertTriangle, Users, Banknote, Building2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getCompanies } from "@/lib/queries";
import { REMOTE_LABELS } from "@/lib/constants";
import type { Company } from "@/types/database";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (err) {
        console.error("Failed to load companies:", err);
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
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading companies...</span>
      </div>
    );
  }

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const card = {
    background: "var(--card-bg)",
    borderRadius: 16,
    border: "1px solid var(--card-border)",
    transition: "border-color 250ms, box-shadow 250ms",
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ─────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Company Intel
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            {companies.length} companies researched · Ratings, funding, and red flags
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
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", width: 180 }}
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
            Add Company
          </button>
        </div>
      </div>

      {/* ── Companies Grid ─────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 14 }}>
        {filtered.map((company) => {
          const remote = REMOTE_LABELS[company.remote_policy] || { label: company.remote_policy, color: "var(--text-secondary)" };
          const ratingColor = company.glassdoor_rating >= 4.0 ? "#00d4aa" : company.glassdoor_rating >= 3.5 ? "#f0a500" : "#ef4444";

          return (
            <div
              key={company.id}
              style={{ ...card, overflow: "hidden", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {/* Top accent bar */}
              <div style={{ height: 3, background: company.red_flags && company.red_flags.length > 0 ? "#ef4444" : "#00d4aa" }} />

              <div style={{ padding: "24px 28px" }}>

                {/* Company Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 700,
                        background: "var(--bg-elevated)",
                        color: "var(--text-secondary)",
                        flexShrink: 0,
                      }}
                    >
                      {company.name[0]}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{company.name}</h3>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 20,
                          display: "inline-block",
                          marginTop: 4,
                          color: remote.color,
                          background: `${remote.color}18`,
                        }}
                      >
                        {remote.label}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Star size={15} style={{ color: ratingColor, fill: ratingColor }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: ratingColor }}>
                      {company.glassdoor_rating}
                    </span>
                  </div>
                </div>

                {/* Stats Grid — inverted light card for Funding */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                  <div style={{ textAlign: "center", padding: "14px 12px", borderRadius: 12, background: "var(--card-light)" }}>
                    <Banknote size={15} style={{ margin: "0 auto 6px", color: "var(--card-light-text)" }} />
                    <p style={{ fontSize: 10, color: "var(--card-light-text-muted)", marginBottom: 3 }}>Funding</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--card-light-text)" }}>
                      {company.funding ? company.funding.split("(")[0].trim() : "—"}
                    </p>
                  </div>
                  <div style={{ textAlign: "center", padding: "14px 12px", borderRadius: 12, background: "var(--bg-elevated)" }}>
                    <Users size={15} style={{ margin: "0 auto 6px", color: "var(--text-muted)" }} />
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>Size</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                      {company.headcount || "—"}
                    </p>
                  </div>
                  <div style={{ textAlign: "center", padding: "14px 12px", borderRadius: 12, background: "var(--bg-elevated)" }}>
                    <Building2 size={15} style={{ margin: "0 auto 6px", color: "var(--text-muted)" }} />
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>Open</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                      {company.open_positions} roles
                    </p>
                  </div>
                </div>

                {/* Red Flags */}
                {company.red_flags && company.red_flags.length > 0 && (
                  <div style={{ padding: "14px 16px", borderRadius: 12, marginBottom: 16, background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.12)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <AlertTriangle size={12} style={{ color: "#ef4444" }} />
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#ef4444" }}>Red Flags</span>
                    </div>
                    {company.red_flags.map((flag, i) => (
                      <p key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: i > 0 ? 4 : 0 }}>• {flag}</p>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {company.notes && (
                  <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{company.notes}</p>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "40px 0", gridColumn: "1 / -1" }}>
            {search ? "No companies match your search" : "No companies yet"}
          </p>
        )}
      </div>
    </div>
  );
}
