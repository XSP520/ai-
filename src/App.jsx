import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AIProvider } from './context/AIContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import FloatingIcons from './components/FloatingIcons';
import Home from './pages/Home';
import Roadmap from './pages/Roadmap';
import StageDetail from './pages/StageDetail';
import Progress from './pages/Progress';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AIProvider>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col relative">
            <FloatingIcons />
            <Navbar />
            <main className="flex-1 relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/roadmap" element={<Roadmap />} />
                <Route path="/stage/:stageId" element={<StageDetail />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </ThemeProvider>
      </AIProvider>
    </BrowserRouter>
  );
}
