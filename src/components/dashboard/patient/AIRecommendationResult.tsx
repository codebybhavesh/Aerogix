import * as React from "react";
import { useState, useEffect } from "react";
import { Doctor } from "@/lib/types";
import DoctorList from "./DoctorList";
import { Sparkles, Stethoscope, Loader2, AlertCircle, Send } from "lucide-react";

// Extend Window interface for Puter.js
declare global {
  interface Window {
    puter: any;
  }
}

interface AIRecommendationResultProps {
  onBookClick: (doc: Doctor) => void;
  fetchDoctorsByCategory: (category: string) => Promise<Doctor[]>;
}

export default function AIRecommendationResult({
  onBookClick,
  fetchDoctorsByCategory,
}: AIRecommendationResultProps) {
  const [symptoms, setSymptoms] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
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

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    if (!puterReady || !window.puter) {
      setError("AI service is still loading. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    setError(null);
    setCategory(null);
    setDoctors([]);
    setAnalyzed(false);

    try {
      const prompt = `You are a medical triage assistant. Based on the patient's symptoms below, respond with ONLY a single word: the most appropriate medical specialist type (e.g. Cardiologist, Dermatologist, Neurologist, Orthopedist, Gastroenterologist, Psychiatrist, Ophthalmologist, ENT, Gynecologist, Urologist, Pulmonologist, Endocrinologist, Rheumatologist, Oncologist, Pediatrician, GeneralPractitioner). Respond with just one word, no punctuation, no explanation.\n\nPatient symptoms: ${symptoms}`;

      // Use Puter.js free AI — no API key required
      const response = await window.puter.ai.chat(prompt);

      // Puter returns a string directly
      const rawCategory: string =
        typeof response === "string"
          ? response.trim()
          : response?.message?.content?.trim() || "";

      if (!rawCategory) {
        throw new Error("Could not determine a specialist from your symptoms.");
      }

      // Normalize: keep only first word, proper case
      const firstWord = rawCategory.split(/\s+/)[0].replace(/[^a-zA-Z]/g, "");
      const normalizedCategory =
        firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();

      if (!normalizedCategory) {
        throw new Error("Received an unexpected response. Please try again.");
      }

      setCategory(normalizedCategory);

      const fetchedDoctors = await fetchDoctorsByCategory(normalizedCategory);
      setDoctors(fetchedDoctors);
      setAnalyzed(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      analyzeSymptoms();
    }
  };

  const handleReset = () => {
    setSymptoms("");
    setCategory(null);
    setDoctors([]);
    setError(null);
    setAnalyzed(false);
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Symptom Input Card */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-teal-100 p-1.5 rounded-lg">
            <Stethoscope className="h-5 w-5 text-teal-600" />
          </div>
          <h3 className="text-lg font-bold text-teal-900">Describe Your Symptoms</h3>
        </div>
        <p className="text-teal-700 text-sm mb-4">
          Tell us what you're experiencing in your own words. Our AI will recommend the right
          specialist for you.
        </p>

        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={4}
          placeholder="e.g. I've been having sharp chest pain for the past 2 days, especially when I breathe deeply. I also feel slightly short of breath and dizzy sometimes..."
          className="w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none shadow-inner disabled:opacity-60 disabled:cursor-not-allowed transition"
        />

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-teal-500">
            {puterReady ? "✓ AI ready · Tip: Press Ctrl+Enter to analyze" : "⏳ Loading AI service..."}
          </p>
          <div className="flex gap-2">
            {analyzed && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition"
              >
                Start Over
              </button>
            )}
            <button
              onClick={analyzeSymptoms}
              disabled={loading || !symptoms.trim() || !puterReady}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Analyze Symptoms
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Analysis Failed</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-teal-100 rounded-lg" />
            <div className="h-5 w-48 bg-gray-100 rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {analyzed && category && !loading && (
        <div className="bg-white border border-teal-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            <h3 className="text-xl font-bold text-teal-900">
              AI Recommendation:{" "}
              <span className="text-teal-600 font-extrabold">{category}</span>
            </h3>
          </div>
          <p className="text-teal-700 text-sm mb-6">
            Based on your symptoms, we recommend consulting a{" "}
            <strong>{category}</strong>. Here are some highly rated specialists available for you:
          </p>

          <DoctorList
            doctors={doctors}
            onBookClick={onBookClick}
            emptyMessage={`We couldn't find any available ${category}s at the moment. Please try again later or search for another specialization.`}
          />
        </div>
      )}
    </div>
  );
}