import React, { useEffect, useRef } from "react";
import { useAddLogs } from "./log";

type WebcamViewProps = {
  device: MediaDeviceInfo;
};

export function WebcamView({ device }: WebcamViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const log = useAddLogs();

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: device.deviceId },
          audio: false,
        });
        log(`opening video input ${stream.id}`);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          log(`playing webcam through video ${stream.id}`);
        }

        // cleanup on unmount
        return () => {
          log(`closing video input ${stream.id}`);
          stream.getTracks().forEach((track) => track.stop());
        };
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    const stop = start();
    return () => {
      // ensure cleanup even if start() fails
      stop?.then?.((fn) => typeof fn === "function" && fn());
    };
  }, [device.deviceId]);

  return (
    <video
      ref={videoRef}
      style={{
        width: "200px",
        height: "150px",
        borderRadius: "8px",
        backgroundColor: "black",
        objectFit: "cover",
      }}
      autoPlay
      playsInline
      muted
    />
  );
}
