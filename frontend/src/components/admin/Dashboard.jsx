import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Trophy, Users, Globe, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { getAuthHeaders } = useAuth();
  const [stats, setStats] = useState({
    totalCountries: 0,
    totalTeams: 0,
    totalGoals: 0,
    totalUsers: 0,
  });
  const [topTeams, setTopTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [countriesRes, teamsRes, usersRes, leaderboardRes] = await Promise.all([
        axios.get(`${API}/admin/countries`, { headers: getAuthHeaders() }),
        axios.get(`${API}/admin/teams`, { headers: getAuthHeaders() }),
        axios.get(`${API}/admin/users`, { headers: getAuthHeaders() }),
        axios.get(`${API}/leaderboard`),
      ]);

      const totalGoals = teamsRes.data.reduce((sum, team) => sum + team.goals, 0);

      setStats({
        totalCountries: countriesRes.data.length,
        totalTeams: teamsRes.data.length,
        totalGoals,
        totalUsers: usersRes.data.length,
      });

      setTopTeams(leaderboardRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to Mini Cup Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Countries</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalCountries}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Teams</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalTeams}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Goals</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{formatNumber(stats.totalGoals)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Users</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalUsers}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Teams */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Top 5 Teams</h2>
        <div className="space-y-3">
          {topTeams.map((team) => (
            <div key={team.team_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 font-bold text-blue-600 text-sm">
                  {team.rank}
                </div>
                <span className="text-2xl">{team.flag}</span>
                <div>
                  <p className="font-semibold text-gray-800">{team.team_name}</p>
                  <p className="text-sm text-gray-500">{team.country_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg" style={{ color: team.color }}>
                  {formatNumber(team.goals)}
                </p>
                <p className="text-xs text-gray-500">goals</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;