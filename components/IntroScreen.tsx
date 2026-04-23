"use client";
import { useEffect, useState } from "react";

export default function IntroScreen({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 3000); // first text done
    const t2 = setTimeout(() => setStep(2), 4500); // black box text
    const t3 = setTimeout(() => onFinish(), 6000); // exit intro

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-[999] overflow-hidden">
      
      {/* STEP 1 */}
      {step === 0 && (
        <div className="text-center animate-growFade">
          <p className="text-2xl font-black">Shushhhhhh!!</p>

          {/* 👉 YOUR IMAGE HERE */}
          <img 
            src="/emoji.png" 
            className="mx-auto my-4 w-20 h-20 object-contain"
          />

          <p className="text-xl font-bold">it's gossip time</p>
        </div>
      )}

      {/* STEP 2 */}
     {step === 1 && (
  <h1 className="text-3xl font-black tracking-tighter text-center animate-fadeOut">
    B<span className="inline-block -scale-x-100">L</span>ACK BOX
  </h1>
)}
    </div>
  );
}