import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

function DummyPage() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>✅ App is loading!</h1>
      <p>If you can see this and click buttons, the infinite loop is fixed.</p>
      <button onClick={() => alert('Button works!')}>Click me</button>
      <p>Next: We'll add features back one by one to find the culprit.</p>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DummyPage />} />
        <Route path="*" element={<DummyPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
