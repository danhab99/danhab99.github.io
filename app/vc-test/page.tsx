"use client";
import {
  Dispatch,
  Reducer,
  SetStateAction,
  useEffect,
  useReducer,
  useState,
} from "react";

enum BrowserCapabilities {
  Error = 0,
  NoMediaDevice,
}

export default function VCTest() {
  const [browserCapabilitiesState, setBrowserCapabilitiesState] =
    useState<BrowserCapabilities>();
  const [canGetMic, setCanGetMic] = useState<PermissionState>();
  const [canGetCamera, setCanGetCamera] = useState<PermissionState>();

  const [logs, addLog] = useReducer(
    (logs: string[], next: string) => [...logs, next],
    [],
  );

  const log = (s: string) => addLog(`${new Date().toLocaleString()}: ${s}`);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>();

  useEffect(() => {
    (async () => {
      try {
        if (!("mediaDevices" in navigator)) {
          setBrowserCapabilitiesState(BrowserCapabilities.NoMediaDevice);
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
        setBrowserCapabilitiesState(BrowserCapabilities.Error);
        log(`browser capabilities error: ${JSON.stringify(e)}`);
      }
    })();
  }, [canGetMic, canGetCamera]);

  const useEffectGetPerm = (
    name: PermissionName,
    set: Dispatch<SetStateAction<PermissionState | undefined>>,
  ) => {
    const h = () => {
      (async () => {
        const status = await navigator.permissions.query({ name });

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

  const [goodDevices, setGoodDevices] = useState<
    Record<string, string | undefined>
  >({});

  const reportDevice = (device: MediaDeviceInfo) => {
    const d = (report: string) =>
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
    debugger;

    let k: keyof MediaStreamConstraints;
    switch (info.kind) {
      case "audioinput":
        k = "audio";
        break;
      case "videoinput":
        k = "video";
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

  return (
    <div className="center-wide pt-8">
      <div className="vctest-list">
        <div className="rounded-lg p-4 bg-yellow-300">
          Microphone permission:
          {canGetMic === "prompt" ? (
            <button onClick={askForPermission("audio")}>prompt</button>
          ) : (
            <code>{canGetMic}</code>
          )}
        </div>

        <div className="rounded-lg p-4 bg-cyan-300">
          Camera permission:
          {canGetCamera === "prompt" ? (
            <button onClick={askForPermission("video")}>prompt</button>
          ) : (
            <code>{canGetCamera}</code>
          )}
        </div>

        <table>
          <tbody>
            {devices?.map((device) => (
              <tr key={device.deviceId}>
                <td>
                  {goodDevices[device.deviceId]?.length ? (
                    goodDevices[device.deviceId]
                  ) : (
                    <button onClick={testDevice(device)}>Test</button>
                  )}
                </td>
                <td>{device.label}</td>
                <td>
                  <pre className="text-xs">
                    {JSON.stringify(device, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <pre className="text-green-500 bg-black rounded-lg p-4">
          {logs.map((l) => (
            <div>{l}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}
