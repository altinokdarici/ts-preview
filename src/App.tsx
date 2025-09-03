import React, { useState, useEffect, useRef } from 'react'
import './App.css'

const App: React.FC = () => {
  const [tsCode, setTsCode] = useState(`// Enter your TypeScript code here
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "Alice",
  age: 30
};

function greet(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}

console.log(greet(user));`)

  const [jsCode, setJsCode] = useState('')
  const [error, setError] = useState('')
  const [isCompiling, setIsCompiling] = useState(false)
  const [previewOutput, setPreviewOutput] = useState('')
  const [autoRun, setAutoRun] = useState(true)
  const workerRef = useRef<Worker | null>(null)
  const requestIdRef = useRef(0)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    // Initialize the Web Worker
    workerRef.current = new Worker(new URL('./ts-worker.ts', import.meta.url), {
      type: 'module'
    })
    
    workerRef.current.onmessage = (e) => {
      const { id, success, result, error: workerError } = e.data
      
      if (success) {
        setJsCode(result)
        setError('')
        if (autoRun) {
          executeCode(result)
        }
      } else {
        setError(workerError || 'Compilation failed')
        setJsCode('')
        setPreviewOutput('')
      }
      setIsCompiling(false)
    }

    workerRef.current.onerror = (err) => {
      setError('Worker error: ' + err.message)
      setIsCompiling(false)
    }

    // Compile initial code
    compileToJS(tsCode)

    // Cleanup worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  const compileToJS = (typescript: string) => {
    if (!workerRef.current) return
    
    setIsCompiling(true)
    const id = ++requestIdRef.current
    
    workerRef.current.postMessage({
      id,
      code: typescript,
      options: {
        target: 'ES2020',
        module: 'ES2020',
        strict: true
      }
    })
  }

  const handleInputChange = (value: string) => {
    setTsCode(value)
    compileToJS(value)
  }

  const executeCode = (code: string) => {
    if (!iframeRef.current || !code.trim()) {
      setPreviewOutput('')
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            margin: 0; 
            padding: 8px; 
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
            font-size: 12px;
            background: #1e1e1e;
            color: #d4d4d4;
          }
        </style>
      </head>
      <body>
        <div id="output"></div>
        <script>
          const output = document.getElementById('output');
          
          // Capture console methods
          const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
          };
          
          function addOutput(type, ...args) {
            const div = document.createElement('div');
            div.className = 'console-' + type;
            div.textContent = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            output.appendChild(div);
          }
          
          console.log = (...args) => {
            originalConsole.log(...args);
            addOutput('log', ...args);
          };
          
          console.error = (...args) => {
            originalConsole.error(...args);
            addOutput('error', ...args);
          };
          
          console.warn = (...args) => {
            originalConsole.warn(...args);
            addOutput('warn', ...args);
          };
          
          console.info = (...args) => {
            originalConsole.info(...args);
            addOutput('info', ...args);
          };
          
          // Execute the code with error handling
          try {
            // Create a blob URL for the ES module
            const moduleCode = \`${code.replace(/`/g, '\\`')}\`;
            const blob = new Blob([moduleCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            
            // Import and execute the module
            import(url).then(module => {
              // If the module has a default export, show it
              if (module.default !== undefined) {
                addOutput('log', '← ' + (typeof module.default === 'object' ? JSON.stringify(module.default, null, 2) : String(module.default)));
              }
              URL.revokeObjectURL(url);
            }).catch(error => {
              addOutput('error', 'Module Error: ' + error.message);
              URL.revokeObjectURL(url);
            });
          } catch (error) {
            addOutput('error', 'Error: ' + error.message);
          }
        </script>
      </body>
      </html>
    `;

    iframeRef.current.srcdoc = htmlContent;
  }

  const clearPreview = () => {
    setPreviewOutput('')
    if (iframeRef.current) {
      iframeRef.current.srcdoc = '';
    }
  }

  const runCode = () => {
    if (jsCode) {
      executeCode(jsCode)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>TypeScript Playground</h1>
        <p>Write TypeScript code, see the compiled JavaScript, and preview the execution results</p>
      </header>
      
      <main className="main">
        <div className="editor-container">
          <div className="input-section">
            <h2>TypeScript Input</h2>
            <textarea
              value={tsCode}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter your TypeScript code here..."
              className="code-editor"
            />
          </div>
          
          <div className="output-section">
            <h2>
              JavaScript Output 
              {isCompiling && <span className="compiling-indicator">● Compiling...</span>}
            </h2>
            {error ? (
              <div className="error">
                <strong>Error:</strong> {error}
              </div>
            ) : (
              <pre className="code-output">{jsCode}</pre>
            )}
          </div>

          <div className="preview-section">
            <h2>JavaScript Preview</h2>
            <div className="preview-controls">
              <button 
                className={`preview-btn ${autoRun ? 'primary' : ''}`}
                onClick={() => setAutoRun(!autoRun)}
              >
                {autoRun ? 'Auto Run: ON' : 'Auto Run: OFF'}
              </button>
              <button className="preview-btn" onClick={runCode}>
                Run Code
              </button>
              <button className="preview-btn" onClick={clearPreview}>
                Clear
              </button>
            </div>
            <iframe
              ref={iframeRef}
              className="preview-output"
              sandbox="allow-scripts"
              title="JavaScript Preview"
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App