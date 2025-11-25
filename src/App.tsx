import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppErrorBoundary } from '@/components';
import { AccessibilityProvider } from '@/components/providers/AccessibilityProvider';
import { APIProvider } from '@/lib/api-context';
import ClientLayout from '@/layouts/ClientLayout';
import Dashboard from '@/pages/Dashboard';

function App() {
  return (
    <AppErrorBoundary>
      <APIProvider>
        <AccessibilityProvider>
          <HashRouter>
            <ClientLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </ClientLayout>
          </HashRouter>
        </AccessibilityProvider>
      </APIProvider>
    </AppErrorBoundary>
  );
}

export default App;
