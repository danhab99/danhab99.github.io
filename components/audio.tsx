import { useEffect, useRef, useState } from "react";

async function playToneThroughDevice(
  deviceInfo: MediaDeviceInfo,
  frequency = 440,
) {
  if (!("setSinkId" in HTMLMediaElement.prototype)) {
    throw new Error("setSinkId is not supported in this browser.");
  }

  const audio = new Audio();
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  const destination = audioCtx.createMediaStreamDestination();
  const stream = destination.stream;

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  oscillator.connect(destination);
  oscillator.start();

  audio.srcObject = stream;
  audio.loop = true;

  async function trySetSink() {
    try {
      await audio.setSinkId(deviceInfo.deviceId);
      console.log(`Audio output set to: ${deviceInfo.label}`);
      await audio.play();
    } catch (err) {
      console.warn("Failed to set sink, retrying...", err);
      await new Promise((r) => setTimeout(r, 1000));
      return trySetSink();
    }
  }

  await trySetSink();

  return () => {
    oscillator.stop();
    audio.pause();
    audio.srcObject = null;
    audioCtx.close();
  };
}

type SpeakerToneTestProps = {
  speaker: MediaDeviceInfo;
};

export function SpeakerToneTest(props: SpeakerToneTestProps) {
  const [running, setRunning] = useState(false);
  const stop = useRef(() => {});

  useEffect(() => {
    (async () => {
      if (running) {
        stop.current = await playToneThroughDevice(props.speaker);
      } else if (stop.current) {
        stop.current();
      }
    })();
  }, [running]);

  const toggle = () => setRunning((x) => !x);

  return (
    <>
      <button onClick={toggle}>{running ? "Pause" : "Play"}</button>
    </>
  );
}
