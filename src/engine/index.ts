// Main entry point for the preview engine
import { executeModules } from "./module-executor.ts";
import { showLoading, hideLoading } from "./loading-overlay.ts";

// No service worker needed - using direct blob transpilation

// Show loading initially
showLoading();

// Debounce timer for module execution
let debounceTimer: number | null = null;

const messageHandlers = {
  EXECUTE_MODULES: (data: { modules: Record<string, string> }) => {
    // Show loading immediately on first call or when not already loading
    if (!debounceTimer) {
      showLoading();
    }

    // Clear any existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Debounce the execution to prevent excessive calls
    debounceTimer = setTimeout(() => {
      executeModules(data.modules);
      hideLoading();
      debounceTimer = null;
    }, 100); // 100ms debounce delay
  },
};

// Execute modules with the provided data
window.addEventListener("message", function (event) {
  const handler =
    messageHandlers[event.data.type as keyof typeof messageHandlers];
  if (handler) {
    handler(event.data);
  } else {
    console.warn("[Engine] No handler for message type:", event.data.type);
  }
});

// Signal that we're ready to receive modules and hide initial loading
hideLoading();
window.parent.postMessage({ type: "READY" }, "*");
