"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ReportPanel from "../components/ReportPanel";

export default function ReportsPage() {
  return (
    <div className="reports-page-container">
      {/* Ambient Background */}
      <div className="ambient-mesh" aria-hidden="true" />

      {/* Header */}
      <header className="reports-page-header">
        <Link href="/" className="reports-back-btn" aria-label="Geri don">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="reports-page-title">Rapor</h1>
      </header>

      {/* Content */}
      <main className="reports-page-content">
        <ReportPanel />
      </main>
    </div>
  );
}
