/**
 * V0 Styles Manager
 *
 * This utility provides conditional loading of v0 styles to prevent
 * conflicts with the main Eclipse Market Pro theme.
 */

let v0StylesLoaded = false;
let v0StylesImported = false;

/**
 * Import v0 styles CSS files (internal use)
 */
const importV0Styles = async (): Promise<void> => {
  if (v0StylesImported) {
    return;
  }

  try {
    // Import the CSS files directly
    await import('./globals.css?inline');
    await import('./components.css?inline');
    v0StylesImported = true;
  } catch (error) {
    console.error('Failed to import v0 CSS files:', error);
    throw error;
  }
};

/**
 * Load v0 styles dynamically
 * Call this when v0 components are first used
 */
export const loadV0Styles = async (): Promise<void> => {
  if (v0StylesLoaded) {
    return;
  }

  try {
    await importV0Styles();
    v0StylesLoaded = true;
    console.log('V0 styles loaded successfully');
  } catch (error) {
    console.error('Failed to load v0 styles:', error);
    throw error;
  }
};

/**
 * Check if v0 styles are loaded
 */
export const areV0StylesLoaded = (): boolean => {
  return v0StylesLoaded;
};

/**
 * Preload v0 styles (optional - call during app initialization if you know v0 will be used)
 */
export const preloadV0Styles = (): void => {
  // Don't block the main thread, load asynchronously
  loadV0Styles().catch(console.error);
};

/**
 * Force load v0 styles synchronously (for testing or immediate needs)
 */
export const forceLoadV0Styles = (): void => {
  if (!v0StylesLoaded) {
    // Create link elements for immediate loading
    const globalsLink = document.createElement('link');
    globalsLink.rel = 'stylesheet';
    globalsLink.href = '/src/v0/styles/globals.css';

    const componentsLink = document.createElement('link');
    componentsLink.rel = 'stylesheet';
    componentsLink.href = '/src/v0/styles/components.css';

    document.head.appendChild(globalsLink);
    document.head.appendChild(componentsLink);

    v0StylesLoaded = true;
    v0StylesImported = true;
  }
};
