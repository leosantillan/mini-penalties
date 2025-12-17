// Mock data for Mini Cup Game

export const mockCountries = [
  { id: 'argentina', name: 'Argentina', flag: '🇦🇷', color: '#75AADB' },
  { id: 'brazil', name: 'Brazil', flag: '🇧🇷', color: '#009B3A' },
  { id: 'uruguay', name: 'Uruguay', flag: '🇺🇾', color: '#0038A8' },
  { id: 'spain', name: 'Spain', flag: '🇪🇸', color: '#C60B1E' },
  { id: 'england', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#C8102E' },
  { id: 'italy', name: 'Italy', flag: '🇮🇹', color: '#009246' },
];

export const mockTeams = {
  argentina: [
    { id: 'arg1', name: 'Gallinas', country: 'Argentina', flag: '🇦🇷', color: '#FFD700', goals: 15678901 },
    { id: 'arg2', name: 'Bosta', country: 'Argentina', flag: '🇦🇷', color: '#003F87', goals: 14234567 },
    { id: 'arg3', name: 'Acade', country: 'Argentina', flag: '🇦🇷', color: '#EE2737', goals: 13456789 },
    { id: 'arg4', name: 'Rojo', country: 'Argentina', flag: '🇦🇷', color: '#E30613', goals: 12789012 },
    { id: 'arg5', name: 'Rosario', country: 'Argentina', flag: '🇦🇷', color: '#FFCD00', goals: 11901234 },
    { id: 'arg6', name: 'NOB', country: 'Argentina', flag: '🇦🇷', color: '#CC0000', goals: 10678901 },
    { id: 'arg7', name: 'Santo', country: 'Argentina', flag: '🇦🇷', color: '#8B0000', goals: 9456789 },
    { id: 'arg8', name: 'Globo', country: 'Argentina', flag: '🇦🇷', color: '#00A3E0', goals: 8234567 },
  ],
  brazil: [
    { id: 'bra1', name: 'Verdao', country: 'Brazil', flag: '🇧🇷', color: '#046A38', goals: 18901234 },
    { id: 'bra2', name: 'Mengao', country: 'Brazil', flag: '🇧🇷', color: '#E31E24', goals: 17678901 },
    { id: 'bra3', name: 'Flu', country: 'Brazil', flag: '🇧🇷', color: '#7D2F3B', goals: 16456789 },
    { id: 'bra4', name: 'Galo', country: 'Brazil', flag: '🇧🇷', color: '#000000', goals: 15234567 },
    { id: 'bra5', name: 'Colorado', country: 'Brazil', flag: '🇧🇷', color: '#E4002B', goals: 14012345 },
    { id: 'bra6', name: 'Tricolor', country: 'Brazil', flag: '🇧🇷', color: '#FF0000', goals: 12890123 },
  ],
  uruguay: [
    { id: 'uru1', name: 'Bolso', country: 'Uruguay', flag: '🇺🇾', color: '#FFD700', goals: 9678901 },
    { id: 'uru2', name: 'Carbonero', country: 'Uruguay', flag: '🇺🇾', color: '#000000', goals: 8456789 },
  ],
  spain: [
    { id: 'esp1', name: 'Cule', country: 'Spain', flag: '🇪🇸', color: '#A50044', goals: 20123456 },
    { id: 'esp2', name: 'Merengue', country: 'Spain', flag: '🇪🇸', color: '#FEBE10', goals: 19890123 },
    { id: 'esp3', name: 'Colchonero', country: 'Spain', flag: '🇪🇸', color: '#CE3524', goals: 16678901 },
    { id: 'esp4', name: 'Los Che', country: 'Spain', flag: '🇪🇸', color: '#FFE500', goals: 14456789 },
    { id: 'esp5', name: 'Palanganas', country: 'Spain', flag: '🇪🇸', color: '#00A650', goals: 13234567 },
    { id: 'esp6', name: 'Leones', country: 'Spain', flag: '🇪🇸', color: '#003399', goals: 12012345 },
  ],
  england: [
    { id: 'eng1', name: 'Diablos', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#DA291C', goals: 22345678 },
    { id: 'eng2', name: 'Ciudadanos', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#6CABDD', goals: 21123456 },
    { id: 'eng3', name: 'Rojos', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#C8102E', goals: 18901234 },
    { id: 'eng4', name: 'Azules', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#034694', goals: 17678901 },
  ],
  italy: [
    { id: 'ita1', name: 'Diavolo', country: 'Italy', flag: '🇮🇹', color: '#FB090B', goals: 19456789 },
    { id: 'ita2', name: 'Nerazzurri', country: 'Italy', flag: '🇮🇹', color: '#010E80', goals: 18234567 },
    { id: 'ita3', name: 'Vecchia Signora', country: 'Italy', flag: '🇮🇹', color: '#000000', goals: 17012345 },
    { id: 'ita4', name: 'Toro', country: 'Italy', flag: '🇮🇹', color: '#8B2323', goals: 14890123 },
    { id: 'ita5', name: 'Azzurri', country: 'Italy', flag: '🇮🇹', color: '#0066CC', goals: 13678901 },
    { id: 'ita6', name: 'Lupi', country: 'Italy', flag: '🇮🇹', color: '#8B0000', goals: 12456789 },
  ],
};

export const getAllTeams = () => {
  const allTeams = [];
  Object.values(mockTeams).forEach(countryTeams => {
    allTeams.push(...countryTeams);
  });
  return allTeams;
};

export const mockGameHistory = [
  { id: 1, team: 'Verdao', score: 8, timestamp: '2025-01-15T10:30:00Z' },
  { id: 2, team: 'Diablos', score: 12, timestamp: '2025-01-15T09:45:00Z' },
  { id: 3, team: 'Cule', score: 6, timestamp: '2025-01-15T08:20:00Z' },
];

export const addGoalsToTeam = (teamId, goals) => {
  for (const countryTeams of Object.values(mockTeams)) {
    const team = countryTeams.find(t => t.id === teamId);
    if (team) {
      team.goals += goals;
      return;
    }
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