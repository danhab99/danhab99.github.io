import React, { createContext, useContext, useReducer } from "react";

const useLogReducer = () =>
  useReducer((logs: string[], next: string) => [...logs, next], []);

const LogReducerContext = createContext<ReturnType<typeof useLogReducer>>([
  [],
  () => {},
]);

export const useLogs = () => useContext(LogReducerContext);

export function LogsProvider(props: React.PropsWithChildren<{}>) {
  const v = useLogReducer();

  return (
    <LogReducerContext.Provider value={v}>
      {props.children}
    </LogReducerContext.Provider>
  );
}
