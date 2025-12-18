import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Trophy, Users, TrendingUp, Play, Settings, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = ({ onStart, onStats }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [rotation, setRotation] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Spinning ball animation
    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
    }, 30);

    // Fetch real data from API
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/teams`);
        const teams = response.data;
        const total = teams.reduce((sum, team) => sum + team.goals, 0);
        setTotalGoals(total);
        setTotalTeams(teams.length);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => clearInterval(interval);
  }, []);

  const formatGoals = (goals) => {
    if (goals >= 1000000) {
      return `${(goals / 1000000).toFixed(1)}M`;
    }
    return goals.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Language Selector */}
        <div className="mb-8 flex justify-center">
          <LanguageSelector />
        </div>

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
            {t('miniCup')}
          </h1>
          <p className="text-2xl text-blue-100 mb-2">{t('clubWorldCup')}</p>
          <p className="text-lg text-blue-200 mb-8">{t('tagline')}</p>
          
          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-4">
              <Button 
                onClick={onStart}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 text-xl px-12 py-6 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 font-bold"
              >
                <Play className="w-6 h-6 mr-2 fill-current" />
                {t('startPlaying')}
              </Button>
              
              <Button 
                onClick={onStats}
                size="lg"
                variant="outline"
                className="bg-white/10 text-white hover:bg-white hover:text-blue-600 border-2 border-white text-xl px-8 py-6 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 font-bold backdrop-blur-sm"
              >
                <BarChart3 className="w-6 h-6 mr-2" />
                {t('stats')}
              </Button>
            </div>
            
            <button
              onClick={() => navigate('/admin/login')}
              className="text-blue-100 hover:text-white text-sm flex items-center gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {t('adminPanel')}
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white border-opacity-30">
            <div className="flex justify-center mb-3">
              <Trophy className="w-12 h-12 text-yellow-300" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">{totalTeams}</div>
            <div className="text-blue-100 font-medium">{t('teamsCompeting')}</div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white border-opacity-30">
            <div className="flex justify-center mb-3">
              <TrendingUp className="w-12 h-12 text-green-300" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">{formatGoals(totalGoals)}</div>
            <div className="text-blue-100 font-medium">{t('totalGoals')}</div>
          </div>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white border-opacity-30">
            <div className="flex justify-center mb-3">
              <Users className="w-12 h-12 text-purple-300" />
            </div>
            <div className="text-4xl font-bold text-white mb-2">∞</div>
            <div className="text-blue-100 font-medium">{t('playersWorldwide')}</div>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-30">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('howToPlay')}</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-5xl mb-3">👆</div>
              <h3 className="font-bold text-white mb-2">{t('step1Title')}</h3>
              <p className="text-blue-100 text-sm">{t('step1Desc')}</p>
            </div>
            <div>
              <div className="text-5xl mb-3">⬆️</div>
              <h3 className="font-bold text-white mb-2">{t('step2Title')}</h3>
              <p className="text-blue-100 text-sm">{t('step2Desc')}</p>
            </div>
            <div>
              <div className="text-5xl mb-3">🏆</div>
              <h3 className="font-bold text-white mb-2">{t('step3Title')}</h3>
              <p className="text-blue-100 text-sm">{t('step3Desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;