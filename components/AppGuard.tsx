"use client";

export default function AppGuard({ children }: { children: React.ReactNode }) {
  return <div suppressHydrationWarning>{children}</div>;
}
