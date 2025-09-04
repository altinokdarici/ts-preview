// Console override functionality for preview environment

type ConsoleMethod = 'log' | 'error' | 'warn' | 'info';

// Capture original console methods
const originalConsole: Record<ConsoleMethod, (...args: any[]) => void> = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

function getPreviewBadge(type: ConsoleMethod): [string, string] {
  const colors: Record<ConsoleMethod, string> = {
    log: 'blue',
    error: 'red',
    warn: 'orange',
    info: 'teal'
  };

  const color = colors[type] || 'gray';
  const style = `background: ${color}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;`;

  return ["%c[PREVIEW]", style];
}

function sendConsoleToParent(type: ConsoleMethod, ...args: any[]): void {
  // Send console message to parent window
  window.parent.postMessage({
    type: 'CONSOLE_MESSAGE',
    level: type,
    args: args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    )
  }, '*');
}

// Override console methods
export function setupConsoleOverride(): void {
  console.log = (...args: any[]) => {
    originalConsole.log(...getPreviewBadge('log'), ...args);
    sendConsoleToParent('log', ...args);
  };

  console.error = (...args: any[]) => {
    originalConsole.error(...getPreviewBadge('error'), ...args);
    sendConsoleToParent('error', ...args);
  };

  console.warn = (...args: any[]) => {
    originalConsole.warn(...getPreviewBadge('warn'), ...args);
    sendConsoleToParent('warn', ...args);
  };

  console.info = (...args: any[]) => {
    originalConsole.info(...getPreviewBadge('info'), ...args);
    sendConsoleToParent('info', ...args);
  };
}

// Restore original console methods
export function restoreConsole(): void {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
}