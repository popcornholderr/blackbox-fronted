"use client";

export default function WarningModal({ onAgree }: { onAgree: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[998] flex items-center justify-center">
      <div className="   p-8 rounded-3xl max-w-md text-center border-2 bg-[#0a0a0a] border-white/10">
        
        <h2 className="text-xl font-black mb-4 uppercase">
          Warning
        </h2>

        <p className="text-sm text-white/60 mb-6">
          This is a fully anonymous platform.  
          Do not share personal, sensitive, or harmful content.  
          You are responsible for what you post.  
          Identities are not tracked or verified.
        </p>

        <button
          onClick={onAgree}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold"
        >
          I Agree
        </button>
      </div>
    </div>
  );
}
