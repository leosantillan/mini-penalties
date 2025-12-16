import { useState } from "react";
import "./App.css";
import LandingPage from "./components/LandingPage";
import TeamSelection from "./components/TeamSelection";
import MiniCupGame from "./components/MiniCupGame";

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // 'landing', 'teams', 'game'
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleStart = () => {
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

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
    setSelectedTeam(null);
  };

  return (
    <div className="App">
      {currentScreen === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}
      {currentScreen === 'teams' && (
        <TeamSelection 
          onTeamSelect={handleTeamSelect}
          onBack={handleBackToLanding}
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
