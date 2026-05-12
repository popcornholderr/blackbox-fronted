"use client";
import { useState, useEffect } from 'react';
import IntroScreen from "./IntroScreen";

export default function AppGuard({
  children,
  isSharedLink = false,
}: {
  children: React.ReactNode;
  isSharedLink?: boolean;
}) {
  // Initialize to false; only show intro after mount check
  const [showIntro, setShowIntro] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isSharedLink) {
      const hasSeen = sessionStorage.getItem('hasSeenIntro');
      if (!hasSeen) {
        setShowIntro(true);
      }
    }
  }, [isSharedLink]);

  const handleFinish = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  // Suppress hydration mismatch on the wrapper
  return (
    <div suppressHydrationWarning>
      {mounted && showIntro && <IntroScreen onFinish={handleFinish} />}
      {children}
    </div>
  );
}
