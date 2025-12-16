// Mock data for Mini Cup Game

export const mockTeams = [
  { id: 1, name: 'FC Thunder', country: 'Brazil', flag: '🇧🇷', color: '#FFD700', goals: 45678901 },
  { id: 2, name: 'Royal Eagles', country: 'Spain', flag: '🇪🇸', color: '#E74C3C', goals: 42345678 },
  { id: 3, name: 'Blue Dragons', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#3498DB', goals: 38901234 },
  { id: 4, name: 'Golden Lions', country: 'Germany', flag: '🇩🇪', color: '#F39C12', goals: 35678901 },
  { id: 5, name: 'Silver Wolves', country: 'Italy', flag: '🇮🇹', color: '#95A5A6', goals: 32456789 },
  { id: 6, name: 'Red Phoenix', country: 'France', flag: '🇫🇷', color: '#E67E22', goals: 30123456 },
  { id: 7, name: 'Star United', country: 'Argentina', flag: '🇦🇷', color: '#9B59B6', goals: 28789012 },
  { id: 8, name: 'Ocean Warriors', country: 'Portugal', flag: '🇵🇹', color: '#1ABC9C', goals: 25456789 },
];

export const mockGameHistory = [
  { id: 1, team: 'FC Thunder', score: 8, timestamp: '2025-01-15T10:30:00Z' },
  { id: 2, team: 'Blue Dragons', score: 12, timestamp: '2025-01-15T09:45:00Z' },
  { id: 3, team: 'Royal Eagles', score: 6, timestamp: '2025-01-15T08:20:00Z' },
];

export const addGoalsToTeam = (teamId, goals) => {
  const team = mockTeams.find(t => t.id === teamId);
  if (team) {
    team.goals += goals;
  }
};

export const addGameHistory = (teamName, score) => {
  mockGameHistory.unshift({
    id: mockGameHistory.length + 1,
    team: teamName,
    score,
    timestamp: new Date().toISOString()
  });
};