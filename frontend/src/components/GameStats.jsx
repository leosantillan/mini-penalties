import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Trophy, TrendingUp, Calendar, CalendarDays } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import ShareButtons from './ShareButtons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const GameStats = ({ onBack }) => {
  const [todayStats, setTodayStats] = useState([]);
  const [monthStats, setMonthStats] = useState([]);
  const [yearStats, setYearStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [todayRes, monthRes, yearRes] = await Promise.all([
        axios.get(`${API}/stats/goals/today`),
        axios.get(`${API}/stats/goals/month`),
        axios.get(`${API}/stats/goals/year`),
      ]);
      setTodayStats(todayRes.data);
      setMonthStats(monthRes.data);
      setYearStats(yearRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatGoals = (goals) => {
    if (goals >= 1000000) {
      return `${(goals / 1000000).toFixed(1)}M`;
    }
    return goals.toLocaleString();
  };

  const generateShareText = () => {
    const currentStats = activeTab === 'today' ? todayStats : activeTab === 'month' ? monthStats : yearStats;
    const top5 = currentStats.slice(0, 5);
    
    if (top5.length === 0) return t('shareLeaderboard');
    
    const periodName = activeTab === 'today' ? t('today') : activeTab === 'month' ? t('thisMonth') : t('thisYear');
    let text = `🏆 Mini Cup - ${periodName}\n\n`;
    
    top5.forEach((stat, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      text += `${medal} ${stat.team_name}: ${formatGoals(stat.total_goals)} ${t('goals')}\n`;
    });
    
    return text;
  };

  const renderStatsList = (stats, icon, emptyMessage) => {
    if (stats.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <Card key={stat.team_id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                    index === 0
                      ? 'bg-yellow-100 text-yellow-600'
                      : index === 1
                      ? 'bg-gray-200 text-gray-600'
                      : index === 2
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{stat.team_name}</h3>
                      <p className="text-sm text-gray-500">{stat.country_name}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatGoals(stat.total_goals)}
                  </span>
                  <span className="text-sm text-gray-500">{t('goals')}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {stat.total_games} {t('games')} • {t('avg')}: {stat.average_score.toFixed(1)}
                  {stat.best_score > 0 && ` • ${t('best')}: ${stat.best_score}`}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl font-bold text-gray-800">{t('gameStats')}</h1>
            </div>
            <p className="text-gray-600">{t('statsDesc')}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('today')}
            </TabsTrigger>
            <TabsTrigger value="month" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              {t('thisMonth')}
            </TabsTrigger>
            <TabsTrigger value="year" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('thisYear')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('todayGoals')}</h2>
              <p className="text-gray-600">
                {t('todayGoalsDesc')}
              </p>
            </div>
            {renderStatsList(todayStats, '⚽', t('noGoalsToday'))}
          </TabsContent>

          <TabsContent value="month">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('monthGoals')}</h2>
              <p className="text-gray-600">
                {t('monthGoalsDesc')} {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            {renderStatsList(monthStats, '🏆', t('noGoalsMonth'))}
          </TabsContent>

          <TabsContent value="year">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('yearGoals')}</h2>
              <p className="text-gray-600">
                {t('yearGoalsDesc')} {new Date().getFullYear()}
              </p>
            </div>
            {renderStatsList(yearStats, '🌟', t('noGoalsYear'))}
          </TabsContent>
        </Tabs>

        {/* Summary Card */}
        <Card className="mt-6 p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold mb-1">{todayStats.length}</div>
              <div className="text-blue-100 text-sm">{t('teamsToday')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">{monthStats.length}</div>
              <div className="text-blue-100 text-sm">{t('teamsThisMonth')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">{yearStats.length}</div>
              <div className="text-blue-100 text-sm">{t('teamsThisYear')}</div>
            </div>
          </div>
        </Card>

        {/* Share Call-to-Action */}
        <Card className="mt-6 p-8 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 text-9xl opacity-20 transform translate-x-8 -translate-y-4">
            📣
          </div>
          <div className="relative z-10 text-center">
            <h3 className="text-2xl font-bold mb-2">{t('helpYourTeam')}</h3>
            <p className="text-white/90 mb-6 max-w-md mx-auto">
              {t('helpYourTeamDesc')}
            </p>
            <ShareButtons 
              shareText={generateShareText()} 
              customButton={
                <button className="inline-flex items-center gap-3 bg-white text-orange-600 font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <span className="text-2xl">🚀</span>
                  <span className="text-lg">{t('spreadTheWord')}</span>
                  <span className="text-2xl">⚽</span>
                </button>
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameStats;
