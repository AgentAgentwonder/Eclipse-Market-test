import React from 'react';
import { V0Example } from '@/v0/Example';

/**
 * V0 Test Page
 *
 * This page demonstrates the v0 styling integration with Eclipse Market Pro.
 * It automatically loads v0 styles when components are used.
 */
export const V0TestPage: React.FC = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">V0 Styling Integration Test</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            V0 Components with Eclipse Theme
          </h2>
          <p className="text-gray-300 mb-6">
            The components below use v0 styling but inherit the Eclipse Market Pro dark theme colors
            and glassmorphism effects.
          </p>

          <V0Example />
        </div>

        <div className="mt-12 p-6 glass-panel rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Integration Notes</h3>
          <ul className="text-gray-300 space-y-2">
            <li>✅ V0 styles are loaded dynamically when components are used</li>
            <li>✅ Dark theme consistency is maintained through CSS variable mapping</li>
            <li>✅ Glassmorphism effects from Eclipse theme are preserved</li>
            <li>✅ No conflicts with existing global styles</li>
            <li>✅ Tailwind utilities work seamlessly with v0 classes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
