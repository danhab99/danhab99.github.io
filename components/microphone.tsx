"use client";
import { useEffect, useState, useRef } from "react";
import { useAddLogs } from "./log";

function useMicrophoneLevel(mediaDeviceInfo?: MediaDeviceInfo) {
  const [level, setLevel] = useState<number>(0); // normalized 0..1
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<{
    audioCtx?: AudioContext;
    analyser?: AnalyserNode;
    source?: MediaStreamAudioSourceNode;
    stream?: MediaStream;
  }>({});
  const log = useAddLogs();

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        log("no media devices in browser context");
        return;
      }

      const deviceId =
        typeof mediaDeviceInfo === "string"
          ? mediaDeviceInfo
          : mediaDeviceInfo?.deviceId;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          channelCount: 1,
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
        },
      });

      log(`opened stream to ${stream.id}`);

      const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      if (audioCtx.state === "suspended") {
        log("audio state suspended, resuming");
        await audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.05; // small smoothing on waveform

      const bufferLength = analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);

      source.connect(analyser);

      log('connected source to analyzer');

      const MIN_DB = -80;
      const SMOOTHING_FACTOR = 0.15; // smaller = smoother, slower response
      let smoothed = 0;

      const loop = () => {
        analyser.getFloatTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i];
        }

        const rms = Math.sqrt(sum / bufferLength) || 0;
        const db = rms > 0 ? 20 * Math.log10(rms) : MIN_DB;
        const normalized = Math.max(
          0,
          Math.min(1, (db - MIN_DB) / (0 - MIN_DB)),
        );

        // apply exponential smoothing
        smoothed = smoothed + SMOOTHING_FACTOR * (normalized - smoothed);

        if (mounted) setLevel(smoothed);

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);

      audioRef.current = { audioCtx, analyser, source, stream };
    })().catch((err) => {
      console.error("useMicrophoneLevel error:", err);
    });

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const { stream, source, analyser, audioCtx } = audioRef.current;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      try {
        source?.disconnect();
        analyser?.disconnect();
      } catch {}
      if (audioCtx && audioCtx.state !== "closed") audioCtx.close();
    };
  }, [
    typeof mediaDeviceInfo === "string"
      ? mediaDeviceInfo
      : mediaDeviceInfo?.deviceId,
  ]);

  return level * 100;
}

export function MicrophoneLevelTest(props: { mic: MediaDeviceInfo }) {
  const level = useMicrophoneLevel(props.mic);
  const [max, setMax] = useState(0);

  useEffect(() => {
    setMax((prev) => (level > prev ? level : prev));
  }, [level]);

  return (
    <div>
      <div>volume = {level.toFixed(1)}db</div>
      <div>max = {max.toFixed(1)}</div>
      <progress value={level} max="100">
        {level}%
      </progress>
    </div>
  );
}
