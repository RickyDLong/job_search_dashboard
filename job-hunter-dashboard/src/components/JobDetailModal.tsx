"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X, Save, ExternalLink, Plus, Trash2, User, Mail, Phone,
  Linkedin, Building2, Flag, Tag, Briefcase, Globe, Star,
  Calendar, ChevronDown,
} from "lucide-react";
import { updateJob, getContactsByJobId, createContact, updateContact } from "@/lib/queries";
import { STAGE_CONFIG, STAGE_ORDER } from "@/lib/constants";
import type { Job, Contact, PipelineStage, ContactTag } from "@/types/database";

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onUpdate: (updatedJob: Job) => void;
  onContactsChanged?: () => void;
}

type JobField = {
  key: string;
  label: string;
  type: "text" | "select" | "number" | "boolean" | "tags" | "textarea" | "date";
  options?: { value: string; label: string }[];
  icon?: React.ReactNode;
  section: "details" | "meta" | "notes";
};

const JOB_FIELDS: JobField[] = [
  { key: "company", label: "Company", type: "text", icon: <Building2 size={14} />, section: "details" },
  { key: "role", label: "Role / Title", type: "text", icon: <Briefcase size={14} />, section: "details" },
  { key: "salary", label: "Salary Range", type: "text", icon: <Star size={14} />, section: "details" },
  { key: "stage", label: "Stage", type: "select", icon: <ChevronDown size={14} />, section: "details",
    options: STAGE_ORDER.map(s => ({ value: s, label: STAGE_CONFIG[s].label })),
  },
  { key: "source", label: "Source", type: "text", icon: <Globe size={14} />, section: "details" },
  { key: "url", label: "Job URL", type: "text", icon: <ExternalLink size={14} />, section: "details" },
  { key: "match_score", label: "Match Score", type: "number", icon: <Star size={14} />, section: "meta" },
  { key: "dual_contract_compatible", label: "Dual Contract Compatible", type: "boolean", section: "meta" },
  { key: "applied_date", label: "Applied Date", type: "date", icon: <Calendar size={14} />, section: "meta" },
  { key: "tags", label: "Tags", type: "tags", icon: <Tag size={14} />, section: "meta" },
  { key: "red_flags", label: "Red Flags", type: "tags", icon: <Flag size={14} />, section: "meta" },
  { key: "notes", label: "Notes", type: "textarea", section: "notes" },
];

export default function JobDetailModal({ job, onClose, onUpdate, onContactsChanged }: JobDetailModalProps) {
  const [form, setForm] = useState<Record<string, unknown>>({ ...job });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [flagInput, setFlagInput] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "", role: "", email: "", phone: "", linkedin_url: "", tag: "cold" as ContactTag, notes: "",
  });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Load linked contacts
  useEffect(() => {
    async function loadContacts() {
      try {
        const linked = await getContactsByJobId(job.id);
        setContacts(linked);
      } catch {
        // Also try by company name for existing unlinked contacts
        console.log("No linked contacts found");
      }
    }
    loadContacts();
  }, [job.id]);

  const updateField = useCallback((key: string, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const { id, created_at, updated_at, ...updates } = form as Record<string, unknown>;
      const updated = await updateJob(job.id, updates);
      onUpdate(updated);
      setDirty(false);
    } catch (err) {
      console.error("Failed to save job:", err);
    } finally {
      setSaving(false);
    }
  }, [form, job.id, onUpdate]);

  const handleAddTag = useCallback((field: "tags" | "red_flags", input: string, setInput: (v: string) => void) => {
    if (!input.trim()) return;
    const current = (form[field] as string[]) || [];
    if (!current.includes(input.trim())) {
      updateField(field, [...current, input.trim()]);
    }
    setInput("");
  }, [form, updateField]);

  const handleRemoveTag = useCallback((field: "tags" | "red_flags", tag: string) => {
    const current = (form[field] as string[]) || [];
    updateField(field, current.filter(t => t !== tag));
  }, [form, updateField]);

  const handleAddContact = useCallback(async () => {
    if (!newContact.name.trim()) return;
    try {
      const created = await createContact({
        ...newContact,
        company: form.company as string,
        job_id: job.id,
      });
      setContacts(prev => [...prev, created]);
      setNewContact({ name: "", role: "", email: "", phone: "", linkedin_url: "", tag: "cold", notes: "" });
      setShowAddContact(false);
      onContactsChanged?.();
    } catch (err) {
      console.error("Failed to add contact:", err);
    }
  }, [newContact, form.company, job.id, onContactsChanged]);

  const handleUpdateContact = useCallback(async (contactId: string, updates: Record<string, unknown>) => {
    try {
      const updated = await updateContact(contactId, updates);
      setContacts(prev => prev.map(c => c.id === contactId ? updated : c));
      setEditingContactId(null);
      onContactsChanged?.();
    } catch (err) {
      console.error("Failed to update contact:", err);
    }
  }, [onContactsChanged]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const stageColor = STAGE_CONFIG[(form.stage as PipelineStage) || job.stage]?.color || "#666";

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--card-border)",
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    fontSize: 13,
    outline: "none",
    transition: "border-color 200ms",
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 600 as const,
    color: "var(--text-secondary)",
    marginBottom: 6,
    display: "flex" as const,
    alignItems: "center" as const,
    gap: 6,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 200ms ease-out",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: 900,
          maxHeight: "90vh",
          borderRadius: 20,
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Header ──────────────────────── */}
        <div style={{ padding: "24px 32px 20px", borderBottom: "1px solid var(--card-border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, background: `${stageColor}15`, color: stageColor }}>
              {(form.match_score as number) || 0}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                {(form.company as string) || "New Position"}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
                {(form.role as string) || "Role"} · {STAGE_CONFIG[(form.stage as PipelineStage)]?.label}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: "var(--accent)", color: "var(--text-inverse)",
                  border: "none", cursor: "pointer", opacity: saving ? 0.6 : 1,
                }}
              >
                <Save size={13} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
            <button
              onClick={onClose}
              style={{ padding: 8, borderRadius: 10, color: "var(--text-muted)", background: "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ────────────────────────── */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 32px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px 28px" }}>

          {/* LEFT COLUMN: Job Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: -8 }}>
              Position Details
            </div>

            {JOB_FIELDS.filter(f => f.section === "details").map((field) => (
              <div key={field.key}>
                <label style={labelStyle}>
                  {field.icon}
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    value={(form[field.key] as string) || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer", appearance: "none" as const }}
                  >
                    {field.options?.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={(form[field.key] as string) || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--card-border)")}
                  />
                )}
              </div>
            ))}

            {/* URL link */}
            {(form.url as string) && (
              <a href={form.url as string} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4, marginTop: -12 }}>
                <ExternalLink size={11} /> View posting
              </a>
            )}

            {/* Meta fields */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginTop: 8, marginBottom: -8 }}>
              Metadata
            </div>

            {/* Match Score */}
            <div>
              <label style={labelStyle}><Star size={14} /> Match Score</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input
                  type="range" min="0" max="100"
                  value={(form.match_score as number) || 0}
                  onChange={(e) => updateField("match_score", parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: "var(--accent)" }}
                />
                <span style={{ fontSize: 16, fontWeight: 700, color: stageColor, minWidth: 32, textAlign: "right" }}>
                  {(form.match_score as number) || 0}
                </span>
              </div>
            </div>

            {/* Dual Compatible */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "var(--bg-elevated)" }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Dual Contract Compatible</span>
              <button
                onClick={() => updateField("dual_contract_compatible", !(form.dual_contract_compatible as boolean))}
                style={{
                  width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                  background: (form.dual_contract_compatible as boolean) ? "var(--accent)" : "var(--bg-hover)",
                  position: "relative", transition: "background 200ms",
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  position: "absolute", top: 3,
                  left: (form.dual_contract_compatible as boolean) ? 21 : 3,
                  transition: "left 200ms",
                }} />
              </button>
            </div>

            {/* Applied Date */}
            <div>
              <label style={labelStyle}><Calendar size={14} /> Applied Date</label>
              <input
                type="date"
                value={(form.applied_date as string) || ""}
                onChange={(e) => updateField("applied_date", e.target.value || null)}
                style={{ ...inputStyle, colorScheme: "dark" }}
              />
            </div>

            {/* Tags */}
            <div>
              <label style={labelStyle}><Tag size={14} /> Tags</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {((form.tags as string[]) || []).map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "var(--bg-hover)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                    {tag}
                    <button onClick={() => handleRemoveTag("tags", tag)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text" placeholder="Add tag..." value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag("tags", tagInput, setTagInput); }}}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={() => handleAddTag("tags", tagInput, setTagInput)} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "var(--bg-hover)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 12 }}>Add</button>
              </div>
            </div>

            {/* Red Flags */}
            <div>
              <label style={labelStyle}><Flag size={14} style={{ color: "#ef4444" }} /> Red Flags</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {((form.red_flags as string[]) || []).map(flag => (
                  <span key={flag} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
                    {flag}
                    <button onClick={() => handleRemoveTag("red_flags", flag)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: 14 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text" placeholder="Add red flag..." value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag("red_flags", flagInput, setFlagInput); }}}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={() => handleAddTag("red_flags", flagInput, setFlagInput)} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer", fontSize: 12 }}>Add</button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={(form.notes as string) || ""}
                onChange={(e) => updateField("notes", e.target.value || null)}
                placeholder="Strategy notes, interview prep, follow-ups..."
                rows={4}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-body)", lineHeight: 1.5 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--card-border)")}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Contacts */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>
                Contacts at {(form.company as string) || "Company"}
              </div>
              <button
                onClick={() => setShowAddContact(!showAddContact)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                  background: showAddContact ? "var(--bg-hover)" : "var(--accent)",
                  color: showAddContact ? "var(--text-secondary)" : "var(--text-inverse)",
                  border: "none", cursor: "pointer",
                }}
              >
                {showAddContact ? <X size={12} /> : <Plus size={12} />}
                {showAddContact ? "Cancel" : "Add Contact"}
              </button>
            </div>

            {/* Add Contact Form */}
            {showAddContact && (
              <div style={{ padding: "20px", borderRadius: 14, background: "var(--bg-elevated)", border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: 10 }}><User size={12} /> Name *</label>
                    <input type="text" value={newContact.name} onChange={(e) => setNewContact(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Sarah Chen" style={{ ...inputStyle, padding: "8px 12px", fontSize: 12 }} />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: 10 }}><Briefcase size={12} /> Title</label>
                    <input type="text" value={newContact.role} onChange={(e) => setNewContact(p => ({ ...p, role: e.target.value }))}
                      placeholder="e.g. Hiring Manager" style={{ ...inputStyle, padding: "8px 12px", fontSize: 12 }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: 10 }}><Mail size={12} /> Email</label>
                    <input type="email" value={newContact.email} onChange={(e) => setNewContact(p => ({ ...p, email: e.target.value }))}
                      placeholder="email@company.com" style={{ ...inputStyle, padding: "8px 12px", fontSize: 12 }} />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: 10 }}><Phone size={12} /> Phone</label>
                    <input type="tel" value={newContact.phone} onChange={(e) => setNewContact(p => ({ ...p, phone: e.target.value }))}
                      placeholder="(555) 123-4567" style={{ ...inputStyle, padding: "8px 12px", fontSize: 12 }} />
                  </div>
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: 10 }}><Linkedin size={12} /> LinkedIn URL</label>
                  <input type="url" value={newContact.linkedin_url} onChange={(e) => setNewContact(p => ({ ...p, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/..." style={{ ...inputStyle, padding: "8px 12px", fontSize: 12 }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: 10 }}>Relationship</label>
                    <select value={newContact.tag} onChange={(e) => setNewContact(p => ({ ...p, tag: e.target.value as ContactTag }))}
                      style={{ ...inputStyle, padding: "8px 12px", fontSize: 12, cursor: "pointer" }}>
                      <option value="cold">Cold</option>
                      <option value="warm">Warm</option>
                      <option value="referral">Referral</option>
                      <option value="internal">Internal</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button onClick={handleAddContact}
                      style={{ width: "100%", padding: "9px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, background: "var(--accent)", color: "var(--text-inverse)", border: "none", cursor: "pointer" }}>
                      Save Contact
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: 10 }}>Notes</label>
                  <textarea value={newContact.notes} onChange={(e) => setNewContact(p => ({ ...p, notes: e.target.value }))}
                    placeholder="How you know them, context..." rows={2}
                    style={{ ...inputStyle, padding: "8px 12px", fontSize: 12, resize: "vertical", fontFamily: "var(--font-body)" }} />
                </div>
              </div>
            )}

            {/* Existing Contacts List */}
            {contacts.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {contacts.map((contact) => {
                  const isEditing = editingContactId === contact.id;
                  return (
                    <div key={contact.id} style={{ padding: "18px 20px", borderRadius: 14, background: "var(--bg-elevated)", border: "1px solid var(--card-border)", transition: "border-color 200ms" }}>
                      {isEditing ? (
                        <EditContactInline
                          contact={contact}
                          inputStyle={inputStyle}
                          labelStyle={labelStyle}
                          onSave={(updates) => handleUpdateContact(contact.id, updates)}
                          onCancel={() => setEditingContactId(null)}
                        />
                      ) : (
                        <>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                                {contact.name.split(" ").map(n => n[0]).join("")}
                              </div>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{contact.name}</p>
                                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{contact.role}</p>
                              </div>
                            </div>
                            <button onClick={() => setEditingContactId(contact.id)}
                              style={{ fontSize: 10, padding: "4px 10px", borderRadius: 6, border: "1px solid var(--card-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
                              Edit
                            </button>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {contact.email && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Mail size={12} style={{ color: "var(--text-muted)" }} />
                                <a href={`mailto:${contact.email}`} style={{ fontSize: 12, color: "var(--text-secondary)", textDecoration: "none" }}>{contact.email}</a>
                              </div>
                            )}
                            {contact.phone && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Phone size={12} style={{ color: "var(--text-muted)" }} />
                                <a href={`tel:${contact.phone}`} style={{ fontSize: 12, color: "var(--text-secondary)", textDecoration: "none" }}>{contact.phone}</a>
                              </div>
                            )}
                            {contact.linkedin_url && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Linkedin size={12} style={{ color: "var(--text-muted)" }} />
                                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>LinkedIn Profile</a>
                              </div>
                            )}
                          </div>

                          {contact.notes && (
                            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "var(--bg-hover)", lineHeight: 1.5 }}>
                              {contact.notes}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : !showAddContact && (
              <div style={{ padding: "40px 20px", borderRadius: 14, border: "2px dashed var(--card-border)", textAlign: "center" }}>
                <User size={24} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>No contacts linked yet</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Add a hiring manager, recruiter, or referral for this position</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Inline Contact Editor ──────────── */
function EditContactInline({
  contact,
  inputStyle,
  labelStyle,
  onSave,
  onCancel,
}: {
  contact: Contact;
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
  onSave: (updates: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...contact });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={{ ...labelStyle, fontSize: 10 }}><User size={11} /> Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
            style={{ ...inputStyle, padding: "8px 12px", fontSize: 12 }} />
        </div>
        <div>
          <label style={{ ...labelStyle, fontSize: 10 }}><Briefcase size={11} /> Title</label>
          <input type="text" value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value }))}
            style={{ ...inputStyle, padding: "8px 12px", fontSize: 12 }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={{ ...labelStyle, fontSize: 10 }}><Mail size={11} /> Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
            style={{ ...inputStyle, padding: "8px 12px", fontSize: 12 }} />
        </div>
        <div>
          <label style={{ ...labelStyle, fontSize: 10 }}><Phone size={11} /> Phone</label>
          <input type="tel" value={form.phone || ""} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
            style={{ ...inputStyle, padding: "8px 12px", fontSize: 12 }} />
        </div>
      </div>
      <div>
        <label style={{ ...labelStyle, fontSize: 10 }}><Linkedin size={11} /> LinkedIn</label>
        <input type="url" value={form.linkedin_url || ""} onChange={(e) => setForm(p => ({ ...p, linkedin_url: e.target.value }))}
          style={{ ...inputStyle, padding: "8px 12px", fontSize: 12 }} />
      </div>
      <div>
        <label style={{ ...labelStyle, fontSize: 10 }}>Notes</label>
        <textarea value={form.notes || ""} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
          style={{ ...inputStyle, padding: "8px 12px", fontSize: 12, resize: "vertical", fontFamily: "var(--font-body)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={onCancel} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 11, border: "1px solid var(--card-border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>Cancel</button>
        <button onClick={() => onSave({ name: form.name, role: form.role, email: form.email, phone: form.phone, linkedin_url: form.linkedin_url, notes: form.notes })}
          style={{ padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: "var(--accent)", color: "var(--text-inverse)", border: "none", cursor: "pointer" }}>
          Save
        </button>
      </div>
    </div>
  );
}
