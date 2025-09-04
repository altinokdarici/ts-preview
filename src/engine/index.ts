// Main entry point for the preview engine
import { executeModules } from "./module-executor.ts";
import { showLoading, hideLoading } from "./loading-overlay.ts";

// No service worker needed - using direct blob transpilation

// Show loading initially
showLoading();

const messageHandlers = {
  EXECUTE_MODULES: (data: { modules: Record<string, string> }) => {
    // Show loading briefly during execution
    showLoading();

    // Small delay to show loading, then execute
    setTimeout(() => {
      executeModules(data.modules);
      hideLoading();
    }, 50);
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
