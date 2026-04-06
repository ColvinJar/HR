import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AdminPage } from './pages/AdminPage';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SectorsPage } from './pages/SectorsPage';
import { TemplatesWorkspacePage } from './pages/TemplatesWorkspacePage';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/sectors" element={<SectorsPage />} />
        <Route path="/templates" element={<TemplatesWorkspacePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AppShell>
  );
}
