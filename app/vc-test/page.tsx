"use client";
import { SpeakerToneTest } from "@/components/audio";
import { LogsProvider, useAddLogs, useLogs } from "@/components/log";
import { MicrophoneLevelTest } from "@/components/microphone";
import { WebcamView } from "@/components/video";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

function VCTest() {
  const [canGetMic, setCanGetMic] = useState<PermissionState>();
  const [canGetCamera, setCanGetCamera] = useState<PermissionState>();

  const [logs] = useLogs();
  const log = useAddLogs();

  const [devices, setDevices] = useState<MediaDeviceInfo[]>();

  useEffect(() => {
    (async () => {
      try {
        if (!("mediaDevices" in navigator)) {
          log("navigator is missing media devices");
          return;
        }
        try {
          const d = await navigator.mediaDevices.enumerateDevices();
          log(`enumerated ${d.length} devices`);
          setDevices(d);
        } catch (e) {
          log(`getting mic error: ${JSON.stringify(e)}`);
        }
      } catch (e) {
        log(`browser capabilities error: ${JSON.stringify(e)}`);
      }
    })();
  }, [canGetMic, canGetCamera]);

  const useEffectGetPerm = (
    name: string,
    set: Dispatch<SetStateAction<PermissionState | undefined>>,
  ) => {
    const h = () => {
      (async () => {
        const status = await navigator.permissions.query({ name: name as any });

        log(
          `getting existing microphone permissions: ${name} = ${status.state}`,
        );
        set(status.state);
      })();
    };

    useEffect(h, []);
    return h;
  };

  const updateCameraPerms = useEffectGetPerm("camera", setCanGetCamera);
  const updateMicPerms = useEffectGetPerm("microphone", setCanGetMic);

  const askForPermission =
    (thing: keyof MediaStreamConstraints) => async () => {
      log(`querying permission ${thing}`);

      await navigator.mediaDevices.getUserMedia({
        [thing]: true,
      });

      updateCameraPerms();
      updateMicPerms();
    };

  type ReportStatus = "good" | "borked" | "testing..." | "not active" | "cannot test" | undefined;

  const [goodDevices, setGoodDevices] = useState<Record<string, ReportStatus>>(
    {},
  );

  const reportDevice = (device: MediaDeviceInfo) => {
    const d = (report: ReportStatus) =>
      setGoodDevices((prev) => ({
        ...prev,
        [device.deviceId]: report,
      }));

    d("testing...");
    return d;
  };

  const testDevice = (info: MediaDeviceInfo) => async () => {
    const report = reportDevice(info);
    log(`testing device ${info.label} ${info.kind} ${info.deviceId}`);

    let k: keyof MediaStreamConstraints;
    switch (info.kind) {
      case "audioinput":
        k = "audio";
        break;
      case "videoinput":
        k = "video";
        break;
      case "audiooutput":
        k = "audio";
        break;
      default:
        log("wtf???");
        report("cannot test");
        throw "wrong kind of device";
    }

    const device = await navigator.mediaDevices.getUserMedia({
      [k]: info,
    });

    if (!device.active) {
      log(`${info.deviceId} is not active`);
      report("not active");
      return;
    }

    let tracks: MediaStreamTrack[];

    switch (info.kind) {
      case "audioinput":
        tracks = device.getAudioTracks();
        log(`retrieved audio tracks for ${info.deviceId} ${tracks.length}`);
        break;
      case "videoinput":
        tracks = device.getVideoTracks();
        log(`retrieved video tracks for ${info.deviceId} ${tracks.length}`);
        break;
      case "audiooutput":
        tracks = device.getAudioTracks();
        log(`retrieved audio outputs for ${info.deviceId} ${tracks.length}`);
        break;
      default:
        throw "wrong kind of device";
    }

    const hasLiveTrack = tracks.some((x) => x.readyState === "live");
    const hasAudibleTrack = tracks.some((x) => !x.muted);

    log(
      `${info.deviceId} ${hasAudibleTrack ? "has" : "doesn't have"} a live track`,
    );
    log(
      `${info.deviceId} ${hasAudibleTrack ? "has" : "doesn't have"} an audible track`,
    );
    if (hasLiveTrack && hasAudibleTrack) {
      log(`${info.deviceId} works`);
      report("good");
    } else {
      report("borked");
    }
  };

  const testAll = async () => {
    if (!devices) {
      return;
    }

    log("testing all");

    await Promise.all(devices.map(testDevice).map((x) => x()));

    log("done");
  };

  const reset = () => {
    log("reset all");
    setGoodDevices({});
  };

  return (
    <div className="center-wide pt-8">
      <div className="vctest-list">
        <div className="flex flex-row gap-2">
          <div className="rounded-lg p-4 bg-yellow-300 grow">
            {"Microphone permission: "}
            {canGetMic === "prompt" ? (
              <button onClick={askForPermission("audio")}>
                get permission
              </button>
            ) : (
              <code>{canGetMic}</code>
            )}
          </div>

          <div className="rounded-lg p-4 bg-cyan-300 grow">
            Camera permission:
            {canGetCamera === "prompt" ? (
              <button onClick={askForPermission("video")}>
                get permission
              </button>
            ) : (
              <code>{canGetCamera}</code>
            )}
          </div>
        </div>

        <div className="flex flex-row gap-4">
          <button onClick={testAll}>Test All</button>
          <button onClick={reset}>Reset</button>
        </div>

        <table className="w-full">
          <tbody>
            {devices?.map((device) => {
              let c;

              switch (goodDevices[device.deviceId]) {
                case "borked":
                  c = <span>borked</span>;
                  break;
                case "good":
                  switch (device.kind) {
                    case "audioinput":
                      c = <MicrophoneLevelTest mic={device} />;
                      break;
                    case "audiooutput":
                      c = <SpeakerToneTest speaker={device} />;
                      break;
                    case "videoinput":
                      c = <WebcamView device={device} />;
                      break;
                  }
                  break;
                case undefined:
                  c = <button onClick={testDevice(device)}>Test</button>;
              }

              return (
                <tr key={device.deviceId}>
                  <td>{c}</td>
                  <td>{device.label}</td>
                  <td>
                    <pre className="text-xs">
                      {JSON.stringify(device, null, 2)}
                    </pre>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <pre className="text-green-500 bg-black rounded-lg p-4 whitespace-nowrap overflow-x-auto">
          {logs.map((l) => (
            <div>{l}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}

export default function VCTestProvider() {
  return (
    <LogsProvider>
      <VCTest />
    </LogsProvider>
  );
}
