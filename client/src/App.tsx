import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatSidebar from './components/ChatSidebar';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import SegmentsPage from './pages/SegmentsPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-kev-bg bg-grid font-sans text-kev-text">
        <Sidebar />
        <main className="flex-1 px-10 py-8 ml-72 max-w-[1600px] mx-auto w-full transition-all duration-300">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/segments" element={<SegmentsPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          </Routes>
        </main>
        <ChatSidebar />
      </div>
    </Router>
  );
}

export default App;
