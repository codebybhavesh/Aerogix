import * as React from "react";
import { useState, useEffect } from "react";
import { HeartPulse, AlertTriangle, ShieldCheck, Leaf, Loader2, Send } from "lucide-react";

// Extend Window interface for Puter.js
declare global {
  interface Window {
    puter: any;
  }
}

export default function FirstAidGuide() {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [puterReady, setPuterReady] = useState(false);

  // Dynamically load Puter.js script once on mount
  useEffect(() => {
    if (window.puter) {
      setPuterReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.onload = () => setPuterReady(true);
    script.onerror = () => setError("Failed to load AI service. Please refresh the page.");
    document.head.appendChild(script);
  }, []);

  const getAdvice = async () => {
    if (!situation.trim()) return;
    if (!puterReady || !window.puter) {
      setError("AI service is still loading. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    setError(null);
    setAdvice(null);

    try {
      const prompt = `You are a professional first responder and medical advisor.
A user is experiencing the following situation or injury: "${situation}"

Provide concise, practical advice formatted strictly using Markdown with the following three headings:
### Immediate First Aid Steps
(Provide 3-5 clear, actionable bullet points of what to do right now)

### Key Precautions
(Provide 2-3 bullet points of what NOT to do, or crucial warnings to avoid worsening the condition)

### Primary Remedies
(Provide 2-3 bullet points on basic remedies, medications, or aftercare. If professional help is strictly required, emphasize it here)

Keep the response direct, calm, and easy to read in an emergency. Do not include any other conversational text outside these headings.`;

      // Use Puter.js free AI — no API key required
      const response = await window.puter.ai.chat(prompt);

      const rawContent: string =
        typeof response === "string"
          ? response.trim()
          : response?.message?.content?.trim() || "";

      if (!rawContent) {
        throw new Error("Could not generate advice. Please try again.");
      }

      setAdvice(rawContent);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      getAdvice();
    }
  };

  const handleReset = () => {
    setSituation("");
    setAdvice(null);
    setError(null);
  };

  // Helper function to render Markdown-like response
  const renderAdvice = (text: string) => {
    // Split by headings
    const sections = text.split(/(?=### )/g);

    return (
      <div className="space-y-6 mt-6">
        {sections.map((section, idx) => {
          if (!section.trim()) return null;

          // Check which section it is to apply appropriate styling
          const isFirstAid = section.toLowerCase().includes("immediate first aid");
          const isPrecautions = section.toLowerCase().includes("precautions");
          const isRemedies = section.toLowerCase().includes("remedies");

          // Remove the "### Heading" part to just get the bullets
          const contentText = section.replace(/### .*\n?/, "").trim();
          const lines = contentText.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'));

          let Icon = HeartPulse;
          let bgColor = "bg-red-50";
          let borderColor = "border-red-100";
          let iconColor = "text-red-500";
          let iconBg = "bg-red-100";
          let titleColor = "text-red-900";
          let title = "First Aid Steps";

          if (isPrecautions) {
            Icon = AlertTriangle;
            bgColor = "bg-amber-50";
            borderColor = "border-amber-100";
            iconColor = "text-amber-500";
            iconBg = "bg-amber-100";
            titleColor = "text-amber-900";
            title = "Key Precautions (What NOT to do)";
          } else if (isRemedies) {
            Icon = Leaf;
            bgColor = "bg-emerald-50";
            borderColor = "border-emerald-100";
            iconColor = "text-emerald-500";
            iconBg = "bg-emerald-100";
            titleColor = "text-emerald-900";
            title = "Primary Remedies & Aftercare";
          }

          return (
            <div key={idx} className={`rounded-xl border ${borderColor} ${bgColor} overflow-hidden`}>
               <div className={`px-4 py-3 border-b ${borderColor} flex items-center gap-3`}>
                  <div className={`p-2 rounded-lg ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <h4 className={`font-bold ${titleColor} text-lg`}>{title}</h4>
               </div>
               <div className="p-4 bg-white/50">
                  <ul className="space-y-3">
                    {lines.length > 0 ? lines.map((line, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-3">
                        <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${iconColor.replace('text', 'bg')}`} />
                        <span className="text-gray-700 leading-relaxed text-sm">
                          {line.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                        </span>
                      </li>
                    )) : (
                      // Fallback if AI didn't format as bullet points
                      <p className="text-gray-700 text-sm whitespace-pre-line">{contentText}</p>
                    )}
                  </ul>
               </div>
            </div>
          );
        })}
      </div>
    );
  };


  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-3xl p-8 mb-8 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <HeartPulse size={160} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">First Aid & Remedies</h1>
          </div>
          <p className="text-rose-100 text-lg max-w-2xl leading-relaxed">
            Get immediate, AI-powered guidance for medical situations, minor injuries, or sudden symptoms.
            <strong className="block mt-2 text-white">Always call emergency services for severe or life-threatening conditions.</strong>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
           <h2 className="text-xl font-bold text-slate-800">Describe the Emergency or Symptoms</h2>
        </div>

        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={4}
          placeholder="e.g., 'I accidentally burned my hand with boiling water. The skin is red and painful, but no blisters yet.' or 'I have a severe headache, nausea, and sensitivity to light.'"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 focus:bg-white resize-none transition-all duration-200 shadow-inner"
        />

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">
            {puterReady ? "✓ Assistant ready · Tip: Press Ctrl+Enter to send" : "⏳ Initializing assistant..."}
          </p>
          <div className="flex gap-3">
            {advice && (
              <button
                onClick={handleReset}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                Clear
              </button>
            )}
            <button
              onClick={getAdvice}
              disabled={loading || !situation.trim() || !puterReady}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-rose-600/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Advice...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Get First Aid Steps
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">Unable to generate advice</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="mt-8 space-y-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
                <div className="h-14 md:h-16 bg-slate-100 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                  <div className="h-4 bg-slate-100 rounded-full w-5/6" />
                  <div className="h-4 bg-slate-100 rounded-full w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {advice && !loading && renderAdvice(advice)}
      </div>
    </div>
  );
}
