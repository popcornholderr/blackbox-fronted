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
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (isSharedLink) {
      // sessionStorage is cleared on every new tab/browser open.
      // So direct room links always show intro on fresh visits,
      // but NOT when navigating from within the app same session.
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

  // Always render children — intro overlays on top via position:fixed
  return (
    <>
      {showIntro && <IntroScreen onFinish={handleFinish} />}
      {children}
    </>
  );
}
