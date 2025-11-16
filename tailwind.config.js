module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@solana/wallet-adapter-react-ui/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        'solana-purple': '#9945FF',
        'solana-green': '#14F195',
        'deep-space': 'var(--color-deep-space, #050810)',
        'eclipse-orange': 'var(--color-eclipse-orange, #FF6B35)',
        'moonlight-silver': 'var(--color-moonlight-silver, #C0CCDA)',
        'shadow-accent': 'var(--color-shadow-accent, #1F2937)',
        // V0 compatible color tokens
        background: 'var(--color-background, #0a0e1a)',
        foreground: 'var(--color-text, #e8ebf0)',
        card: 'var(--color-background-secondary, #121826)',
        'card-foreground': 'var(--color-text, #e8ebf0)',
        popover: 'var(--color-background-secondary, #121826)',
        'popover-foreground': 'var(--color-text, #e8ebf0)',
        primary: {
          DEFAULT: 'var(--color-primary, #ff6b35)',
          foreground: 'var(--color-background, #0a0e1a)',
        },
        secondary: {
          DEFAULT: 'var(--color-background-tertiary, #1a2235)',
          foreground: 'var(--color-text, #e8ebf0)',
        },
        muted: {
          DEFAULT: 'var(--color-background-tertiary, #1a2235)',
          foreground: 'var(--color-text-muted, #8b92a3)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #ff8c42)',
          foreground: 'var(--color-background, #0a0e1a)',
        },
        destructive: {
          DEFAULT: 'var(--color-error, #ff6b6b)',
          foreground: 'var(--color-background, #0a0e1a)',
        },
        border: 'var(--color-border, #2a3447)',
        input: 'var(--color-border, #2a3447)',
        ring: 'var(--color-accent, #ff8c42)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'lunar-gradient': 'linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-middle), var(--color-gradient-end))',
        'eclipse-radial': 'radial-gradient(circle at 30% 50%, var(--color-eclipse-orange), transparent 50%)',
      },
      boxShadow: {
        'glow-subtle': '0 0 15px rgba(255, 107, 53, 0.2)',
        'glow-normal': '0 0 25px rgba(255, 107, 53, 0.4)',
        'glow-strong': '0 0 35px rgba(255, 107, 53, 0.65)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      keyframes: {
        'v0-fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'v0-fade-out': {
          'from': { opacity: '1' },
          'to': { opacity: '0' },
        },
        'v0-slide-in-from-top': {
          'from': { transform: 'translateY(-100%)' },
          'to': { transform: 'translateY(0)' },
        },
        'v0-slide-out-to-top': {
          'from': { transform: 'translateY(0)' },
          'to': { transform: 'translateY(-100%)' },
        },
        'v0-spin': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'v0-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'v0-fade-in': 'v0-fade-in 0.2s ease-out',
        'v0-fade-out': 'v0-fade-out 0.2s ease-out',
        'v0-slide-in-from-top': 'v0-slide-in-from-top 0.2s ease-out',
        'v0-slide-out-to-top': 'v0-slide-out-to-top 0.2s ease-out',
        'v0-spin': 'v0-spin 1s linear infinite',
        'v0-pulse': 'v0-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
