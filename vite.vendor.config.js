import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        react: require.resolve('react'),
        'react-dom/client': require.resolve('react-dom/client'),
        "@griffel/react": require.resolve('@griffel/react'),
        "@fluentui/react-components": require.resolve('@fluentui/react-components')
      },
      formats: ['es'],
    },
    outDir: 'public/static',
    emptyOutDir: false,
    rollupOptions: {
      output: { entryFileNames: '[name].js' }
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
})
