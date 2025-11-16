// V0 App utilities and configurations
export interface V0Config {
  theme: 'light' | 'dark' | 'auto';
  animations: boolean;
  reducedMotion: boolean;
  locale: string;
}

export const defaultV0Config: V0Config = {
  theme: 'auto',
  animations: true,
  reducedMotion: false,
  locale: 'en-US',
};

export function createV0App(config: Partial<V0Config> = {}): V0Config {
  return { ...defaultV0Config, ...config };
}

export function validateV0Config(config: Partial<V0Config>): boolean {
  return (
    ['light', 'dark', 'auto'].includes(config.theme || 'auto') &&
    typeof config.animations === 'boolean' &&
    typeof config.reducedMotion === 'boolean' &&
    typeof config.locale === 'string'
  );
}
