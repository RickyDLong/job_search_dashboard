import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Board — Rick's Career Command Center",
  description: "Remote job search command center — track applications, resumes, contacts, and company intel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex" style={{ background: "var(--bg-root)" }}>
        <Sidebar />
        <main
          className="flex-1 min-h-screen transition-all duration-300 content-area"
          style={{ marginLeft: "var(--current-sidebar-width, 240px)" }}
        >
          <div className="p-4">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
