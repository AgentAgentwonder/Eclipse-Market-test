// V0 Styles barrel exports
// CSS imports are now handled dynamically by the loader
// import './globals.css';
// import './components.css';

// Export loader for conditional style loading
export { loadV0Styles, areV0StylesLoaded, preloadV0Styles, forceLoadV0Styles } from './loader';

// Re-export common CSS classes for programmatic use
export const v0Classes = {
  // Layout
  container: 'v0-container',
  grid: 'v0-grid',
  gridCols1: 'v0-grid-cols-1',
  gridCols2: 'v0-grid-cols-2',
  gridCols3: 'v0-grid-cols-3',
  gridCols4: 'v0-grid-cols-4',

  // Buttons
  button: 'v0-button',
  buttonPrimary: 'v0-button-primary v0-button',
  buttonSecondary: 'v0-button-secondary v0-button',
  buttonOutline: 'v0-button-outline v0-button',
  buttonGhost: 'v0-button-ghost v0-button',
  buttonDestructive: 'v0-button-destructive v0-button',
  buttonSm: 'v0-button-sm',
  buttonMd: 'v0-button-md',
  buttonLg: 'v0-button-lg',

  // Cards
  card: 'v0-card',
  cardHeader: 'v0-card-header',
  cardTitle: 'v0-card-title',
  cardDescription: 'v0-card-description',
  cardContent: 'v0-card-content',
  cardFooter: 'v0-card-footer',

  // Forms
  formGroup: 'v0-form-group',
  formLabel: 'v0-form-label',
  formError: 'v0-form-error',
  formHelp: 'v0-form-help',
  input: 'v0-input',

  // Navigation
  navLink: 'v0-nav-link',
  navLinkActive: 'v0-nav-link-active v0-nav-link',
  navLinkInactive: 'v0-nav-link-inactive v0-nav-link',

  // Loading
  loading: 'v0-loading',
  skeleton: 'v0-skeleton',

  // Base
  layerBase: 'v0-layer-base',
};
