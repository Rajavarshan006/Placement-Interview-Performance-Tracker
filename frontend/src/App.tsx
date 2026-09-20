import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudentAccessDirectory } from './pages/StudentAccessDirectory';
import { StudentAccessDetail } from './pages/StudentAccessDetail';

/**
 * Main Application Component
 *
 * Entry point for the Coordinator Access Management application.
 * Team A - Recruitment Lifecycle Management
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/coordinator/access" replace />} />
        <Route path="/coordinator/access" element={<StudentAccessDirectory />} />
        <Route path="/coordinator/access/:studentId" element={<StudentAccessDetail />} />
        <Route path="*" element={<Navigate to="/coordinator/access" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
