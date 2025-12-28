import { useEffect, useRef, useState } from "react";
import { useAddLogs } from "./log";

type SpeakerToneTestProps = {
  speaker: MediaDeviceInfo;
};

export function SpeakerToneTest(props: SpeakerToneTestProps) {
  const [running, setRunning] = useState(false);
  const [volume, setVolume] = useState(50);
  const stop = useRef<() => void>(() => {});
  const gainNodeRef = useRef<GainNode | null>(null);
  const log = useAddLogs();

  useEffect(() => {
    if (gainNodeRef.current) {
      // Update gain in real time when the slider changes
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    (async () => {
      if (running) {
        if (!("setSinkId" in HTMLMediaElement.prototype)) {
          throw new Error("setSinkId is not supported in this browser.");
        }

        const audio = new Audio();
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const destination = audioCtx.createMediaStreamDestination();
        const stream = destination.stream;

        // Keep ref so volume slider can affect it
        gainNodeRef.current = gainNode;

        // Initial setup
        oscillator.type = "sine";
        oscillator.frequency.value = 440;
        gainNode.gain.value = volume / 100;

        oscillator.connect(gainNode);
        gainNode.connect(destination);

        oscillator.start();

        audio.srcObject = stream;
        audio.loop = true;

        const trySetSink = async () => {
          try {
            await audio.setSinkId(props.speaker.deviceId);
            log(`Audio output set to: ${props.speaker.label}`);
            await audio.play();
          } catch (err) {
            log(`Failed to set sink, retrying... ${err}`);
            await new Promise((r) => setTimeout(r, 1000));
            return trySetSink();
          }
        };

        await trySetSink();

        stop.current = () => {
          oscillator.stop();
          audio.pause();
          audio.srcObject = null;
          audioCtx.close();
          gainNodeRef.current = null;
        };
      } else if (stop.current) {
        log("Stopping audio");
        stop.current();
      }
    })();
  }, [running]);

  const toggle = () => setRunning((x) => !x);

  return (
    <>
      <button onMouseDown={toggle} onMouseUp={toggle}>
        {running ? "Playing..." : "Play"}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
      />
    </>
  );
}
