import React, { useState, useEffect, useRef } from "react";
import { Camera, ChevronRight, ChevronLeft, X, Loader2, AlertTriangle, PlayCircle, ArrowLeft, Scan } from "lucide-react";
import { db } from "@/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs"; // Required peer dependency for coco-ssd

// Safely import images from assets, ignoring TypeScript errors if files don't exist yet
// @ts-ignore
import arrowImg from "@/assets/arrow.jpeg";
// @ts-ignore
import bandagePathImg from "@/assets/bandage-path.jpeg";
// @ts-ignore
import gauzeImg from "@/assets/gauze.jpeg";

const IMAGE_MAP: Record<string, string> = {
  "arrow.png": arrowImg,
  "arrow.jpeg": arrowImg,
  "arrow": arrowImg,
  "bandage-path.png": bandagePathImg,
  "bandage-path.jpeg": bandagePathImg,
  "bandage-path": bandagePathImg,
  "gauze.png": gauzeImg,
  "gauze.jpeg": gauzeImg,
  "gauze": gauzeImg,
};

interface Guide {
  id: string;
  name: string;
  steps: string[];
  overlayImages: string[];
}

export default function FirstAidAR() {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [targetBox, setTargetBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>();

  // Initialize TensorFlow Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
      } catch (err) {
        console.error("Failed to load object detection model", err);
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        console.log("Fetching from 'fristAidGuides' collection...");
        const querySnapshot = await getDocs(collection(db, "fristAidGuides"));
        console.log(`Found ${querySnapshot.size} documents.`);
        const fetchedGuides = querySnapshot.docs.map(doc => {
          console.log("Document Data:", doc.id, doc.data());
          return {
            id: doc.id,
            ...doc.data()
          };
        }) as Guide[];
        console.log("Mapped Guides:", fetchedGuides);
        setGuides(fetchedGuides);
      } catch (err: any) {
        console.error("Error fetching guides:", err);
        setError("Failed to load guides. Please try again later. Error details: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const detectFrame = async () => {
    if (videoRef.current && model && videoRef.current.readyState === 4) {
      const predictions = await model.detect(videoRef.current);
      
      // Look for a person or hand/arm (coco-ssd usually detects 'person')
      // For a medical AR context, we assume the 'person' bounding box is the target area
      const target = predictions.find(p => p.class === "person" && p.score > 0.5);
      
      if (target) {
        // Calculate relative coordinates based on the video element's displayed size vs natural size
        const video = videoRef.current;
        const rect = video.getBoundingClientRect();
        
        const scaleX = rect.width / video.videoWidth;
        const scaleY = rect.height / video.videoHeight;

        setTargetBox({
          x: target.bbox[0] * scaleX,
          y: target.bbox[1] * scaleY,
          width: target.bbox[2] * scaleX,
          height: target.bbox[3] * scaleY
        });
        setIsDetecting(true);
      } else {
        setTargetBox(null);
        setIsDetecting(false);
      }
    }
    
    // Continue loop
    requestRef.current = requestAnimationFrame(detectFrame);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Start detection loop once video starts playing
        videoRef.current.onloadeddata = () => {
           if (model) {
               detectFrame();
           }
        };
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSelectGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    setCurrentStep(0);
    startCamera();
  };

  const handleCloseGuide = () => {
    stopCamera();
    setSelectedGuide(null);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (selectedGuide && currentStep < selectedGuide.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSeedGuides = async () => {
    setLoading(true);
    try {
      const demoGuides = [
        {
          id: "bandage",
          name: "Apply Bandage",
          steps: ["Clean the wound", "Place gauze", "Wrap the bandage"],
          overlayImages: ["arrow.png", "gauze.png", "bandage-path.png"]
        },
        {
          id: "burn",
          name: "Burn Treatment",
          steps: ["Cool the burn under cool running water", "Apply aloe vera or burn gel", "Cover loosely with sterile gauze"],
          overlayImages: ["arrow.png", "gauze.png"]
        },
        {
          id: "temp",
          name: "Check Temperature",
          steps: ["Turn on the thermometer", "Place under tongue or armpit", "Wait for beep to read out"],
          overlayImages: ["arrow.png"]
        }
      ];

      for (const g of demoGuides) {
        await setDoc(doc(db, "fristAidGuides", g.id), {
          name: g.name,
          steps: g.steps,
          overlayImages: g.overlayImages
        });
      }
      
      const querySnapshot = await getDocs(collection(db, "fristAidGuides"));
      const fetchedGuides = querySnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Guide[];
      setGuides(fetchedGuides);
    } catch (err) {
      console.error("Failed to seed:", err);
      setError("Failed to create demo guides.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-teal-500 mb-4" />
        <p className="text-slate-500 font-medium">Loading AR Guides...</p>
      </div>
    );
  }

  if (selectedGuide) {
    return (
      <div className="flex flex-col h-screen bg-black overflow-hidden relative shadow-2xl">
        {/* AR Camera View */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* Camera Error overlay */}
        {cameraError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-bold mb-2">Camera Access Required</p>
            <p className="text-sm text-slate-300 mb-4">{cameraError}</p>
            <button 
              onClick={startCamera}
              className="px-6 py-2 bg-teal-500 rounded-xl font-bold hover:bg-teal-600 transition-colors"
            >
              Retry Camera
            </button>
          </div>
        )}

        {/* Top Navbar */}
        <div className="relative z-20 flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="text-white">
            <h2 className="font-bold text-lg">{selectedGuide.name}</h2>
            <p className="text-sm text-white/70">Step {currentStep + 1} of {selectedGuide.steps.length}</p>
          </div>
          <button 
            onClick={handleCloseGuide}
            className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-colors text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* AR Overlays */}
        <div className="absolute inset-0 z-10 pointer-events-none">
             {/* If we have a target box, draw the overlay exactly over it */}
             {targetBox ? (
               <div 
                  className="absolute border-2 border-teal-400 border-dashed rounded-xl flex items-center justify-center transition-all duration-300 ease-out bg-teal-500/10 backdrop-blur-[2px]"
                  style={{
                    left: `${targetBox.x}px`,
                    top: `${targetBox.y}px`,
                    width: `${targetBox.width}px`,
                    height: `${targetBox.height}px`,
                  }}
               >
                  {selectedGuide.overlayImages && selectedGuide.overlayImages.length > 0 && selectedGuide.overlayImages[currentStep % selectedGuide.overlayImages.length] && (
                    <img 
                      src={
                          IMAGE_MAP[selectedGuide.overlayImages[currentStep % selectedGuide.overlayImages.length]] 
                          || `/src/assets/${selectedGuide.overlayImages[currentStep % selectedGuide.overlayImages.length]}`
                      } 
                      alt={`AR Overlay: ${selectedGuide.overlayImages[currentStep % selectedGuide.overlayImages.length]}`} 
                      className="absolute z-50 object-contain filter drop-shadow-[0_0_12px_rgba(45,212,191,0.8)]"
                      style={{
                          maxWidth: '80%',
                          maxHeight: '80%'
                      }}
                      onError={(e) => {
                        console.warn("Failed to load image:", (e.target as HTMLImageElement).src);
                        if (!(e.target as HTMLImageElement).src.includes("/assets/")) {
                            (e.target as HTMLImageElement).src = `/assets/${selectedGuide.overlayImages[currentStep % selectedGuide.overlayImages.length]}`;
                        }
                      }}
                    />
                  )}
                  
                  {/* Tracking Indicator */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-teal-600/80 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                     <Scan size={14} className="animate-pulse" /> TARGET DETECTED
                  </div>
               </div>
             ) : (
                /* Scanning State when no target is detected */
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className="w-64 h-64 border-2 border-white/30 border-dashed rounded-3xl relative overflow-hidden flex items-center justify-center">
                      <div className="absolute top-0 left-0 w-full h-1 bg-teal-400/80 shadow-[0_0_15px_rgba(45,212,191,1)] animate-[scan_2s_ease-in-out_infinite]" />
                      <Scan className="w-16 h-16 text-white/20" />
                   </div>
                   <p className="text-white mt-6 bg-black/50 px-4 py-2 rounded-full font-medium tracking-wide">
                     Point camera at patient's body...
                   </p>
                </div>
             )}
        </div>

        {/* Bottom Control Bar */}
        <div className="mt-auto relative z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-20 pb-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8 text-white text-center shadow-lg">
            <p className="text-2xl font-medium leading-relaxed">
              {selectedGuide.steps[currentStep]}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 pointer-events-auto">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className={`flex-1 py-4 flex justify-center items-center gap-2 rounded-xl font-bold transition-all ${
                currentStep === 0 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5' 
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStep === selectedGuide.steps.length - 1}
              className={`flex-1 py-4 flex justify-center items-center gap-2 rounded-xl font-bold transition-all ${
                currentStep === selectedGuide.steps.length - 1
                  ? 'bg-teal-500/50 text-white/60 cursor-not-allowed'
                  : 'bg-teal-500 hover:bg-teal-600 text-white shadow-[0_0_15px_rgba(20,184,166,0.5)]'
              }`}
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <button 
        onClick={() => navigate("/patient")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 font-medium transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-8 mb-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AR First Aid Guide</h1>
          </div>
          <p className="text-teal-50 text-lg max-w-2xl leading-relaxed relative z-10">
            Select a first aid scenario to open the interactive AR camera. 
            Follow visually guided step-by-step instructions overlaid onto your real environment.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col items-center text-center">
              <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
              <h3 className="text-red-800 font-bold mb-1">Failed to Load Guides</h3>
              <p className="text-red-600 mb-4">{error}</p>
          </div>
        ) : guides.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
             <Camera className="h-12 w-12 mx-auto mb-4 text-slate-300" />
             <p className="text-lg font-medium">No AR Guides available yet.</p>
             <p className="text-sm mt-1 mb-6">Start by seeding demo guides into the Firestore database.</p>
             <button 
                onClick={handleSeedGuides}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-sm"
             >
                Generate Demo Guides
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <div 
                key={guide.id} 
                onClick={() => handleSelectGuide(guide)}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 cursor-pointer hover:shadow-md hover:border-teal-200 transition-all group overflow-hidden relative"
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-in-out" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-teal-500 group-hover:text-white transition-colors shadow-inner">
                    <PlayCircle size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{guide.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    {guide.steps.length} interactive steps
                  </p>
                  
                  <div className="flex items-center text-sm font-bold text-teal-600 group-hover:text-teal-700">
                    <span>Start Guide</span>
                    <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
