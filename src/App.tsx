import React, { useState, useEffect } from "react";
import "./App.css";
import PreviewEngine from "./components/PreviewEngine";

interface FileData {
  name: string;
  content: string;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([
    {
      name: "index.tsx",
      content: `import React from 'react';
import ReactDom from 'react-dom/client';
import { UserCard, Counter } from './ui.js';

console.log(ReactDom);
const { createRoot } = ReactDom;
interface User {
  name: string;
  age: number;
  role: string;
}

const App: React.FC = () => {
  const users: User[] = [
    { name: 'Alice', age: 28, role: 'Designer' },
    { name: 'Bob', age: 32, role: 'Developer' },
    { name: 'Carol', age: 25, role: 'Manager' }
  ];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1 style={{
        color: '#2563eb',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        React TypeScript Demo
      </h1>
      
      {users.map((user, index) => (
        <UserCard key={index} user={user} />
      ))}
      
      <Counter />
    </div>
  );
};

// Create root and render
const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);`,
    },
    {
      name: "ui.tsx",
      content: `import React from 'react';

interface User {
  name: string;
  age: number;
  role: string;
}

interface UserCardProps {
  user: User;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '15px',
    boxShadow: isHovered 
      ? '0 8px 24px rgba(0, 0, 0, 0.2)' 
      : '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4em' }}>
        {user.name}
      </h3>
      <p style={{ margin: '5px 0', opacity: 0.9 }}>
        Age: {user.age}
      </p>
      <p style={{ margin: '5px 0', opacity: 0.9 }}>
        Role: {user.role}
      </p>
    </div>
  );
};

export const Counter: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [buttonPressed, setButtonPressed] = React.useState<string | null>(null);

  const containerStyle: React.CSSProperties = {
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    marginTop: '30px'
  };

  const buttonStyle = (color: string, pressed: boolean): React.CSSProperties => ({
    background: color,
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    margin: '0 5px',
    transform: pressed ? 'scale(0.95)' : 'scale(1)',
    transition: 'transform 0.1s ease'
  });

  const handleButtonPress = (buttonType: string, action: () => void) => {
    setButtonPressed(buttonType);
    action();
    setTimeout(() => setButtonPressed(null), 100);
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>
        Interactive Counter
      </h3>
      
      <div style={{
        fontSize: '2.5em',
        fontWeight: 'bold',
        color: '#3b82f6',
        margin: '15px 0'
      }}>
        {count}
      </div>
      
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginTop: '15px'
      }}>
        <button
          style={buttonStyle('#ef4444', buttonPressed === 'decrement')}
          onClick={() => handleButtonPress('decrement', () => setCount(count - 1))}
        >
          -1
        </button>
        
        <button
          style={buttonStyle('#6b7280', buttonPressed === 'reset')}
          onClick={() => handleButtonPress('reset', () => setCount(0))}
        >
          Reset
        </button>
        
        <button
          style={buttonStyle('#10b981', buttonPressed === 'increment')}
          onClick={() => handleButtonPress('increment', () => setCount(count + 1))}
        >
          +1
        </button>
      </div>
    </div>
  );
};`,
    },
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [compiledModules, setCompiledModules] = useState<Record<
    string,
    string
  > | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Process initial files
    processFiles(files);
  }, []);

  const processFiles = (files: FileData[]) => {
    // Use JavaScript files directly
    const modules: Record<string, string> = {};
    files.forEach((file) => {
      modules[file.name] = file.content;
    });

    setCompiledModules(modules);
    setError("");
  };

  const handleInputChange = (value: string) => {
    const updatedFiles = files.map((file, index) =>
      index === activeFileIndex ? { ...file, content: value } : file
    );
    setFiles(updatedFiles);
    processFiles(updatedFiles);
  };

  const addFile = () => {
    const fileName = prompt("Enter file name (e.g., foo.ts):");
    if (fileName && !files.find((f) => f.name === fileName)) {
      const newFiles = [...files, { name: fileName, content: "// New file\n" }];
      setFiles(newFiles);
      setActiveFileIndex(newFiles.length - 1);
    }
  };

  const removeFile = (index: number) => {
    if (files.length === 1) return; // Keep at least one file
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (activeFileIndex >= newFiles.length) {
      setActiveFileIndex(newFiles.length - 1);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Typescript Playground</h1>
        <p>
          Write Typescript code with ES modules and see the execution results
        </p>
      </header>

      <main className="main">
        <div className="editor-container">
          <div className="code-workspace">
            <div className="workspace-header">
              <div className="file-tabs">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`file-tab ${
                      index === activeFileIndex ? "active" : ""
                    }`}
                    onClick={() => setActiveFileIndex(index)}
                  >
                    <span className="tab-icon">📄</span>
                    <span className="tab-name">{file.name}</span>
                    {files.length > 1 && (
                      <button
                        className="tab-close"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        title="Close file"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="add-tab-btn"
                  onClick={addFile}
                  title="New File"
                >
                  +
                </button>
              </div>
              <div className="workspace-actions">
                <span className="file-count">
                  {files.length} file{files.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="code-area">
              <div className="file-sidebar">
                <div className="sidebar-header">
                  <span>📁 Files</span>
                </div>
                <div className="file-tree">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className={`tree-item ${
                        index === activeFileIndex ? "active" : ""
                      }`}
                      onClick={() => setActiveFileIndex(index)}
                    >
                      <span className="tree-icon">📄</span>
                      <span className="tree-name">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="editor-main">
                <textarea
                  value={files[activeFileIndex]?.content || ""}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Enter your TypeScript code here..."
                  className="code-editor"
                />
              </div>
            </div>
          </div>

          <div className="preview-section">
            <div className="preview-header">
              <h2>Preview</h2>
            </div>
            <PreviewEngine modules={compiledModules} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
