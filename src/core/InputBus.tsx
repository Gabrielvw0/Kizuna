import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type GestureCommand = 'NEXT' | 'PREV' | 'INTERACT' | 'REVEAL' | 'CONFIRM' | 'IDLE';

export interface HandCursorState {
  x: number; // 0.0 to 1.0 (screen normalized)
  y: number; // 0.0 to 1.0
  gesture: string;
  command: GestureCommand;
  progress: number; // 0.0 to 1.0 for imaginary click / stability
  isActive: boolean;
  lastUpdate: number;
}

interface InputBusContextType {
  cursor: HandCursorState;
  isWsConnected: boolean;
  onCommand: (handler: (cmd: GestureCommand, cursor: HandCursorState) => void) => () => void;
  dispatchCommand: (cmd: GestureCommand) => void;
}

const InputBusContext = createContext<InputBusContextType | undefined>(undefined);

export const InputBusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cursor, setCursor] = useState<HandCursorState>({
    x: 0.5,
    y: 0.5,
    gesture: 'NONE',
    command: 'IDLE',
    progress: 0,
    isActive: false,
    lastUpdate: 0
  });
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const handlersRef = useRef<Array<(cmd: GestureCommand, cursor: HandCursorState) => void>>([]);

  const dispatchCommand = useCallback((cmd: GestureCommand) => {
    setCursor((prev) => {
      handlersRef.current.forEach((handler) => handler(cmd, prev));
      return prev;
    });
  }, []);

  const onCommand = useCallback((handler: (cmd: GestureCommand, cursor: HandCursorState) => void) => {
    handlersRef.current.push(handler);
    return () => {
      handlersRef.current = handlersRef.current.filter((h) => h !== handler);
    };
  }, []);

  // WebSocket connection to Python gesture controller (ws://localhost:8765)
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: number | null = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;
      try {
        ws = new WebSocket('ws://localhost:8765');

        ws.onopen = () => {
          if (!isDisposed) setIsWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { x = 0.5, y = 0.5, gesture = 'NONE', cmd = 'IDLE', progress = 0 } = data;

            const normalizedCmd: GestureCommand =
              cmd === 'NEXT'
                ? 'NEXT'
                : cmd === 'PREVIOUS' || cmd === 'PREV'
                ? 'PREV'
                : cmd === 'INTERACT'
                ? 'INTERACT'
                : cmd === 'REVEAL'
                ? 'REVEAL'
                : cmd === 'CONFIRM'
                ? 'CONFIRM'
                : 'IDLE';

            const newCursor: HandCursorState = {
              x: Math.max(0, Math.min(1, x)),
              y: Math.max(0, Math.min(1, y)),
              gesture,
              command: normalizedCmd,
              progress: Math.max(0, Math.min(1, progress)),
              isActive: true,
              lastUpdate: Date.now()
            };

            setCursor(newCursor);

            if (normalizedCmd !== 'IDLE') {
              handlersRef.current.forEach((h) => h(normalizedCmd, newCursor));
            }
          } catch {
            // Ignore malformed packets
          }
        };

        ws.onclose = () => {
          if (!isDisposed) {
            setIsWsConnected(false);
            setCursor((prev) => ({ ...prev, isActive: false }));
            reconnectTimeout = window.setTimeout(connect, 9000);
          }
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        if (!isDisposed) {
          setIsWsConnected(false);
          reconnectTimeout = window.setTimeout(connect, 9000);
        }
      }
    };

    connect();

    // Inactivity watchdog for hand cursor
    const watchdog = window.setInterval(() => {
      setCursor((prev) => {
        if (prev.isActive && Date.now() - prev.lastUpdate > 1800) {
          return { ...prev, isActive: false };
        }
        return prev;
      });
    }, 500);

    return () => {
      isDisposed = true;
      if (reconnectTimeout) window.clearTimeout(reconnectTimeout);
      window.clearInterval(watchdog);
      if (ws) ws.close();
    };
  }, []);

  return (
    <InputBusContext.Provider value={{ cursor, isWsConnected, onCommand, dispatchCommand }}>
      {children}
      {/* On-screen visual indicator when camera gesture is active */}
      {cursor.isActive && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{ left: `${cursor.x * 100}vw`, top: `${cursor.y * 100}vh` }}
        >
          {/* Subtle cursor target */}
          <div className="relative flex items-center justify-center">
            <div
              className={`w-9 h-9 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                cursor.command === 'INTERACT' || cursor.command === 'CONFIRM'
                  ? 'border-emerald-400 bg-emerald-500/20 scale-125 shadow-[0_0_20px_rgba(52,211,153,0.8)]'
                  : cursor.command === 'REVEAL'
                  ? 'border-amber-400 bg-amber-500/20 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                  : 'border-red-500/80 bg-red-600/10 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  cursor.progress > 0 ? 'bg-amber-400 scale-125' : 'bg-red-400'
                }`}
              />
            </div>

            {/* Gesture feedback badge */}
            <div className="absolute top-11 px-2 py-0.5 rounded bg-slate-950/90 border border-white/20 text-[9px] font-mono font-bold tracking-wider text-slate-200 whitespace-nowrap shadow-xl">
              {cursor.gesture} {cursor.command !== 'IDLE' ? `• ${cursor.command}` : ''}
            </div>
          </div>
        </div>
      )}
    </InputBusContext.Provider>
  );
};

export const useInputBus = (): InputBusContextType => {
  const ctx = useContext(InputBusContext);
  if (!ctx) throw new Error('useInputBus must be used within an InputBusProvider');
  return ctx;
};
