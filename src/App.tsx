import React, { useState, useEffect } from "react";
import "./App.css";
import PreviewEngine from "./components/PreviewEngine";

interface FileData {
  name: string;
  content: string;
  isDirty: boolean;
  savedContent: string;
}


const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([
    {
      name: "index.tsx",
      content: `import React from 'react';
import ReactDom from 'react-dom/client';
import TodoList from './TodoList.js';

const { createRoot } = ReactDom;

const App: React.FC = () => {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{
        color: '#2563eb',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        FluentUI Todo App
      </h1>
      
      <TodoList />
    </div>
  );
};

// Create root and render
const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);`,
      isDirty: false,
      savedContent: `import React from 'react';
import ReactDom from 'react-dom/client';
import TodoList from './TodoList.js';

const { createRoot } = ReactDom;

const App: React.FC = () => {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{
        color: '#2563eb',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        FluentUI Todo App
      </h1>
      
      <TodoList />
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
      name: "types.tsx",
      content: `export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoListProps {}

export default TodoItem;`,
      isDirty: false,
      savedContent: `export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoListProps {}

export default TodoItem;`,
    },
    {
      name: "styles.tsx",
      content: `import GriffelReact from '@griffel/react';
import FluentComponents from '@fluentui/react-components';

const { makeStyles } = GriffelReact;
const { tokens } = FluentComponents;

const useStyles = makeStyles({
  container: {
    maxWidth: '400px',
    margin: '20px auto',
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  inputRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  todoItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacingVerticalS,
    borderBottom: \`1px solid \${tokens.colorNeutralStrokeAccessible}\`,
  },
  todoText: {
    flexGrow: 1,
    marginLeft: tokens.spacingHorizontalS,
    wordBreak: 'break-word',
  },
  completedText: {
    textDecoration: 'line-through',
    color: tokens.colorNeutralForegroundDisabled,
  },
  button: {
    minWidth: '80px',
  },
});

export default useStyles;`,
      isDirty: false,
      savedContent: `import GriffelReact from '@griffel/react';
import FluentComponents from '@fluentui/react-components';

const { makeStyles } = GriffelReact;
const { tokens } = FluentComponents;

const useStyles = makeStyles({
  container: {
    maxWidth: '400px',
    margin: '20px auto',
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  inputRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  todoItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacingVerticalS,
    borderBottom: \`1px solid \${tokens.colorNeutralStrokeAccessible}\`,
  },
  todoText: {
    flexGrow: 1,
    marginLeft: tokens.spacingHorizontalS,
    wordBreak: 'break-word',
  },
  completedText: {
    textDecoration: 'line-through',
    color: tokens.colorNeutralForegroundDisabled,
  },
  button: {
    minWidth: '80px',
  },
});

export default useStyles;`,
    },
    {
      name: "TodoList.tsx",
      content: `import React from 'react';
import FluentComponents from '@fluentui/react-components';
import GriffelReact from '@griffel/react';
import TodoItem from './types.js';
import useStyles from './styles.js';

const { FluentProvider, webLightTheme, Button, Input, Checkbox, tokens } = FluentComponents;
const { mergeClasses } = GriffelReact;

const TodoList: React.FC = React.memo(() => {
  const styles = useStyles();
  const [todos, setTodos] = React.useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const handleAddTodo = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Please enter a task.');
      return;
    }
    setTodos(prev => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, completed: false },
    ]);
    setInputValue('');
    setError('');
  };

  const handleToggleCompleted = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const handleRemoveTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddTodo();
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <main className={styles.container} aria-label="Todo List">
        <div className={styles.inputRow}>
          <Input
            aria-label="New task"
            placeholder="Add new task"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
          />
          <Button
            className={styles.button}
            onClick={handleAddTodo}
            aria-label="Add task"
          >
            Add
          </Button>
        </div>
        {error && (
          <div role="alert" style={{ color: tokens.colorPaletteRedForeground1 }}>
            {error}
          </div>
        )}
        <ul aria-live="polite" style={{ paddingLeft: 0, listStyle: 'none' }}>
          {todos.map(todo => (
            <li key={todo.id} className={styles.todoItem}>
              <Checkbox
                checked={todo.completed}
                onChange={() => handleToggleCompleted(todo.id)}
                aria-label={\`Mark task "\${todo.text}" as completed\`}
              />
              <span
                className={mergeClasses(
                  styles.todoText,
                  todo.completed && styles.completedText,
                )}
              >
                {todo.text}
              </span>
              <Button
                appearance="subtle"
                onClick={() => handleRemoveTodo(todo.id)}
                aria-label={\`Remove task "\${todo.text}"\`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </main>
    </FluentProvider>
  );
});

export default TodoList;`,
      isDirty: false,
      savedContent: `import React from 'react';
import FluentComponents from '@fluentui/react-components';
import GriffelReact from '@griffel/react';
import TodoItem from './types.js';
import useStyles from './styles.js';

const { FluentProvider, webLightTheme, Button, Input, Checkbox, tokens } = FluentComponents;
const { mergeClasses } = GriffelReact;

const TodoList: React.FC = React.memo(() => {
  const styles = useStyles();
  const [todos, setTodos] = React.useState<TodoItem[]>([]);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const handleAddTodo = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Please enter a task.');
      return;
    }
    setTodos(prev => [
      ...prev,
      { id: crypto.randomUUID(), text: trimmed, completed: false },
    ]);
    setInputValue('');
    setError('');
  };

  const handleToggleCompleted = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const handleRemoveTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddTodo();
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <main className={styles.container} aria-label="Todo List">
        <div className={styles.inputRow}>
          <Input
            aria-label="New task"
            placeholder="Add new task"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
          />
          <Button
            className={styles.button}
            onClick={handleAddTodo}
            aria-label="Add task"
          >
            Add
          </Button>
        </div>
        {error && (
          <div role="alert" style={{ color: tokens.colorPaletteRedForeground1 }}>
            {error}
          </div>
        )}
        <ul aria-live="polite" style={{ paddingLeft: 0, listStyle: 'none' }}>
          {todos.map(todo => (
            <li key={todo.id} className={styles.todoItem}>
              <Checkbox
                checked={todo.completed}
                onChange={() => handleToggleCompleted(todo.id)}
                aria-label={\`Mark task "\${todo.text}" as completed\`}
              />
              <span
                className={mergeClasses(
                  styles.todoText,
                  todo.completed && styles.completedText,
                )}
              >
                {todo.text}
              </span>
              <Button
                appearance="subtle"
                onClick={() => handleRemoveTodo(todo.id)}
                aria-label={\`Remove task "\${todo.text}"\`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </main>
    </FluentProvider>
  );
});

export default TodoList;`,
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+S (Mac) or Ctrl+S (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        saveFile(); // Save current active file
      }
      // Cmd+Shift+S or Ctrl+Shift+S for save all
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key === "S"
      ) {
        event.preventDefault();
        saveAllFiles();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [files, activeFileIndex]);

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
      index === activeFileIndex
        ? {
            ...file,
            content: value,
            isDirty: value !== file.savedContent,
          }
        : file
    );
    setFiles(updatedFiles);
    // No auto-execution - only mark as dirty
  };

  const saveFile = (fileIndex?: number) => {
    const indexToSave = fileIndex !== undefined ? fileIndex : activeFileIndex;
    const fileToSave = files[indexToSave];

    if (!fileToSave || !fileToSave.isDirty) {
      return; // Nothing to save
    }

    const updatedFiles = files.map((file, index) =>
      index === indexToSave
        ? {
            ...file,
            savedContent: file.content,
            isDirty: false,
          }
        : file
    );

    setFiles(updatedFiles);

    // Process files after save to trigger execution
    processFiles(updatedFiles);
  };

  const saveAllFiles = () => {
    const hasDirtyFiles = files.some((file) => file.isDirty);

    if (!hasDirtyFiles) {
      return; // Nothing to save
    }

    const updatedFiles = files.map((file) =>
      file.isDirty
        ? {
            ...file,
            savedContent: file.content,
            isDirty: false,
          }
        : file
    );

    setFiles(updatedFiles);

    // Process files after save to trigger execution
    processFiles(updatedFiles);
  };

  const addFile = () => {
    const fileName = prompt("Enter file name (e.g., foo.ts):");
    if (fileName && !files.find((f) => f.name === fileName)) {
      const newFileContent = "// New file\n";
      const newFiles = [
        ...files,
        {
          name: fileName,
          content: newFileContent,
          isDirty: false,
          savedContent: newFileContent,
        },
      ];
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
                    } ${file.isDirty ? "dirty" : ""}`}
                    onClick={() => setActiveFileIndex(index)}
                  >
                    <span className="tab-icon">📄</span>
                    <span className="tab-name">
                      {file.name}
                      {file.isDirty && (
                        <span className="dirty-indicator">•</span>
                      )}
                    </span>
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
                {files.some((file) => file.isDirty) && (
                  <span className="unsaved-indicator">
                    {files.filter((file) => file.isDirty).length} unsaved
                  </span>
                )}
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
                      } ${file.isDirty ? "dirty" : ""}`}
                      onClick={() => setActiveFileIndex(index)}
                    >
                      <span className="tree-icon">📄</span>
                      <span className="tree-name">
                        {file.name}
                        {file.isDirty && (
                          <span className="dirty-indicator">•</span>
                        )}
                      </span>
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
