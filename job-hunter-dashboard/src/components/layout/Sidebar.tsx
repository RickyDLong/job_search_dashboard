"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  FileText,
  Users,
  Building2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
  Zap,
  Globe,
  ExternalLink,
  Trello,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/pipeline", icon: Kanban, label: "Pipeline" },
  { href: "/resumes", icon: FileText, label: "Resumes" },
  { href: "/contacts", icon: Users, label: "Contacts" },
  { href: "/companies", icon: Building2, label: "Companies" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

const quickLinks = [
  { href: "https://atlas-board.vercel.app", icon: Trello, label: "Atlas Board", color: "#6366f1" },
  { href: "https://rickydlong.dev", icon: Code2, label: "Portfolio", color: "#00d4aa" },
  { href: "https://linkedin.com/in/rickydlong", icon: Globe, label: "LinkedIn", color: "#0a66c2" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const sidebarWidth = collapsed ? 72 : 240;

  useEffect(() => {
    document.documentElement.style.setProperty("--current-sidebar-width", `${sidebarWidth}px`);
  }, [sidebarWidth]);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
      style={{
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-default)",
      }}
    >
      {/* ── Brand ─────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{ height: "var(--header-height)", borderBottom: "1px solid var(--border-default)" }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: "linear-gradient(135deg, rgba(0,212,170,0.15) 0%, rgba(99,102,241,0.1) 100%)" }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "#00d4aa" }}>R</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1
              className="text-[13px] font-bold tracking-wide"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "0.08em" }}
            >
              THE BOARD
            </h1>
            <p className="text-[9px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              Career Command
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────── */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                collapsed && "justify-center px-0"
              )}
              style={{
                background: isActive ? "var(--accent-muted)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                  style={{ height: 18, background: "var(--accent)" }}
                />
              )}
              <item.icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="text-[13px] font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Quick Links ───────────────────── */}
      {!collapsed && (
        <div className="px-2.5 pb-2">
          <div className="mb-2 px-3">
            <span className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              Quick Links
            </span>
          </div>
          <div className="space-y-0.5">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = link.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <link.icon size={15} className="shrink-0" />
                <span className="text-[12px] font-medium flex-1">{link.label}</span>
                <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Agent Status ──────────────────── */}
      {!collapsed && (
        <div className="px-2.5 pb-2">
          <div
            className="rounded-xl p-3"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,170,0.06) 0%, rgba(0,212,170,0.02) 100%)",
              border: "1px solid var(--accent-border)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="relative">
                <Zap size={12} style={{ color: "var(--accent)" }} />
                <div
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse-glow"
                  style={{ background: "var(--accent)" }}
                />
              </div>
              <span className="text-[11px] font-semibold" style={{ color: "var(--accent)" }}>
                Atlas Agent
              </span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              3 positions found today
            </p>
          </div>
        </div>
      )}

      {/* ── Footer ────────────────────────── */}
      <div
        className="flex items-center justify-between px-2.5 py-2.5"
        style={{ borderTop: "1px solid var(--border-default)" }}
      >
        {!collapsed && (
          <Link
            href="#"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] transition-colors duration-200"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.background = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Settings size={14} />
            <span>Settings</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg transition-colors duration-200"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-hover)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
