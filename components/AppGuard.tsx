"use client";
import { useState, useEffect } from 'react';
import IntroScreen from "./IntroScreen";

// Pass isSharedLink=true from room pages opened via direct URL
export default function AppGuard({
  children,
  isSharedLink = false,
}: {
  children: React.ReactNode;
  isSharedLink?: boolean;
}) {
  const [showIntro, setShowIntro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    // Show intro if never seen this session OR if it's a shared link (direct URL)
    if (!hasSeenIntro || isSharedLink) {
      setShowIntro(true);
    }
    setLoading(false);
  }, [isSharedLink]);

  const handleFinish = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  if (loading) return null;
  if (showIntro) return <IntroScreen onFinish={handleFinish} />;
  return <>{children}</>;
}
