import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import LandingPage from "./components/LandingPage";
import CountrySelection from "./components/CountrySelection";
import TeamSelection from "./components/TeamSelection";
import MiniCupGame from "./components/MiniCupGame";
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import CountriesManager from "./components/admin/CountriesManager";
import TeamsManager from "./components/admin/TeamsManager";
import UsersManager from "./components/admin/UsersManager";
import Statistics from "./components/admin/Statistics";
import GameStats from "./components/GameStats";

function GameFlow() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const navigate = useNavigate();

  const handleStart = () => {
    setCurrentScreen('countries');
  };

  const handleStats = () => {
    setCurrentScreen('stats');
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setCurrentScreen('teams');
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setCurrentScreen('game');
  };

  const handleBackToTeams = () => {
    setCurrentScreen('teams');
    setSelectedTeam(null);
  };

  const handleBackToCountries = () => {
    setCurrentScreen('countries');
    setSelectedCountry(null);
    setSelectedTeam(null);
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
    setSelectedCountry(null);
    setSelectedTeam(null);
  };

  const handleAdminNav = () => {
    navigate('/admin/login');
  };

  return (
    <>
      {currentScreen === 'landing' && (
        <LandingPage onStart={handleStart} onStats={handleStats} onAdminClick={handleAdminNav} />
      )}
      {currentScreen === 'stats' && (
        <GameStats onBack={handleBackToLanding} />
      )}
      {currentScreen === 'countries' && (
        <CountrySelection 
          onCountrySelect={handleCountrySelect}
          onBack={handleBackToLanding}
        />
      )}
      {currentScreen === 'teams' && selectedCountry && (
        <TeamSelection 
          selectedCountry={selectedCountry}
          onTeamSelect={handleTeamSelect}
          onBack={handleBackToCountries}
        />
      )}
      {currentScreen === 'game' && selectedTeam && (
        <MiniCupGame 
          selectedTeam={selectedTeam}
          onBack={handleBackToTeams}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<GameFlow />} />
            <Route path="/admin/login" element={<AdminLogin onBack={() => window.location.href = '/'} />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="countries" element={<CountriesManager />} />
              <Route path="teams" element={<TeamsManager />} />
              <Route path="users" element={<UsersManager />} />
              <Route path="statistics" element={<Statistics />} />
            </Route>
          </Routes>
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
