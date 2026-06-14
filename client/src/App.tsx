import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Lenis from 'lenis';
import Sidebar from './components/Sidebar';
import ChatSidebar from './components/ChatSidebar';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import SegmentsPage from './pages/SegmentsPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import AutomationsPage from './pages/AutomationsPage';

const Star = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`absolute pointer-events-none ${className}`} style={style}>
    <path d="M50 8L60.5 38.5H93L67.5 57L77 88L50 70L23 88L32.5 57L7 38.5H39.5L50 8Z" fill="#F4CA5D" stroke="#1C1A1E" strokeWidth="6" strokeLinejoin="round"/>
  </svg>
);

const Wave = () => (
  <svg viewBox="0 0 1440 320" className="fixed bottom-0 w-full pointer-events-none z-0 opacity-90" preserveAspectRatio="none" style={{ height: '35vh' }}>
    <path fill="#F5CA5C" fillOpacity="1" d="M0,256L48,229.3C96,203,192,149,288,144C384,139,480,181,576,202.7C672,224,768,224,864,213.3C960,203,1056,181,1152,154.7C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
  </svg>
);

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen bg-kev-bg font-sans text-kev-text relative overflow-hidden">
        {/* Background Wave */}
        <Wave />
        
        {/* Floating Stars */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <Star className="top-[10%] left-[40%] w-12 animate-float" style={{ animationDelay: '0s', animationDuration: '6s', transform: 'rotate(15deg)' }} />
          <Star className="top-[25%] left-[8%] w-16 animate-float" style={{ animationDelay: '1s', animationDuration: '7s', transform: 'rotate(-10deg)' }} />
          <Star className="top-[15%] right-[25%] w-14 animate-float" style={{ animationDelay: '2s', animationDuration: '8s', transform: 'rotate(25deg)' }} />
          <Star className="top-[60%] right-[5%] w-20 animate-float" style={{ animationDelay: '0.5s', animationDuration: '9s', transform: 'rotate(-15deg)' }} />
        </div>

        {/* Floating Background Milkshakes */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.35] mix-blend-darken">
          <img src="/milkshake.png" className="absolute top-[5%] left-[5%] w-72 animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }} alt="" />
          <img src="/milkshake.png" className="absolute top-[50%] left-[25%] w-48 animate-float" style={{ animationDelay: '-3s', animationDuration: '7s' }} alt="" />
          <img src="/milkshake.png" className="absolute top-[15%] right-[8%] w-80 animate-float scale-x-[-1]" style={{ animationDelay: '-1s', animationDuration: '9s' }} alt="" />
          <img src="/milkshake.png" className="absolute bottom-[5%] right-[30%] w-64 animate-float" style={{ animationDelay: '-5s', animationDuration: '10s' }} alt="" />
        </div>
        
        <div className="relative z-10 flex w-full">
          <Sidebar />
          <main className="flex-1 min-w-0 px-10 py-8 ml-72 max-w-[1600px] mx-auto transition-all duration-300">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/segments" element={<SegmentsPage />} />
            <Route path="/automations" element={<AutomationsPage />} />
            <Route path="/autopilots" element={<Navigate to="/automations" replace />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          </Routes>
        </main>
        <ChatSidebar />
        </div>
      </div>
    </Router>
  );
}

export default App;
