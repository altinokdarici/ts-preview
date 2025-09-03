# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture Overview

This is a TypeScript Playground web application built with React and Vite. The core architecture consists of:

### Main Components
- **App.tsx** - Main React component containing the TypeScript editor, JavaScript output, and live preview
- **ts-worker.ts** - Web Worker that handles TypeScript compilation in a separate thread using the TypeScript compiler API
- **htmlTemplate.js** - Generates HTML templates for the iframe execution environment
- **main.tsx** - React application entry point

### Key Architecture Patterns

**Web Worker Pattern**: TypeScript compilation runs in a dedicated Web Worker (`ts-worker.ts`) to prevent blocking the UI. Communication uses postMessage with request IDs for tracking async operations.

**Iframe Sandboxing**: JavaScript execution happens in a sandboxed iframe with custom console capture. The iframe receives dynamically generated HTML that includes console redirection and module execution logic.

**Real-time Compilation**: Changes to TypeScript code trigger immediate compilation via the worker, with results displayed in both the JavaScript output panel and executed in the preview iframe.

### Critical Implementation Details

- TypeScript compilation uses `ts.transpile()` with ES2020 target and strict mode
- Web Worker includes timeout protection (5s) and input size limits (50KB)
- Console output capture redirects all console methods (log, error, warn, info) to DOM output
- Module execution uses dynamic imports with Blob URLs for ES module compatibility
- HTML template includes error handling for both synchronous and asynchronous execution errors

### File Structure
```
src/
├── main.tsx          # React entry point
├── App.tsx           # Main application component
├── ts-worker.ts      # TypeScript compilation worker
├── htmlTemplate.js   # HTML template generator
├── App.css          # Component styles
└── index.css        # Global styles
```

The application state management is handled entirely within the main App component using React hooks, with no external state management libraries.