import React from 'react';
import { V0Button, V0Card, V0CardHeader, V0CardTitle, V0CardContent } from '../components';
import { useV0LocalStorage } from '../hooks';
import { formatNumber } from '../lib/utils';

// Example component demonstrating v0 module usage
export const V0Example: React.FC = () => {
  const [count, setCount] = useV0LocalStorage('v0-example-count', 0);

  return (
    <div className="v0-container">
      <V0Card className="max-w-md mx-auto mt-8">
        <V0CardHeader>
          <V0CardTitle>V0 Modules Example</V0CardTitle>
        </V0CardHeader>
        <V0CardContent>
          <p className="mb-4">This component demonstrates the v0 module system.</p>
          <p className="mb-4">Count from localStorage: {count}</p>
          <div className="flex gap-2">
            <V0Button
              onClick={() => setCount(count + 1)}
              variant="primary"
            >
              Increment
            </V0Button>
            <V0Button
              onClick={() => setCount(0)}
              variant="secondary"
            >
              Reset
            </V0Button>
          </div>
        </V0CardContent>
      </V0Card>
    </div>
  );
};
