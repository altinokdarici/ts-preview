export const createHtmlTemplate = (modules: Record<string, string>): string => {
  // Return the base URL for the engine files
  // The iframe will load index.html from the engine directory
  return new URL('./engine/index.html', import.meta.url).href;
};