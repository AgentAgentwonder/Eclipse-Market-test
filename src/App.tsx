import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppErrorBoundary } from '@/components';
import { APIProvider } from '@/lib/api-context';
import ClientLayout from '@/layouts/ClientLayout';

function DummyPage() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>✅ Phase 2: ClientLayout</h1>
      <p>If you see this and can click, ClientLayout is working.</p>
      <button onClick={() => alert('Button works!')}>Click me</button>
    </div>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <APIProvider>
        <HashRouter>
          <ClientLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DummyPage />} />
              <Route path="*" element={<DummyPage />} />
            </Routes>
          </ClientLayout>
        </HashRouter>
      </APIProvider>
    </AppErrorBoundary>
  );
}

export default App;
