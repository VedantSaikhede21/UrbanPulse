import { useState, useCallback, useRef } from 'react';

interface MediaRecorderState {
  recording: boolean;
  duration: number;
  blobUrl: string | null;
  blob: Blob | null;
  playing: boolean;
  error: string | null;
  supported: boolean;
}

export function useMediaRecorder() {
  const [state, setState] = useState<MediaRecorderState>({
    recording: false,
    duration: 0,
    blobUrl: null,
    blob: null,
    playing: false,
    error: null,
    supported: typeof MediaRecorder !== 'undefined',
  });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval>>();
  const startTime = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    try {
      chunks.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        if (state.blobUrl) URL.revokeObjectURL(state.blobUrl);
        const url = URL.createObjectURL(blob);
        setState(prev => ({ ...prev, recording: false, blobUrl: url, blob, playing: false }));
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timer.current);
      };

      mediaRecorder.current.start();
      startTime.current = Date.now();
      timer.current = setInterval(() => {
        setState(prev => ({ ...prev, duration: Math.floor((Date.now() - startTime.current) / 1000) }));
      }, 1000);

      setState(prev => ({ ...prev, recording: true, error: null }));
    } catch (err) {
      const message = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Microphone permission denied'
        : 'Could not start recording';
      setState(prev => ({ ...prev, error: message, recording: false }));
    }
  }, [state.blobUrl]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
  }, []);

  const playRecording = useCallback(() => {
    if (!state.blobUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(state.blobUrl);
    audioRef.current = audio;
    audio.onended = () => setState(prev => ({ ...prev, playing: false }));
    audio.onerror = () => setState(prev => ({ ...prev, playing: false }));
    audio.play();
    setState(prev => ({ ...prev, playing: true }));
  }, [state.blobUrl]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setState(prev => ({ ...prev, playing: false }));
  }, []);

  const clearRecording = useCallback(() => {
    stopPlayback();
    if (state.blobUrl) URL.revokeObjectURL(state.blobUrl);
    chunks.current = [];
    setState(prev => ({ ...prev, blobUrl: null, blob: null, duration: 0, error: null, playing: false }));
  }, [state.blobUrl, stopPlayback]);

  return {
    ...state,
    startRecording,
    stopRecording,
    playRecording,
    stopPlayback,
    clearRecording,
  };
}
