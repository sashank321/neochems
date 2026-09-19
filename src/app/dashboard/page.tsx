"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/lab");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] font-mono text-sm text-ink-black/60">
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-accent-orange animate-pulse" />
        <span>Connecting to NeoChems Lab...</span>
      </div>
    </div>
  );
}
