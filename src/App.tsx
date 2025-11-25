import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppErrorBoundary } from '@/components';
import ClientLayout from '@/layouts/ClientLayout';

function DummyPage() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>✅ Phase 2: ClientLayout Added</h1>
      <p>If you see this and can click, ClientLayout is OK.</p>
      <button onClick={() => alert('Button works!')}>Click me</button>
    </div>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <HashRouter>
        <ClientLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DummyPage />} />
            <Route path="*" element={<DummyPage />} />
          </Routes>
        </ClientLayout>
      </HashRouter>
    </AppErrorBoundary>
  );
}

export default App;
