import { useState } from "react";
import "./App.css";
import LandingPage from "./components/LandingPage";
import CountrySelection from "./components/CountrySelection";
import TeamSelection from "./components/TeamSelection";
import MiniCupGame from "./components/MiniCupGame";

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // 'landing', 'countries', 'teams', 'game'
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleStart = () => {
    setCurrentScreen('countries');
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

  return (
    <div className="App">
      {currentScreen === 'landing' && (
        <LandingPage onStart={handleStart} />
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
    </div>
  );
}

export default App;
