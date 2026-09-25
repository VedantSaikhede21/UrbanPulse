import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader, Mic } from 'lucide-react';
import { apiFetch, apiUpload } from '../../lib/api';
import { MapPicker, type LocationData } from '../../components/ui/MapPicker';
import { FileUpload, type FileData } from '../../components/ui/FileUpload';
import { StepIndicator } from '../../components/ui/StepIndicator';
import { useToast } from '../../components/ui/Toast';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { CITY_CENTER } from '../../lib/city';

type Step = 1 | 2 | 3 | 4;

export const ReportIssue: React.FC = () => {
  useDocumentTitle('Report Issue');
  const navigate = useNavigate();
  const { toast } = useToast();
  const breadcrumbs = useBreadcrumbs();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [files, setFiles] = useState<FileData[]>([]);
  const [category, setCategory] = useState('Roads & Potholes');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(CITY_CENTER.lat);
  const [longitude, setLongitude] = useState(CITY_CENTER.lng);
  const [address, setAddress] = useState<string | undefined>();
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voice = useMediaRecorder();

  const handleLocationChange = useCallback((loc: LocationData) => {
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setAddress(loc.address);
    setLocationConfirmed(true);
  }, []);

  const firstFileUrl = files.length > 0 ? files[0].preview : null;

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({ type: 'error', title: 'Description required', message: 'Add a short description of the issue before submitting.' });
      return;
    }
    if (!locationConfirmed) {
      toast({ type: 'error', title: 'Location not confirmed', message: 'Tap the map or use GPS to confirm your location before submitting.' });
      return;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      toast({ type: 'error', title: 'Invalid location', message: 'Coordinates are out of range. Please re-pin the location on the map.' });
      return;
    }
    setSubmitting(true);

    let mediaUrl = '';
    let voiceUrl = '';

    if (files.length > 0) {
      try {
        const upRes = await apiUpload('/api/upload', files[0].file);
        if (upRes.ok) {
          const upData = await upRes.json();
          mediaUrl = upData.url;
          setMediaError(null);
        } else {
          const detail = await upRes.text().catch(() => '');
          setMediaError(`Photo upload failed (HTTP ${upRes.status}). The report will be submitted without the photo.${detail ? ` Server said: ${detail.slice(0, 200)}` : ''}`);
          toast({ type: 'error', title: 'Photo upload failed', message: `Server returned ${upRes.status}. Continuing without photo attachment.` });
        }
      } catch {
        setMediaError('Photo upload failed. The report will be submitted without the photo.');
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
          setVoiceError(null);
        } else {
          const detail = await upRes.text().catch(() => '');
          setVoiceError(`Voice note upload failed (HTTP ${upRes.status}). The report will be submitted without the voice note.${detail ? ` Server said: ${detail.slice(0, 200)}` : ''}`);
          toast({ type: 'error', title: 'Voice upload failed', message: `Server returned ${upRes.status}. Continuing without voice note.` });
        }
      } catch {
        setVoiceError('Voice note upload failed. The report will be submitted without the voice note.');
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
        toast({ type: 'success', title: 'Report submitted', message: 'We have it. You can follow every step from your dashboard.' });
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
      
      <Breadcrumbs items={breadcrumbs} />
      {/* Header */}
      <div className="border-b border-border-default pb-6">
        <div>
          <h1 className="text-xl font-serif italic font-bold">Report an issue</h1>
          <p className="mt-1 text-body-sm text-text-secondary">Takes about a minute. Add a photo and a map pin so the right team finds it first time.</p>
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
            maxFiles={1}
            maxSizeMB={20}
            multi={false}
          />
          <p className="text-[10px] font-mono text-text-tertiary">
            {files.length > 0 ? '1 photo selected — will be attached to the report.' : 'One photo is supported per report.'}
          </p>
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-border-default">
            <button
              type="button"
              aria-label="Skip to details step"
              onClick={() => setStep(2)}
              className="focus-ring -my-2 inline-flex min-h-[44px] items-center rounded-md px-2 font-mono text-xs text-text-tertiary hover:text-foreground"
            >
              Skip Photo Attachment
            </button>
            <button
              type="button"
              aria-label="Next step: details"
              onClick={() => setStep(2)}
              className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-brand-lime px-6 font-semibold text-sm text-background hover:bg-brand-lime-hover"
            >
              Next: details →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {firstFileUrl && (
            <div className="relative rounded overflow-hidden h-40 border border-border-default">
              <img src={firstFileUrl} alt="Report Attachment Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setFiles([])}
                aria-label="Remove photo attachment"
                className="focus-ring absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 text-[10px] hover:bg-black"
              >
                ✕ Remove
              </button>
            </div>
          )}

          <div className="space-y-2">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
              Issue category
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Issue category">
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                  className={`focus-ring flex min-h-[44px] items-center justify-between gap-2 rounded border p-3 text-left text-sm font-medium transition-all duration-150 ${category === c
                    ? 'border-brand-lime bg-brand-soft text-brand-lime'
                    : 'border-border-default bg-panel-card text-text-secondary hover:border-border-hover hover:text-foreground'
                  }`}
                >
                  {c}
                  {category === c && <CheckCircle2 size={15} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {/* htmlFor/id pair: the visible label was previously unassociated,
                so a screen reader only heard the aria-label. */}
            <label htmlFor="issue-description" className="flex items-baseline justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
              <span>Detailed description</span>
              <span className={`text-[10px] font-normal ${description.length > 1800 ? 'text-status-progress' : ''}`}>
                {description.length}/2000
              </span>
            </label>
            <textarea
              id="issue-description"
              name="description"
              required
              rows={4}
              maxLength={2000}
              placeholder="Describe the issue, nearby landmarks, or anything that helps the field team find it."
              value={description}
              onChange={e => setDescription(e.target.value)}
              aria-describedby="issue-description-hint"
              // text-base (16px) prevents iOS Safari from zooming the page on focus
              className="focus-ring w-full rounded border border-border-default bg-panel-card p-3 text-base text-foreground placeholder:text-text-quaternary sm:text-sm"
            />
            <p id="issue-description-hint" className="text-caption text-text-quaternary">
              A sentence or two is enough. Mention a landmark if it helps.
            </p>
          </div>

          {/* Voice Note */}
          <div className="flex items-center justify-between p-4 bg-panel-card border border-border-default rounded">
            <div className="flex items-center space-x-3">
              <Mic className={voice.recording ? "text-status-escalated animate-pulse" : (voice.blobUrl ? "text-brand-lime" : "text-text-tertiary")} size={18} />
              <div className="flex flex-col">
                <h2 className="text-xs font-semibold">Voice Note</h2>
                <span className="text-[10px] text-text-tertiary font-mono">
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
                    aria-label={voice.playing ? 'Stop playback' : 'Play recording'}
                    className={`focus-ring px-2 py-1.5 rounded text-[10px] font-mono border ${
                      voice.playing
                        ? 'bg-brand-soft border-brand-lime text-brand-lime'
                        : 'bg-background border-border-default text-text-tertiary'
                    }`}
                  >
                    {voice.playing ? '⏹' : '▶'}
                  </button>
                  <button
                    type="button"
                    onClick={voice.clearRecording}
                    aria-label="Clear voice recording"
                    className="focus-ring px-2 py-1.5 rounded text-[10px] font-mono bg-background border border-border-default text-text-tertiary hover:text-foreground"
                  >
                    ✕
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={voice.recording ? voice.stopRecording : voice.startRecording}
                disabled={!voice.supported}
                className={`focus-ring px-3 py-1.5 rounded text-[10px] font-mono border ${
                  voice.recording
                    ? 'bg-status-escalated/10 border-status-escalated text-status-escalated'
                    : voice.blobUrl
                      ? 'bg-brand-soft border-brand-lime text-brand-lime'
                      : 'bg-background border-border-default text-text-tertiary hover:border-border-hover'
                }`}
              >
                {voice.recording ? 'Stop' : voice.blobUrl ? 'Re-record' : 'Record'}
              </button>
            </div>
          </div>
          {voice.error && <p className="text-status-escalated text-[10px] font-mono">{voice.error}</p>}

          {(mediaError || voiceError) && (
            <div className="space-y-1.5 rounded border border-status-escalated/30 bg-status-escalated/5 p-3">
              {mediaError && <p className="text-status-escalated text-[10px] font-mono">⚠ {mediaError}</p>}
              {voiceError && <p className="text-status-escalated text-[10px] font-mono">⚠ {voiceError}</p>}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-border-default">
            <button
              type="button"
              aria-label="Previous step: evidence"
              onClick={() => setStep(1)}
              className="focus-ring -my-2 inline-flex min-h-[44px] items-center rounded-md px-2 font-mono text-xs text-text-tertiary hover:text-foreground"
            >
              ← Back
            </button>
            <button
              type="button"
              aria-label="Next step: location"
              onClick={() => setStep(3)}
              className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-lg bg-brand-lime px-6 font-semibold text-sm text-background hover:bg-brand-lime-hover"
            >
              Next: location →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary">Pin Location</label>
            <p className="text-[10px] text-text-tertiary">Click the map, drag the marker, or use GPS to select the exact location.</p>
          </div>

          <MapPicker
            value={locationConfirmed ? { latitude, longitude, address } : undefined}
            onChange={handleLocationChange}
          />

          {!locationConfirmed && (
            <p className="text-[10px] font-mono text-status-escalated" role="status">
              ⚠ Location not confirmed yet — tap the map or use GPS to pin your exact location before submitting.
            </p>
          )}

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-border-default">
            <button
              type="button"
              aria-label="Previous step: details"
              onClick={() => setStep(2)}
              className="focus-ring -my-2 inline-flex min-h-[44px] items-center rounded-md px-2 font-mono text-xs text-text-tertiary hover:text-foreground"
            >
              ← Back
            </button>
            <button
              type="button"
              aria-label="Submit report"
              disabled={submitting}
              onClick={handleSubmit}
              className={`focus-ring inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-6 text-sm font-semibold ${
                submitting
                  ? 'cursor-not-allowed bg-surface-elevated text-text-quaternary'
                  : 'bg-brand-lime text-background hover:bg-brand-lime-hover'
              }`}
            >
              {submitting ? (
                <span role="status" aria-live="polite" className="flex items-center gap-1.5">
                  <Loader className="animate-spin" size={14} />
                  <span>Submitting…</span>
                </span>
              ) : (
                <span>Submit report</span>
              )}
            </button>
          </div>

          {/* The attachment warnings used to render only on step 2, but the
              upload actually runs on step 3 — so a citizen who lost their photo
              never saw the warning and believed it was attached. */}
          {(mediaError || voiceError) && (
            <div
              role="alert"
              className="mt-4 space-y-1.5 rounded-lg border border-status-progress/30 bg-status-progress/10 p-3"
            >
              <p className="text-body-sm font-medium text-status-progress">
                Your report will be submitted without {mediaError ? 'the photo' : 'the voice note'}.
              </p>
              {mediaError && <p className="text-caption text-text-secondary">{mediaError}</p>}
              {voiceError && <p className="text-caption text-text-secondary">{voiceError}</p>}
              <p className="text-caption text-text-tertiary">
                Go back and re-attach it if the attachment matters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
