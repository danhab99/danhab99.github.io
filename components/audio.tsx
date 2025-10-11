import { useEffect, useRef, useState } from "react";
import { useAddLogs } from "./log";

type SpeakerToneTestProps = {
  speaker: MediaDeviceInfo;
};

export function SpeakerToneTest(props: SpeakerToneTestProps) {
  const [running, setRunning] = useState(false);
  const stop = useRef(() => {});
  const log = useAddLogs();

  useEffect(() => {
    (async () => {
      if (running) {
        if (!("setSinkId" in HTMLMediaElement.prototype)) {
          throw new Error("setSinkId is not supported in this browser.");
        }

        const audio = new Audio();
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const destination = audioCtx.createMediaStreamDestination();
        const stream = destination.stream;

        oscillator.type = "sine";
        oscillator.frequency.value = 440;
        oscillator.connect(destination);
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
      <button onClick={toggle}>{running ? "Pause" : "Play"}</button>
    </>
  );
}
