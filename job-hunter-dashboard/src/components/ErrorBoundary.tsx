"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            padding: "1rem",
            border: "1px solid var(--border-default)",
            borderRadius: "8px",
            background: "var(--bg-elevated)",
            color: "var(--text-secondary)",
            fontSize: "13px",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "4px" }}>Something went wrong</p>
          <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
