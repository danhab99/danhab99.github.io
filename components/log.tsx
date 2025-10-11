import React, { createContext, useContext, useReducer } from "react";

const useLogReducer = () =>
  useReducer((logs: string[], next: string) => [...logs, next], []);

const LogReducerContext = createContext<ReturnType<typeof useLogReducer>>([
  [],
  () => {},
]);

export const useLogs = () => useContext(LogReducerContext);

export const useAddLogs = () => {
  const [, addLog] = useLogs();
  return (s: string) => addLog(`${new Date().toLocaleString()}: ${s}`);
};

export function LogsProvider(props: React.PropsWithChildren<{}>) {
  const v = useLogReducer();

  return (
    <LogReducerContext.Provider value={v}>
      {props.children}
    </LogReducerContext.Provider>
  );
}
