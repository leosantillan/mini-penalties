import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Trophy, TrendingUp, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { usePlayLimit } from '../contexts/PlayLimitContext';
import { useLanguage } from '../contexts/LanguageContext';
import AdModal from './AdModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Component to render shirt design from grid or fallback
const ShirtDesignDisplay = ({ teamId, color, color2, size = 'md' }) => {
  const [design, setDesign] = useState(null);

  useEffect(() => {
    const savedDesign = localStorage.getItem(`shirt_design_${teamId}`);
    if (savedDesign) {
      try {
        setDesign(JSON.parse(savedDesign));
      } catch (e) {
        setDesign(null);
      }
    }
  }, [teamId]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  if (design?.grid) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-md overflow-hidden border-2 border-gray-200 shadow-md`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridTemplateRows: 'repeat(12, 1fr)',
        }}
      >
        {design.grid.flat().map((cellColor, index) => (
          <div key={index} style={{ backgroundColor: cellColor }} />
        ))}
      </div>
    );
  }

  // Fallback: Simple colored shirt SVG
  return (
    <svg viewBox="0 0 60 50" className={sizeClasses[size]}>
      <path 
        d="M15 8 L5 15 L10 20 L10 45 L50 45 L50 20 L55 15 L45 8 L40 12 L20 12 L15 8 Z" 
        fill={color || '#3B82F6'}
        stroke={color2 || '#1E40AF'}
        strokeWidth="2"
      />
      <path 
        d="M20 12 Q30 18 40 12" 
        fill="none" 
        stroke={color2 || '#1E40AF'}
        strokeWidth="2"
      />
    </svg>
  );
};

const TeamSelection = ({ selectedCountry, onTeamSelect, onBack }) => {
  const [teams, setTeams] = useState([]);
  const [sortedTeams, setSortedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { needsAd, canPlayMore, showAdModal, setShowAdModal } = usePlayLimit();
  const { t } = useLanguage();
  const [pendingTeam, setPendingTeam] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(`${API}/countries/${selectedCountry.country_id}/teams`);
        const countryTeams = response.data;
        setTeams(countryTeams);
        
        // Sort teams by goals for leaderboard
        const sorted = [...countryTeams].sort((a, b) => b.goals - a.goals);
        setSortedTeams(sorted);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [selectedCountry]);

  const handleTeamClick = (team) => {
    if (!canPlayMore()) {
      alert(t('comeBackTomorrow'));
      return;
    }

    if (needsAd()) {
      setPendingTeam(team);
      setShowAdModal(true);
    } else {
      onTeamSelect(team);
    }
  };

  const handleAdWatched = () => {
    setShowAdModal(false);
    if (pendingTeam) {
      onTeamSelect(pendingTeam);
      setPendingTeam(null);
    }
  };

  const handleAdCancel = () => {
    setShowAdModal(false);
    setPendingTeam(null);
  };

  const formatGoals = (goals) => {
    if (goals >= 1000000) {
      return `${(goals / 1000000).toFixed(1)}M`;
    }
    return goals.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-gray-800 text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      {/* Ad Modal */}
      <AdModal isOpen={showAdModal} onClose={handleAdWatched} onCancel={handleAdCancel} />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToCountries')}
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-5xl">{selectedCountry.flag}</span>
              <h1 className="text-4xl font-bold text-gray-800">{selectedCountry.name}</h1>
            </div>
            <p className="text-gray-600 mb-2">{t('chooseTeam')}</p>
            <p className="text-sm text-gray-500">{t('selectTeamDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {teams.map((team, index) => (
            <Card 
              key={team.team_id}
              className="p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col items-center text-center"
              onClick={() => handleTeamClick(team)}
            >
              {/* Shirt Design */}
              <div className="mb-3">
                <ShirtDesignDisplay 
                  teamId={team.team_id} 
                  color={team.color} 
                  color2={team.color2}
                  size="lg"
                />
              </div>
              
              {/* Team Name */}
              <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1">{team.name}</h3>
              
              {/* Goals */}
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-bold text-lg" style={{ color: team.color }}>
                  {formatGoals(team.goals)}
                </span>
                <span className="text-xs text-gray-500">{t('goals')}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Leaderboard Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            {t('globalStandings')}
          </h2>
          <div className="space-y-3">
            {sortedTeams.map((team, index) => (
              <div 
                key={team.team_id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold text-sm">
                    {index + 1}
                  </div>
                  <ShirtDesignDisplay 
                    teamId={team.team_id} 
                    color={team.color} 
                    color2={team.color2}
                    size="sm"
                  />
                  <span className="font-semibold text-gray-800">{team.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg" style={{ color: team.color }}>
                    {formatGoals(team.goals)}
                  </div>
                  <div className="text-xs text-gray-500">{t('goalsScored')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSelection;
