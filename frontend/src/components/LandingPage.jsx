import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Trophy, Users, TrendingUp, Play } from 'lucide-react';
import { getAllTeams } from '../mock';

const LandingPage = ({ onStart }) => {
  const [rotation, setRotation] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);

  useEffect(() => {
    // Spinning ball animation
    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
    }, 30);

    // Calculate total goals and teams
    const allTeams = getAllTeams();
    const total = allTeams.reduce((sum, team) => sum + team.goals, 0);
    setTotalGoals(total);
    setTotalTeams(allTeams.length);

    return () => clearInterval(interval);
  }, []);

  const formatGoals = (goals) => {
    if (goals >= 1000000) {
      return `${(goals / 1000000).toFixed(1)}M`;
    }
    return goals.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-8 relative inline-block">
            <div 
              className="w-32 h-32 mx-auto bg-white rounded-full shadow-2xl flex items-center justify-center text-7xl"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              ⚽
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-3 shadow-lg animate-bounce">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Mini Cup
          </h1>
          <p className="text-2xl text-blue-100 mb-2">Club World Cup 2025</p>
          <p className="text-lg text-blue-200 mb-8">Score goals. Beat the keeper. Top the leaderboard.</p>
          
          <Button 
            onClick={onStart}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 text-xl px-12 py-6 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 font-bold"
          >
            <Play className="w-6 h-6 mr-2 fill-current" />
            Start Playing
          </Button>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white border-opacity-30">
            <div className="flex justify-center mb-3">
              <Trophy className="w-12 h-12 text-yellow-300" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">{mockTeams.length}</div>
            <div className="text-blue-100 font-medium">Teams Competing</div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white border-opacity-30">
            <div className="flex justify-center mb-3">
              <TrendingUp className="w-12 h-12 text-green-300" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">{formatGoals(totalGoals)}</div>
            <div className="text-blue-100 font-medium">Total Goals Scored</div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white border-opacity-30">
            <div className="flex justify-center mb-3">
              <Users className="w-12 h-12 text-purple-300" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">∞</div>
            <div className="text-blue-100 font-medium">Players Worldwide</div>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-30">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">How to Play</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-5xl mb-3">👆</div>
              <h3 className="font-bold text-white mb-2">1. Choose Team</h3>
              <p className="text-blue-100 text-sm">Pick your favorite team from the Club World Cup</p>
            </div>
            <div>
              <div className="text-5xl mb-3">⬆️</div>
              <h3 className="font-bold text-white mb-2">2. Swipe to Shoot</h3>
              <p className="text-blue-100 text-sm">Swipe up on the ball to take a penalty kick</p>
            </div>
            <div>
              <div className="text-5xl mb-3">🏆</div>
              <h3 className="font-bold text-white mb-2">3. Score Goals</h3>
              <p className="text-blue-100 text-sm">Beat the keeper and climb the global leaderboard!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;