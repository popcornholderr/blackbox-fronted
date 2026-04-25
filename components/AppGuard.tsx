"use client";
import { useState, useEffect } from 'react';
import IntroScreen from "./IntroScreen";
import WarningModal from "./WarningModal";

export default function AppGuard({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    const hasAgreed = sessionStorage.getItem('hasAgreed');

    if (!hasSeenIntro) setShowIntro(true);
    if (hasAgreed === 'true') setAgreed(true);

    setLoading(false);
  }, []);

  const handleFinishIntro = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  const handleAgree = () => {
    sessionStorage.setItem('hasAgreed', 'true');
    setAgreed(true);
  };

  if (loading) return null;

  if (showIntro) {
    return <IntroScreen onFinish={handleFinishIntro} />;
  }

  return (
    <>
      {!agreed && <WarningModal onAgree={handleAgree} />}
      <div className={!agreed ? "blur-md pointer-events-none" : ""}>
        {children}
      </div>
    </>
  );
}
