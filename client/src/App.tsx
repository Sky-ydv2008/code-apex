import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/navbar/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoomWorkspacePage } from './pages/RoomWorkspacePage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ChallengeWorkspacePage } from './pages/ChallengeWorkspacePage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/room/:idOrCode" element={<RoomWorkspacePage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/challenges/:slug" element={<ChallengeWorkspacePage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
