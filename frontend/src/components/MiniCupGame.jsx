import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { usePlayLimit } from '../contexts/PlayLimitContext';
import { useLanguage } from '../contexts/LanguageContext';
import AdModal from './AdModal';
import ShareButtons from './ShareButtons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// 5 possible destinations for the ball/goalkeeper
const DESTINATIONS = {
  BOTTOM_LEFT: 'bottom-left',
  UPPER_LEFT: 'upper-left',
  UPPER_CENTER: 'upper-center',
  UPPER_RIGHT: 'upper-right',
  BOTTOM_RIGHT: 'bottom-right',
};

// Position coordinates for each destination (as percentages)
const DESTINATION_POSITIONS = {
  [DESTINATIONS.BOTTOM_LEFT]: { ball: { x: 25, y: 75 }, keeper: { x: 20, y: 70 } },
  [DESTINATIONS.UPPER_LEFT]: { ball: { x: 25, y: 25 }, keeper: { x: 20, y: 25 } },
  [DESTINATIONS.UPPER_CENTER]: { ball: { x: 50, y: 15 }, keeper: { x: 50, y: 20 } },
  [DESTINATIONS.UPPER_RIGHT]: { ball: { x: 75, y: 25 }, keeper: { x: 80, y: 25 } },
  [DESTINATIONS.BOTTOM_RIGHT]: { ball: { x: 75, y: 75 }, keeper: { x: 80, y: 70 } },
};

const MiniCupGame = ({ selectedTeam, onBack, onGoHome }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { usePlay, needsAd, canPlayMore, canShareForPlays, shareForPlays, showAdModal, setShowAdModal } = usePlayLimit();
  const { t } = useLanguage();

  // Game state
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isKicking, setIsKicking] = useState(false);
  const [showResult, setShowResult] = useState(null);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 85 });
  const [keeperPosition, setKeeperPosition] = useState({ x: 50, y: 50 });
  const [keeperDestination, setKeeperDestination] = useState(null);
  const [showKeeper, setShowKeeper] = useState(false);
  const [shirtDesign, setShirtDesign] = useState(null);

  // Load shirt design from localStorage
  useEffect(() => {
    if (selectedTeam?.team_id) {
      const savedDesign = localStorage.getItem(`shirt_design_${selectedTeam.team_id}`);
      if (savedDesign) {
        try {
          setShirtDesign(JSON.parse(savedDesign));
        } catch (e) {
          setShirtDesign(null);
        }
      }
    }
  }, [selectedTeam]);

  // Use a play when component mounts (game starts)
  useEffect(() => {
    if (!gameStarted) {
      if (needsAd()) {
        setShowAdModal(true);
      } else if (usePlay()) {
        setGameStarted(true);
      } else {
        setGameOver(true);
      }
    }
  }, [gameStarted]);

  const handleAdWatched = () => {
    setShowAdModal(false);
    if (usePlay()) {
      if (gameOver) {
        // Restart after ad
        setScore(0);
        setGameOver(false);
        setBallPosition({ x: 50, y: 85 });
        setKeeperPosition({ x: 50, y: 50 });
        setSelectedDestination(null);
        setKeeperDestination(null);
        setIsKicking(false);
        setShowResult(null);
        setShowKeeper(false);
      }
      setGameStarted(true);
    }
  };

  const handleShareComplete = () => {
    if (shareForPlays()) {
      setScore(0);
      setGameOver(false);
      setBallPosition({ x: 50, y: 85 });
      setKeeperPosition({ x: 50, y: 50 });
      setSelectedDestination(null);
      setKeeperDestination(null);
      setIsKicking(false);
      setShowResult(null);
      setShowKeeper(false);
      setGameStarted(true);
    }
  };

  const getShareText = () => {
    return t('shareScore').replace('{score}', score).replace('{team}', selectedTeam.name);
  };

  const handleDestinationSelect = (destination) => {
    if (isKicking || gameOver) return;
    setSelectedDestination(destination);
    setShowKeeper(true); // Show goalkeeper after selecting destination
  };

  const handleShoot = () => {
    if (!selectedDestination || isKicking || gameOver) return;

    setIsKicking(true);

    // Goalkeeper randomly picks a destination
    const destinations = Object.values(DESTINATIONS);
    const randomKeeperDest = destinations[Math.floor(Math.random() * destinations.length)];
    setKeeperDestination(randomKeeperDest);

    // Get positions
    const playerPos = DESTINATION_POSITIONS[selectedDestination];
    const keeperPos = DESTINATION_POSITIONS[randomKeeperDest];

    // Animate ball and keeper to their positions
    setBallPosition(playerPos.ball);
    setKeeperPosition(keeperPos.keeper);

    // Check result after animation
    setTimeout(() => {
      const isSaved = selectedDestination === randomKeeperDest;

      if (isSaved) {
        setShowResult('saved');
        
        // Post game session to API
        const postGameSession = async () => {
          try {
            await axios.post(`${API}/game/session`, {
              team_id: selectedTeam.team_id,
              score: score
            });
          } catch (error) {
            console.error('Error posting game session:', error);
          }
        };
        postGameSession();

        setTimeout(() => {
          setGameOver(true);
        }, 1500);
      } else {
        setShowResult('goal');
        setScore(prev => prev + 1);

        setTimeout(() => {
          // Reset for next shot
          setShowResult(null);
          setBallPosition({ x: 50, y: 85 });
          setKeeperPosition({ x: 50, y: 50 });
          setSelectedDestination(null);
          setKeeperDestination(null);
          setIsKicking(false);
          setShowKeeper(false); // Hide keeper for next shot selection
        }, 1500);
      }
    }, 800);
  };

  const handleRestart = () => {
    if (!canPlayMore()) return;

    if (needsAd()) {
      setShowAdModal(true);
    } else if (usePlay()) {
      setScore(0);
      setGameOver(false);
      setBallPosition({ x: 50, y: 85 });
      setKeeperPosition({ x: 50, y: 50 });
      setSelectedDestination(null);
      setKeeperDestination(null);
      setIsKicking(false);
      setShowResult(null);
      setShowKeeper(false);
      setGameStarted(true);
    }
  };

  // Get keeper body position class based on destination
  const getKeeperStyle = () => {
    if (!keeperDestination && !isKicking) {
      // Default center position
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }
    
    const pos = keeperPosition;
    return {
      left: `${pos.x}%`,
      top: `${pos.y}%`,
      transform: 'translate(-50%, -50%)',
    };
  };

  // Get arm rotation based on keeper destination (like clock hands)
  // 9:00 = -90° (left), 10:30 = -45° (upper left), 12:00 = 0° (up), 1:30 = 45° (upper right), 3:00 = 90° (right)
  const getArmRotation = () => {
    if (!keeperDestination) return 0; // Default: arms up (12 o'clock)
    
    const rotations = {
      [DESTINATIONS.BOTTOM_LEFT]: -90,    // 9 o'clock
      [DESTINATIONS.UPPER_LEFT]: -45,     // 10:30
      [DESTINATIONS.UPPER_CENTER]: 0,     // 12 o'clock
      [DESTINATIONS.UPPER_RIGHT]: 45,     // 1:30
      [DESTINATIONS.BOTTOM_RIGHT]: 90,    // 3 o'clock
    };
    
    return rotations[keeperDestination] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 via-green-500 to-green-400 flex flex-col">
      {/* Header with Back button only */}
      <div className="p-2 sm:p-4 flex justify-between items-center bg-black bg-opacity-20">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white text-xs sm:text-sm">
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          {t('back')}
        </Button>
        <div className="text-white text-center">
          <span className="font-bold text-xs sm:text-base">{selectedTeam.name}</span>
        </div>
        {/* Empty div for flex spacing */}
        <div className="w-16 sm:w-20"></div>
      </div>

      {/* Ad Space Banner */}
      <div className="px-2 sm:px-4 py-2">
        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-2 sm:p-3 text-center border border-gray-600 border-dashed">
          <p className="text-gray-300 text-xs sm:text-sm">📺 Ad Space</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Score Display with T-shirt - Top Right Corner */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 flex flex-col items-center">
          {/* T-shirt with team design from admin panel or fallback */}
          <div className="relative">
            {shirtDesign?.grid ? (
              /* Render the actual shirt design grid */
              <div 
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 border-white shadow-lg"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gridTemplateRows: 'repeat(12, 1fr)',
                }}
              >
                {shirtDesign.grid.flat().map((color, index) => (
                  <div key={index} style={{ backgroundColor: color }} />
                ))}
              </div>
            ) : (
              /* Fallback: Simple colored t-shirt SVG */
              <svg viewBox="0 0 60 50" className="w-14 h-12 sm:w-18 sm:h-16">
                <path 
                  d="M15 8 L5 15 L10 20 L10 45 L50 45 L50 20 L55 15 L45 8 L40 12 L20 12 L15 8 Z" 
                  fill={selectedTeam.color || '#3B82F6'}
                  stroke={selectedTeam.color2 || '#1E40AF'}
                  strokeWidth="2"
                />
                <path 
                  d="M20 12 Q30 18 40 12" 
                  fill="none" 
                  stroke={selectedTeam.color2 || '#1E40AF'}
                  strokeWidth="2"
                />
              </svg>
            )}
          </div>
          {/* Score below the shirt */}
          <div className="mt-1 bg-black bg-opacity-60 rounded-lg px-3 py-1">
            <span className="text-white font-bold text-xl sm:text-2xl">{score}</span>
          </div>
          <span className="text-white text-xs font-semibold mt-1 drop-shadow">{t('goals')}</span>
        </div>

        {/* Instruction Message - Below Goal */}
        {!isKicking && !gameOver && !selectedDestination && (
          <div className="absolute top-44 sm:top-52 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black bg-opacity-70 rounded-xl px-6 py-3">
              <p className="text-white text-lg sm:text-2xl font-bold text-center drop-shadow animate-pulse">
                {t('selectDestination')}
              </p>
            </div>
          </div>
        )}

        {/* Goal Frame */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[85%] sm:w-[70%] max-w-md h-32 sm:h-40 border-4 border-white rounded-t-lg bg-white bg-opacity-10">
          {/* Goal Net Pattern */}
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>

          {/* Destination Buttons inside goal */}
          {!isKicking && !gameOver && (
            <div className="absolute inset-0 flex flex-col p-2">
              {/* Upper row */}
              <div className="flex-1 flex items-start justify-between px-2 pt-1">
                <button
                  onClick={() => handleDestinationSelect(DESTINATIONS.UPPER_LEFT)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all ${
                    selectedDestination === DESTINATIONS.UPPER_LEFT
                      ? 'bg-yellow-400 border-yellow-500 scale-110'
                      : 'bg-white bg-opacity-30 border-white hover:bg-opacity-50'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-white drop-shadow">↖</span>
                </button>
                <button
                  onClick={() => handleDestinationSelect(DESTINATIONS.UPPER_CENTER)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all ${
                    selectedDestination === DESTINATIONS.UPPER_CENTER
                      ? 'bg-yellow-400 border-yellow-500 scale-110'
                      : 'bg-white bg-opacity-30 border-white hover:bg-opacity-50'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-white drop-shadow">↑</span>
                </button>
                <button
                  onClick={() => handleDestinationSelect(DESTINATIONS.UPPER_RIGHT)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all ${
                    selectedDestination === DESTINATIONS.UPPER_RIGHT
                      ? 'bg-yellow-400 border-yellow-500 scale-110'
                      : 'bg-white bg-opacity-30 border-white hover:bg-opacity-50'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-white drop-shadow">↗</span>
                </button>
              </div>
              {/* Lower row */}
              <div className="flex-1 flex items-end justify-between px-4 pb-1">
                <button
                  onClick={() => handleDestinationSelect(DESTINATIONS.BOTTOM_LEFT)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all ${
                    selectedDestination === DESTINATIONS.BOTTOM_LEFT
                      ? 'bg-yellow-400 border-yellow-500 scale-110'
                      : 'bg-white bg-opacity-30 border-white hover:bg-opacity-50'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-white drop-shadow">↙</span>
                </button>
                <button
                  onClick={() => handleDestinationSelect(DESTINATIONS.BOTTOM_RIGHT)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all ${
                    selectedDestination === DESTINATIONS.BOTTOM_RIGHT
                      ? 'bg-yellow-400 border-yellow-500 scale-110'
                      : 'bg-white bg-opacity-30 border-white hover:bg-opacity-50'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold text-white drop-shadow">↘</span>
                </button>
              </div>
            </div>
          )}

          {/* Goalkeeper - styled like reference image - only shows after selecting destination */}
          {(showKeeper || isKicking) && (
            <div 
              className="absolute transition-all duration-500 ease-out"
              style={getKeeperStyle()}
            >
              <div className="relative flex flex-col items-center">
                {/* Head */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-amber-200 rounded-full border-2 border-amber-300 z-10 relative">
                  {/* Face details */}
                  <div className="absolute top-1.5 sm:top-2 left-1 w-1 h-1 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-1.5 sm:top-2 right-1 w-1 h-1 bg-gray-800 rounded-full"></div>
                </div>
                
                {/* Torso - Yellow vest over green with arms attached */}
                <div className="relative -mt-0.5">
                  {/* Green undershirt showing at sides */}
                  <div className="absolute -left-1 top-0 w-2 h-8 sm:h-10 bg-green-600 rounded-l-md"></div>
                  <div className="absolute -right-1 top-0 w-2 h-8 sm:h-10 bg-green-600 rounded-r-md"></div>
                  
                  {/* Left Arm - rotates from shoulder (right edge of arm is pivot point) */}
                  <div 
                    className="absolute top-0 right-full transition-transform duration-500 origin-right"
                    style={{ transform: `rotate(${-90 - getArmRotation()}deg)` }}
                  >
                    <div className="flex items-center">
                      {/* Left Glove */}
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full border-2 border-gray-300 shadow-md z-10"></div>
                      {/* Left Arm (green sleeve) */}
                      <div className="w-10 sm:w-12 h-3 sm:h-4 bg-green-600 rounded-full -ml-1"></div>
                    </div>
                  </div>
                  
                  {/* Right Arm - rotates from shoulder (left edge of arm is pivot point) */}
                  <div 
                    className="absolute top-0 left-full transition-transform duration-500 origin-left"
                    style={{ transform: `rotate(${-90 + getArmRotation()}deg)` }}
                  >
                    <div className="flex items-center">
                      {/* Right Arm (green sleeve) */}
                      <div className="w-10 sm:w-12 h-3 sm:h-4 bg-green-600 rounded-full -mr-1"></div>
                      {/* Right Glove */}
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full border-2 border-gray-300 shadow-md z-10"></div>
                    </div>
                  </div>
                  
                  {/* Yellow vest */}
                  <div className="w-6 h-8 sm:w-7 sm:h-10 bg-yellow-400 rounded-md border-2 border-yellow-500 relative z-10">
                    {/* Vest details */}
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-yellow-500 rounded-sm"></div>
                  </div>
                </div>
                
                {/* Shorts (green) */}
                <div className="w-7 h-3 sm:w-8 sm:h-4 bg-green-700 rounded-b-md -mt-0.5"></div>
                
                {/* Legs */}
                <div className="flex gap-1 -mt-0.5">
                  <div className="w-2.5 h-5 sm:w-3 sm:h-6 bg-amber-200 rounded-b-md"></div>
                  <div className="w-2.5 h-5 sm:w-3 sm:h-6 bg-amber-200 rounded-b-md"></div>
                </div>
                
                {/* Feet/boots (green) */}
                <div className="flex gap-2 -mt-0.5">
                  <div className="w-3 h-1.5 sm:w-4 sm:h-2 bg-green-800 rounded-md"></div>
                  <div className="w-3 h-1.5 sm:w-4 sm:h-2 bg-green-800 rounded-md"></div>
                </div>
              </div>
            </div>
          )}

          {/* Ball when kicked into goal */}
          {isKicking && (
            <div 
              className="absolute transition-all duration-500 ease-out text-3xl sm:text-4xl"
              style={{
                left: `${ballPosition.x}%`,
                top: `${ballPosition.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              ⚽
            </div>
          )}
        </div>

        {/* Ball at player's feet (before kick) - positioned closer to goal */}
        {!isKicking && (
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            {/* Instruction Message - Above Ball */}
            {!gameOver && selectedDestination && (
              <div className="mb-2 sm:mb-3 bg-black bg-opacity-70 rounded-xl px-4 sm:px-6 py-2 sm:py-3">
                <p className="text-white text-base sm:text-xl font-bold text-center drop-shadow animate-pulse">
                  {t('clickBallToShoot')}
                </p>
              </div>
            )}
            
            <button
              onClick={handleShoot}
              disabled={!selectedDestination || gameOver}
              className={`text-4xl sm:text-5xl transition-transform ${
                selectedDestination && !gameOver
                  ? 'cursor-pointer hover:scale-110'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              ⚽
            </button>
          </div>
        )}

        {/* Result Message */}
        {showResult && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-6xl font-bold animate-bounce z-20">
            {showResult === 'goal' ? (
              <span className="text-green-300 drop-shadow-lg">{t('goal')} 🎉</span>
            ) : (
              <span className="text-red-400 drop-shadow-lg">{t('saved')} 😮</span>
            )}
          </div>
        )}

        {/* Ad Modal - needs to be above game over screen */}
        <AdModal isOpen={showAdModal} onClose={handleAdWatched} onCancel={onBack} />

        {/* Game Over Screen */}
        {gameOver && !showAdModal && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
            <div className="bg-white rounded-2xl p-6 sm:p-8 text-center max-w-sm mx-4">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">{t('gameOver')}</h2>
              <div className="mb-6">
                <p className="text-gray-600 mb-2">{t('finalScore')}</p>
                <p className="text-5xl sm:text-6xl font-bold" style={{ color: selectedTeam.color }}>
                  {score}
                </p>
              </div>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{t('goalsContributed')}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">{selectedTeam.flag}</span>
                  <span className="font-bold text-lg">{selectedTeam.name}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {canPlayMore() ? (
                  <>
                    <Button onClick={handleRestart} className="w-full" size="lg">
                      {needsAd() ? t('watchAdToPlay') : t('playAgain')}
                    </Button>
                    {canShareForPlays() && (
                      <ShareButtons 
                        shareText={getShareText()}
                        onShareComplete={handleShareComplete}
                        showReward={true}
                      />
                    )}
                    <Button onClick={onGoHome} variant="outline" className="w-full" size="lg">
                      {t('goToHome')}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 font-semibold mb-2">{t('dailyLimitReached')}</p>
                      <p className="text-yellow-700 text-sm">
                        {t('comeBackTomorrow')}
                      </p>
                    </div>
                    <Button onClick={onGoHome} className="w-full" size="lg">
                      {t('goToHome')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniCupGame;
