import React, { useState, useEffect } from 'react'
import './App.css'
import PreviewEngine from './components/PreviewEngine'

interface FileData {
  name: string;
  content: string;
}

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([
    {
      name: 'index.js',
      content: `import { createUserCard, createCounter } from './ui.js';

// Create main container
const app = document.createElement('div');
app.style.cssText = \`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
\`;

// Add title
const title = document.createElement('h1');
title.textContent = 'JavaScript UI Demo';
title.style.cssText = \`
  color: #2563eb;
  text-align: center;
  margin-bottom: 30px;
\`;
app.appendChild(title);

// Create user cards
const users = [
  { name: 'Alice', age: 28, role: 'Designer' },
  { name: 'Bob', age: 32, role: 'Developer' },
  { name: 'Carol', age: 25, role: 'Manager' }
];

users.forEach(user => {
  const card = createUserCard(user);
  app.appendChild(card);
});

// Add counter component
const counter = createCounter();
app.appendChild(counter);

// Add to page
document.body.appendChild(app);`
    },
    {
      name: 'ui.js',
      content: `export function createUserCard(user) {
  const card = document.createElement('div');
  card.style.cssText = \`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(0);
    transition: transform 0.2s ease;
  \`;
  
  card.innerHTML = \`
    <h3 style="margin: 0 0 10px 0; font-size: 1.4em;">\${user.name}</h3>
    <p style="margin: 5px 0; opacity: 0.9;">Age: \${user.age}</p>
    <p style="margin: 5px 0; opacity: 0.9;">Role: \${user.role}</p>
  \`;
  
  // Add hover effect
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-5px)';
    card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  });
  
  return card;
}

export function createCounter() {
  const container = document.createElement('div');
  container.style.cssText = \`
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    margin-top: 30px;
  \`;
  
  const title = document.createElement('h3');
  title.textContent = 'Interactive Counter';
  title.style.cssText = \`
    margin: 0 0 15px 0;
    color: #1e293b;
  \`;
  
  const display = document.createElement('div');
  display.textContent = '0';
  display.style.cssText = \`
    font-size: 2.5em;
    font-weight: bold;
    color: #3b82f6;
    margin: 15px 0;
  \`;
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = \`
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 15px;
  \`;
  
  let count = 0;
  
  const createButton = (text, color, onClick) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = \`
      background: \${color};
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1em;
      transition: transform 0.1s ease;
    \`;
    
    button.addEventListener('click', onClick);
    button.addEventListener('mousedown', () => {
      button.style.transform = 'scale(0.95)';
    });
    button.addEventListener('mouseup', () => {
      button.style.transform = 'scale(1)';
    });
    
    return button;
  };
  
  const incrementBtn = createButton('+1', '#10b981', () => {
    count++;
    display.textContent = count;
  });
  
  const decrementBtn = createButton('-1', '#ef4444', () => {
    count--;
    display.textContent = count;
  });
  
  const resetBtn = createButton('Reset', '#6b7280', () => {
    count = 0;
    display.textContent = count;
  });
  
  buttonContainer.appendChild(decrementBtn);
  buttonContainer.appendChild(resetBtn);
  buttonContainer.appendChild(incrementBtn);
  
  container.appendChild(title);
  container.appendChild(display);
  container.appendChild(buttonContainer);
  
  return container;
}`
    }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [compiledModules, setCompiledModules] = useState<Record<string, string> | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Process initial files
    processFiles(files)
  }, [])

  const processFiles = (files: FileData[]) => {
    // Use JavaScript files directly
    const modules: Record<string, string> = {};
    files.forEach(file => {
      modules[file.name] = file.content;
    });
    
    setCompiledModules(modules);
    setError('');
  }

  const handleInputChange = (value: string) => {
    const updatedFiles = files.map((file, index) => 
      index === activeFileIndex ? { ...file, content: value } : file
    );
    setFiles(updatedFiles);
    processFiles(updatedFiles);
  }

  const addFile = () => {
    const fileName = prompt('Enter file name (e.g., foo.ts):');
    if (fileName && !files.find(f => f.name === fileName)) {
      const newFiles = [...files, { name: fileName, content: '// New file\n' }];
      setFiles(newFiles);
      setActiveFileIndex(newFiles.length - 1);
    }
  }

  const removeFile = (index: number) => {
    if (files.length === 1) return; // Keep at least one file
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (activeFileIndex >= newFiles.length) {
      setActiveFileIndex(newFiles.length - 1);
    }
  }


  return (
    <div className="app">
      <header className="header">
        <h1>JavaScript Playground</h1>
        <p>Write JavaScript code with ES modules and see the execution results</p>
      </header>
      
      <main className="main">
        <div className="editor-container">
          <div className="code-workspace">
            <div className="workspace-header">
              <div className="file-tabs">
                {files.map((file, index) => (
                  <div 
                    key={index} 
                    className={`file-tab ${index === activeFileIndex ? 'active' : ''}`}
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
                <button className="add-tab-btn" onClick={addFile} title="New File">
                  +
                </button>
              </div>
              <div className="workspace-actions">
                <span className="file-count">{files.length} file{files.length !== 1 ? 's' : ''}</span>
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
                      className={`tree-item ${index === activeFileIndex ? 'active' : ''}`}
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
                  value={files[activeFileIndex]?.content || ''}
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
            <PreviewEngine
              modules={compiledModules}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App