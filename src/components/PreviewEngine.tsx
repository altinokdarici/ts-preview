import React, { useRef, useEffect } from 'react';

interface ExternalModule {
  name: string;
  url: string;
}

interface PreviewEngineProps {
  modules: Record<string, string> | null;
  externalModules?: ExternalModule[];
  onReady?: () => void;
}

const PreviewEngine: React.FC<PreviewEngineProps> = ({ 
  modules, 
  onReady 
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isReadyRef = useRef(false);

  const executeCode = (compiledModules: Record<string, string> | null) => {
    if (!iframeRef.current?.contentWindow || !compiledModules || Object.keys(compiledModules).length === 0) {
      return;
    }

    // Send modules to iframe via postMessage
    iframeRef.current.contentWindow.postMessage({
      type: 'EXECUTE_MODULES',
      modules: compiledModules
    }, '*');
  };


  // Handle iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'READY') {
        isReadyRef.current = true;
        onReady?.();
        
        // Auto-execute modules when iframe is ready
        if (modules && Object.keys(modules).length > 0) {
          executeCode(modules);
        }
      }
      // Note: CONSOLE_MESSAGE events are sent by iframe but ignored by parent for now
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [modules, onReady]);

  // Reload iframe when modules change for clean state
  useEffect(() => {
    if (modules && Object.keys(modules).length > 0) {
      // Reload the iframe to ensure clean state (removes old import maps, etc.)
      if (iframeRef.current) {
        const currentSrc = iframeRef.current.src;
        iframeRef.current.src = '';
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = currentSrc;
            isReadyRef.current = false; // Reset ready state
          }
        }, 10);
      }
    }
  }, [modules]);

  return (
    <iframe
      ref={iframeRef}
      className="preview-output"
      sandbox="allow-scripts"
      title="JavaScript Preview"
      src="http://preview.localhost:5173/src/engine/index.html"
    />
  );
};

export default PreviewEngine;