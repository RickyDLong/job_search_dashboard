"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Mail, Linkedin, Calendar, MessageSquare, Loader2 } from "lucide-react";
import { getContacts } from "@/lib/queries";
import { TAG_COLORS } from "@/lib/constants";
import type { Contact } from "@/types/database";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getContacts();
        setContacts(data);
      } catch (err) {
        console.error("Failed to load contacts:", err);
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
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading contacts...</span>
      </div>
    );
  }

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
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
            Contacts
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            {contacts.length} contacts · Recruiters, hiring managers, and referrals
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
              placeholder="Search contacts..."
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
            Add Contact
          </button>
        </div>
      </div>

      {/* ── Contacts Grid ──────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 14 }}>
        {filtered.map((contact) => {
          const tagStyle = TAG_COLORS[contact.tag] || TAG_COLORS.cold;
          return (
            <div
              key={contact.id}
              style={{ ...card, padding: "24px 28px", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {/* Contact Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      background: tagStyle.bg,
                      color: tagStyle.color,
                      flexShrink: 0,
                    }}
                  >
                    {contact.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{contact.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>
                      {contact.role}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: tagStyle.color,
                    background: tagStyle.bg,
                  }}
                >
                  {contact.tag}
                </span>
              </div>

              {/* Company — light accent */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "10px 14px",
                  borderRadius: 10,
                  marginBottom: 16,
                  background: "var(--card-light)",
                  color: "var(--card-light-text)",
                }}
              >
                {contact.company}
              </div>

              {/* Contact Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {contact.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Mail size={13} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{contact.email}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Calendar size={13} style={{ color: "var(--text-muted)" }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    Last: {contact.last_contact ? new Date(contact.last_contact).toLocaleDateString() : "—"}
                    {contact.next_follow_up && ` · Next: ${new Date(contact.next_follow_up).toLocaleDateString()}`}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {contact.notes && (
                <p style={{ fontSize: 11, padding: "10px 14px", borderRadius: 10, background: "var(--bg-elevated)", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
                  {contact.notes}
                </p>
              )}

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, paddingTop: 14, borderTop: "1px solid var(--card-border)" }}>
                {[Mail, Linkedin, MessageSquare].map((Icon, i) => (
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
          );
        })}
        {filtered.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "40px 0", gridColumn: "1 / -1" }}>
            {search ? "No contacts match your search" : "No contacts yet"}
          </p>
        )}
      </div>
    </div>
  );
}
