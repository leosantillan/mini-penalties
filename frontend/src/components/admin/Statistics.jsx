import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TrendingUp, Calendar, BarChart3, PieChart } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const Statistics = () => {
  const { getAuthHeaders } = useAuth();
  const [dailyStats, setDailyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayRange, setDayRange] = useState(30);
  const [monthRange, setMonthRange] = useState(12);

  useEffect(() => {
    fetchStatistics();
  }, [dayRange, monthRange]);

  const fetchStatistics = async () => {
    try {
      const [dailyRes, monthlyRes, teamRes] = await Promise.all([
        axios.get(`${API}/stats/daily?days=${dayRange}`, { headers: getAuthHeaders() }),
        axios.get(`${API}/stats/monthly?months=${monthRange}`, { headers: getAuthHeaders() }),
        axios.get(`${API}/stats/teams`, { headers: getAuthHeaders() }),
      ]);

      setDailyStats(dailyRes.data);
      setMonthlyStats(monthlyRes.data);
      setTeamStats(teamRes.data.slice(0, 10)); // Top 10 teams
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const totalGoals = teamStats.reduce((sum, team) => sum + team.total_goals, 0);
  const totalGames = teamStats.reduce((sum, team) => sum + team.total_games, 0);
  const avgGoalsPerGame = totalGames > 0 ? (totalGoals / totalGames).toFixed(2) : 0;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Statistics Dashboard</h1>
        <p className="text-gray-600 mt-2">Comprehensive analytics and insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Goals</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{formatNumber(totalGoals)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Games</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{formatNumber(totalGames)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Goals/Game</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{avgGoalsPerGame}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <PieChart className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Teams</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{teamStats.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="daily">Daily Trends</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="teams">Team Performance</TabsTrigger>
        </TabsList>

        {/* Daily Trends */}
        <TabsContent value="daily">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Daily Goals Trend</h2>
                <p className="text-gray-600 mt-1">Goals scored per day</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={dayRange === 7 ? 'default' : 'outline'}
                  onClick={() => setDayRange(7)}
                >
                  7 Days
                </Button>
                <Button
                  size="sm"
                  variant={dayRange === 30 ? 'default' : 'outline'}
                  onClick={() => setDayRange(30)}
                >
                  30 Days
                </Button>
                <Button
                  size="sm"
                  variant={dayRange === 90 ? 'default' : 'outline'}
                  onClick={() => setDayRange(90)}
                >
                  90 Days
                </Button>
              </div>
            </div>

            {dailyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total_goals"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Goals"
                  />
                  <Line
                    type="monotone"
                    dataKey="total_games"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Games"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No data available for the selected period
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Monthly Trends */}
        <TabsContent value="monthly">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Monthly Goals Trend</h2>
                <p className="text-gray-600 mt-1">Goals scored per month</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={monthRange === 6 ? 'default' : 'outline'}
                  onClick={() => setMonthRange(6)}
                >
                  6 Months
                </Button>
                <Button
                  size="sm"
                  variant={monthRange === 12 ? 'default' : 'outline'}
                  onClick={() => setMonthRange(12)}
                >
                  12 Months
                </Button>
              </div>
            </div>

            {monthlyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_goals" fill="#3B82F6" name="Goals" />
                  <Bar dataKey="total_games" fill="#10B981" name="Games" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No data available for the selected period
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Team Performance */}
        <TabsContent value="teams">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Top 10 Teams by Goals</h2>
              <p className="text-gray-600 mb-6">Total goals scored</p>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={teamStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="team_name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="total_goals" name="Goals">
                    {teamStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Pie Chart */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Goals Distribution</h2>
              <p className="text-gray-600 mb-6">Percentage by team</p>

              <ResponsiveContainer width="100%" height={400}>
                <RechartsPie>
                  <Pie
                    data={teamStats}
                    dataKey="total_goals"
                    nameKey="team_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={(entry) => `${entry.team_name}: ${formatNumber(entry.total_goals)}`}
                  >
                    {teamStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </Card>

            {/* Team Statistics Table */}
            <Card className="p-6 md:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Detailed Team Stats</h2>
              <p className="text-gray-600 mb-4">Performance metrics</p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Team
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Country
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Goals
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Games
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Avg
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Best
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {teamStats.map((team, index) => (
                      <tr key={team.team_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {team.team_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {team.country_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">
                          {formatNumber(team.total_goals)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {formatNumber(team.total_games)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                          {team.average_score.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                          {team.best_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
