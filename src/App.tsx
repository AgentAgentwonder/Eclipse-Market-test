import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppErrorBoundary } from '@/components';

function DummyPage() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>✅ Phase 1: AppErrorBoundary</h1>
      <p>If you see this and can click, AppErrorBoundary is OK.</p>
      <button onClick={() => alert('Button works!')}>Click me</button>
    </div>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DummyPage />} />
          <Route path="*" element={<DummyPage />} />
        </Routes>
      </HashRouter>
    </AppErrorBoundary>
  );
}

export default App;
