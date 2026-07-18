import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, Mic } from 'lucide-react';
import { apiFetch, apiUpload } from '../../lib/api';
import { MapPicker, type LocationData } from '../../components/ui/MapPicker';
import { FileUpload, type FileData } from '../../components/ui/FileUpload';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { useToast } from '../../components/ui/Toast';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';

type Step = 1 | 2 | 3;

export const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [files, setFiles] = useState<FileData[]>([]);
  const [category, setCategory] = useState('Roads & Potholes');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(12.9715);
  const [longitude, setLongitude] = useState(77.5945);
  const voice = useMediaRecorder();

  const firstFileUrl = files.length > 0 ? files[0].preview : null;

  const handleSubmit = async () => {
    setSubmitting(true);

    let mediaUrl = '';
    let voiceUrl = '';

    if (files.length > 0) {
      try {
        const upRes = await apiUpload('/api/upload', files[0].file);
        if (upRes.ok) {
          const upData = await upRes.json();
          mediaUrl = upData.url;
        }
      } catch {
        toast({ type: 'warning', title: 'Media upload failed', message: 'Continuing without photo attachment' });
      }
    }

    if (voice.blobUrl) {
      try {
        const blobRes = await fetch(voice.blobUrl);
        const blob = await blobRes.blob();
        const voiceFile = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
        const upRes = await apiUpload('/api/upload', voiceFile);
        if (upRes.ok) {
          const upData = await upRes.json();
          voiceUrl = upData.url;
        }
      } catch {
        toast({ type: 'warning', title: 'Voice upload failed', message: 'Continuing without voice note' });
      }
    }

    const ticketPayload = {
      category,
      severity: 'medium',
      description,
      latitude,
      longitude,
      original_media_url: mediaUrl || null,
      voice_note_url: voiceUrl || null,
      status: 'reported',
      priority_score: 2,
      priority_reason: '',
    };

    try {
      const res = await apiFetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify(ticketPayload),
      });
      if (res.ok) {
        const created = await res.json();
        toast({ type: 'success', title: 'Report submitted', message: 'AI agents are analyzing your issue' });
        navigate(`/citizen/processing/${created.id}`);
      } else {
        const body = await res.text().catch(() => '');
        toast({ type: 'error', title: 'Submission failed', message: body || `Server returned ${res.status}` });
        setSubmitting(false);
      }
    } catch {
      toast({ type: 'error', title: 'Network error', message: 'Could not reach server. Please check your connection.' });
      setSubmitting(false);
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
      <div className="border-b border-panel-border pb-6">
        <div>
          <h1 className="text-xl font-serif italic font-bold">Report New Infrastructure Issue</h1>
          <p className="text-gray-500 text-xs mt-1">Submit civic complaints with active geolocated triggers.</p>
        </div>
      </div>

      <StepIndicator
        steps={['Evidence', 'Details', 'Location']}
        currentStep={step}
      />

      {/* Form Steps */}
      {step === 1 && (
        <div className="space-y-6">
          <FileUpload
            value={files}
            onChange={setFiles}
            maxFiles={5}
            maxSizeMB={20}
          />
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-panel-border">
            <button
              type="button"
              aria-label="Skip to details step"
              onClick={() => setStep(2)}
              className="text-xs text-gray-400 hover:text-foreground font-mono"
            >
              Skip Photo Attachment
            </button>
            <button
              type="button"
              aria-label="Next step: details"
              onClick={() => setStep(2)}
              className="bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold px-6 py-2 rounded text-xs"
            >
              Next Step: Details →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {firstFileUrl && (
            <div className="relative rounded overflow-hidden h-40 border border-panel-border">
              <img src={firstFileUrl} alt="Report Attachment Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setFiles([])}
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
                  aria-label={`Category: ${c}`}
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
              aria-label="Detailed description of the issue"
              placeholder="Describe the issue, landmarks, or details to assist municipal field officers..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-panel-card border border-panel-border rounded p-3 text-xs text-foreground focus:outline-none focus:border-brand-lime"
            />
          </div>

          {/* Voice Note */}
          <div className="flex items-center justify-between p-4 bg-panel-card border border-panel-border rounded">
            <div className="flex items-center space-x-3">
              <Mic className={voice.recording ? "text-status-escalated animate-pulse" : (voice.blobUrl ? "text-brand-lime" : "text-gray-500")} size={18} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold">Voice Note</span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {!voice.supported
                    ? 'Not supported in this browser'
                    : voice.recording
                      ? `Recording... ${voice.duration}s`
                      : voice.blobUrl
                        ? `Recorded (${voice.duration}s)`
                        : 'Describe the issue verbally'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {voice.blobUrl && (
                <>
                  <button
                    type="button"
                    onClick={voice.playing ? voice.stopPlayback : voice.playRecording}
                    className={`px-2 py-1.5 rounded text-[10px] font-mono border ${
                      voice.playing
                        ? 'bg-brand-soft border-brand-lime text-brand-lime'
                        : 'bg-background border-panel-border text-gray-400'
                    }`}
                  >
                    {voice.playing ? '⏹' : '▶'}
                  </button>
                  <button
                    type="button"
                    onClick={voice.clearRecording}
                    className="px-2 py-1.5 rounded text-[10px] font-mono bg-background border border-panel-border text-gray-500 hover:text-foreground"
                  >
                    ✕
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={voice.recording ? voice.stopRecording : voice.startRecording}
                disabled={!voice.supported}
                className={`px-3 py-1.5 rounded text-[10px] font-mono border ${
                  voice.recording
                    ? 'bg-status-escalated/10 border-status-escalated text-status-escalated'
                    : voice.blobUrl
                      ? 'bg-brand-soft border-brand-lime text-brand-lime'
                      : 'bg-background border-panel-border text-gray-400 hover:border-gray-600'
                }`}
              >
                {voice.recording ? 'Stop' : voice.blobUrl ? 'Re-record' : 'Record'}
              </button>
            </div>
          </div>
          {voice.error && <p className="text-status-escalated text-[10px] font-mono">{voice.error}</p>}

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-panel-border">
            <button
              type="button"
              aria-label="Previous step: evidence"
              onClick={() => setStep(1)}
              className="text-xs text-gray-400 hover:text-foreground font-mono"
            >
              ← Back
            </button>
            <button
              type="button"
              aria-label="Next step: location"
              onClick={() => setStep(3)}
              className="bg-brand-lime text-background hover:bg-brand-lime-hover font-semibold px-6 py-2 rounded text-xs"
            >
              Next Step: Location →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400">Pin Location</label>
            <p className="text-[10px] text-gray-500">Click the map, drag the marker, or use GPS to select the exact location.</p>
          </div>

          <MapPicker
            value={{ latitude, longitude }}
            onChange={(loc: LocationData) => {
              setLatitude(loc.latitude);
              setLongitude(loc.longitude);
            }}
          />

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-panel-border">
            <button
              type="button"
              aria-label="Previous step: details"
              onClick={() => setStep(2)}
              className="text-xs text-gray-400 hover:text-foreground font-mono"
            >
              ← Back
            </button>
            <button
              type="button"
              aria-label="Submit report"
              disabled={submitting || !description.trim()}
              onClick={handleSubmit}
              className={`font-semibold px-6 py-2 rounded text-xs flex items-center gap-1.5 ${
                submitting || !description.trim()
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-lime text-background hover:bg-brand-lime-hover'
              }`}
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={14} />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit & Process with AI →</span>
              )}
            </button>
          </div>
        </div>
      )}



    </div>
  );
};
