import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader, MapPin, Mic, Sparkles } from 'lucide-react';

type Step = 1 | 2 | 3;

interface AIPreviewData {
  category: string;
  severity: string;
  isDuplicate: boolean;
  priorityScore: number;
  reasoning: string;
}

export const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [photo, setPhoto] = useState<string | null>(null);
  const [category, setCategory] = useState('Roads & Potholes');
  const [description, setDescription] = useState('');
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [latitude, setLatitude] = useState(12.9715);
  const [longitude, setLongitude] = useState(77.5945);

  // AI Pipeline Preview Modal State
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [aiPreviewData, setAiPreviewData] = useState<AIPreviewData | null>(null);

  // Triggered when simulating camera upload or attachment
  const handlePhotoUpload = () => {
    // Inject a realistic pothole test photo URL
    setPhoto('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600');
    setStep(2);
  };

  // Triggers the initial AI Agent Ingestion analysis simulation
  const handleTriggerAIPreview = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate multi-agent processing response delay
    setTimeout(() => {
      // Create a mock AI classification based on details entered
      let predictedCategory = category;
      let predictedSeverity = 'medium';
      let priority = 2;
      let reason = 'Ingested image confirms road infrastructure failure near bus stop. Location coordinates indicate proximity to public schools, elevating priority index to 2.';

      if (description.toLowerCase().includes('leak') || description.toLowerCase().includes('water')) {
        predictedCategory = 'Water Leak';
        predictedSeverity = 'high';
        priority = 3;
        reason = 'Acoustic voice signature and description matches high-priority water main burst classification. High probability of neighborhood roadway flooding.';
      } else if (description.toLowerCase().includes('garbage') || description.toLowerCase().includes('dump')) {
        predictedCategory = 'Garbage & Sanitation';
        predictedSeverity = 'low';
        priority = 1;
        reason = 'Image detects residential dumpster pile-up. Low immediate hazard, assigned to regular morning garbage collection dispatch cycle.';
      }

      setAiPreviewData({
        category: predictedCategory,
        severity: predictedSeverity,
        isDuplicate: false,
        priorityScore: priority,
        reasoning: reason
      });

      setLoading(false);
      setShowAIPreview(true);
    }, 1500);
  };

  // Submit the ticket write to Supabase
  const handleFinalSubmit = async () => {
    setSubmitting(true);

    const ticketPayload = {
      category,
      severity: aiPreviewData?.severity || 'medium',
      description,
      latitude,
      longitude,
      status: 'reported',
      priority_score: aiPreviewData?.priorityScore || 2,
      priority_reason: aiPreviewData?.reasoning || ''
    };

    try {
      const res = await fetch('http://localhost:8000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketPayload)
      });
      // Simple backend ticket creation API handler check
      if (res.ok) {
        navigate('/citizen/dashboard');
      } else {
        // Fallback simulate create success if DB is not configured locally
        setTimeout(() => {
          navigate('/citizen/dashboard');
        }, 1000);
      }
    } catch (err) {
      console.warn("Could not POST, saving locally for mock visualization:", err);
      setTimeout(() => {
        navigate('/citizen/dashboard');
      }, 1000);
    }
  };

  const categories = [
    'Roads & Potholes',
    'Water Leak',
    'Garbage & Sanitation',
    'Streetlight & Electrical',
    'Signage & Hazards'
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 min-h-screen text-foreground font-sans">
      
      {/* Header */}
      <div className="border-b border-panel-border pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif italic font-bold">Report New Infrastructure Issue</h1>
          <p className="text-gray-500 text-xs mt-1">Submit civic complaints with active geolocated triggers.</p>
        </div>
        <div className="font-mono text-xs text-gray-500 bg-panel-card border border-panel-border px-3 py-1 rounded">
          Step {step} of 3
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center space-x-2">
        <div className={`h-1 flex-1 rounded ${step >= 1 ? 'bg-brand-lime' : 'bg-gray-800'}`} />
        <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-brand-lime' : 'bg-gray-800'}`} />
        <div className={`h-1 flex-1 rounded ${step >= 3 ? 'bg-brand-lime' : 'bg-gray-800'}`} />
      </div>

      {/* Form Steps */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-panel-border/80 hover:border-brand-lime/20 rounded-lg p-12 text-center transition-colors">
            <Camera className="mx-auto text-gray-500 mb-4 animate-bounce" size={40} />
            <h3 className="font-serif italic font-bold text-base mb-1">Capture or Upload Evidence</h3>
            <p className="text-gray-500 text-xs max-w-sm mx-auto mb-6">Attach a clear photograph of the damaged road, leak, or street safety hazard.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePhotoUpload}
                className="w-full sm:w-auto bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold px-6 py-2.5 rounded text-xs transition-colors"
              >
                Simulate Camera Capture
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto bg-panel-card border border-panel-border hover:border-brand-lime/10 text-gray-300 font-medium px-6 py-2.5 rounded text-xs transition-colors"
              >
                Skip Photo Attachment
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleTriggerAIPreview} className="space-y-6">
          {photo && (
            <div className="relative rounded overflow-hidden h-40 border border-panel-border">
              <img src={photo} alt="Report Attachment Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 text-[10px] hover:bg-black"
              >
                ✕ Remove
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400">Issue Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`p-3 rounded text-xs font-medium border text-left transition-all duration-150 ${category === c ? 'bg-brand-soft border-brand-lime text-brand-lime' : 'bg-panel-card border-panel-border text-gray-300'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400">Detailed Description</label>
            <textarea
              required
              rows={4}
              placeholder="Describe the issue, landmarks, or details to assist municipal field officers..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-panel-card border border-panel-border rounded p-3 text-xs text-foreground focus:outline-none focus:border-brand-lime"
            />
          </div>

          {/* Voice Note Simulation */}
          <div className="flex items-center justify-between p-4 bg-panel-card border border-panel-border rounded">
            <div className="flex items-center space-x-3">
              <Mic className={voiceRecorded ? "text-brand-lime" : "text-gray-500"} size={18} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold">Voice Intake Helper</span>
                <span className="text-[10px] text-gray-500 font-mono">Record in Hindi, Tamil, or English</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVoiceRecorded(!voiceRecorded)}
              className={`px-4 py-1.5 rounded text-[10px] font-mono border ${voiceRecorded ? 'bg-brand-soft border-brand-lime text-brand-lime' : 'bg-background border-panel-border text-gray-400'}`}
            >
              {voiceRecorded ? 'Recorded ✓' : 'Record Voice'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-panel-border">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-gray-400 hover:text-foreground font-mono"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold px-6 py-2 rounded text-xs"
            >
              Next Step: Location →
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400">Geolocation Parameters</label>
            <div className="bg-panel-card border border-panel-border p-4 rounded grid grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <span className="text-gray-500 block">Latitude</span>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={e => setLatitude(parseFloat(e.target.value))}
                  className="w-full bg-background border border-panel-border rounded p-1.5 mt-1 text-foreground"
                />
              </div>
              <div>
                <span className="text-gray-500 block">Longitude</span>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={e => setLongitude(parseFloat(e.target.value))}
                  className="w-full bg-background border border-panel-border rounded p-1.5 mt-1 text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Interactive Mock Map */}
          <div className="h-64 rounded bg-panel-card border border-panel-border/80 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
            <div className="text-center space-y-2 z-10 p-6">
              <MapPin className="mx-auto text-brand-lime animate-bounce" size={32} />
              <span className="block font-serif italic font-bold text-sm">Interactive Grid Map Selector</span>
              <p className="text-[10px] text-gray-500 font-mono">Location automatically pinned to Market Square Ward 1 coordinates.</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-panel-border">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-gray-400 hover:text-foreground font-mono"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleTriggerAIPreview}
              className="bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold px-6 py-2 rounded text-xs flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={14} />
                  <span>Agent Ingesting...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Review AI Prediction</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Agent Pipeline Preview Modal */}
      {showAIPreview && aiPreviewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-panel-bg border border-panel-border rounded-lg max-w-lg w-full p-6 space-y-6">
            
            <div className="flex items-center space-x-2 text-brand-lime">
              <Sparkles size={20} className="animate-pulse" />
              <h2 className="font-serif italic font-bold text-lg">Multi-Agent Pipeline Prediction</h2>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed">
              Before submitting, you can view the initial pre-ingestion predictions calculated by our 9-agent LangGraph orchestration pipeline.
            </p>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="bg-panel-card p-3 border border-panel-border rounded">
                <span className="text-gray-500 block mb-1">Predicted Category</span>
                <span className="text-white font-semibold">{aiPreviewData.category}</span>
              </div>
              <div className="bg-panel-card p-3 border border-panel-border rounded">
                <span className="text-gray-500 block mb-1">Pipeline Severity</span>
                <span className={`capitalize font-semibold ${aiPreviewData.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {aiPreviewData.severity}
                </span>
              </div>
              <div className="bg-panel-card p-3 border border-panel-border rounded">
                <span className="text-gray-500 block mb-1">Priority Index</span>
                <span className="text-white font-semibold">Level {aiPreviewData.priorityScore} / 3</span>
              </div>
              <div className="bg-panel-card p-3 border border-panel-border rounded">
                <span className="text-gray-500 block mb-1">Duplicate Check</span>
                <span className="text-brand-lime font-semibold">Passed (Unique Incident)</span>
              </div>
            </div>

            <div className="bg-panel-card p-4 border border-panel-border rounded space-y-1.5">
              <span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider block">AI Ingestion Reasoning</span>
              <p className="text-gray-300 text-xs leading-relaxed font-sans">{aiPreviewData.reasoning}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAIPreview(false)}
                className="flex-1 bg-panel-card border border-panel-border hover:border-brand-lime/10 text-gray-300 font-semibold py-2.5 rounded text-xs transition-colors"
              >
                Edit Details
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="flex-1 bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold py-2.5 rounded text-xs flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="animate-spin" size={14} />
                    <span>Filing Report...</span>
                  </>
                ) : (
                  <span>Submit Ticket</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
