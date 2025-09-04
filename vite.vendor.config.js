import { defineConfig } from 'vite'
import postbundleNamedShims from './plugins/postbundle-named-shims.js';

export default defineConfig({
  plugins: [
    postbundleNamedShims({
      specifiers: ['react', 'react-dom/client', "@griffel/react", "@fluentui/react-components"],
      shimSuffix: '.named.js',
    }),
  ],
  publicDir: false, 
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
      output: { entryFileNames: '[name].js' },
      external: []
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
})
