import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Trophy, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { usePlayLimit } from '../contexts/PlayLimitContext';
import AdModal from './AdModal';
import PlayLimitBanner from './PlayLimitBanner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MiniCupGame = ({ selectedTeam, onBack }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const { usePlay, needsAd, canPlayMore, showAdModal, setShowAdModal } = usePlayLimit();
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 85 });
  const [isKicking, setIsKicking] = useState(false);
  const [goalKeeperPosition, setGoalKeeperPosition] = useState(50);
  const [goalKeeperDirection, setGoalKeeperDirection] = useState(1);
  const [showResult, setShowResult] = useState(null);
  const [difficulty, setDifficulty] = useState(1.5);
  const [aimPosition, setAimPosition] = useState(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!gameOver && !isKicking) {
      // Goalkeeper movement - gets faster with higher difficulty
      const interval = setInterval(() => {
        setGoalKeeperPosition(prev => {
          const speed = 3 + (difficulty * 1);
          const newPos = prev + (speed * goalKeeperDirection);
          
          // Change direction at boundaries
          if (newPos >= 80) {
            setGoalKeeperDirection(-1);
            return 80;
          } else if (newPos <= 20) {
            setGoalKeeperDirection(1);
            return 20;
          }
          return newPos;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameOver, isKicking, difficulty, goalKeeperDirection]);

  const handleMouseMove = (e) => {
    if (isKicking || gameOver) return;
    
    const rect = gameRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Only show aim indicator when mouse is above the ball
    if (mouseY < 80) {
      setAimPosition({ x: mouseX, y: mouseY });
    } else {
      setAimPosition(null);
    }
  };

  const handleMouseLeave = () => {
    setAimPosition(null);
  };

  const handleClick = (e) => {
    if (isKicking || gameOver) return;
    
    // Get click position relative to the game area
    const rect = gameRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Only shoot if clicking on upper part of the screen (above the ball)
    if (clickY < 80) {
      shootBall(clickX);
    }
  };

  const shootBall = (targetX) => {
    setIsKicking(true);
    setAimPosition(null);
    
    // Clamp target position to goal area
    const clampedX = Math.max(25, Math.min(75, targetX));
    
    // Animate ball to target position
    setBallPosition({ x: clampedX, y: 15 });
    
    setTimeout(() => {
      // Check if goal - goalkeeper should visually block the ball
      const goalKeeperRange = Math.max(10, 16 - difficulty);
      const distance = Math.abs(clampedX - goalKeeperPosition);
      const isGoal = distance > goalKeeperRange;
      
      if (isGoal) {
        setShowResult('goal');
        setScore(prev => prev + 1);
        setDifficulty(prev => prev + 0.5);
        setTimeout(() => {
          setShowResult(null);
          setBallPosition({ x: 50, y: 85 });
          setIsKicking(false);
        }, 1500);
      } else {
        // Move ball to goalkeeper's exact position for visual blocking
        setBallPosition({ x: goalKeeperPosition, y: 12 });
        setShowResult('miss');
        
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
      }
    }, 600);
  };

  const handleRestart = () => {
    // Check if player can play more
    if (!canPlayMore()) {
      // No more plays available today
      return;
    }

    if (needsAd()) {
      // Show ad modal
      setShowAdModal(true);
      return;
    }

    // Use a play
    if (usePlay()) {
      setScore(0);
      setGameOver(false);
      setBallPosition({ x: 50, y: 85 });
      setIsKicking(false);
      setShowResult(null);
      setDifficulty(1.5);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-green-300 flex flex-col">
      {/* Play Limit Banner */}
      <div className="p-4">
        <PlayLimitBanner />
      </div>

      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-white text-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedTeam.flag}</span>
            <span className="font-bold">{selectedTeam.name}</span>
          </div>
        </div>
        <div className="text-white font-bold text-xl flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {score}
        </div>
      </div>

      <div 
        ref={gameRef}
        className="flex-1 relative overflow-hidden cursor-crosshair"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Goal */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-64 h-32 border-4 border-white rounded-t-lg">
          {/* Goal Net */}
          <div className="w-full h-full bg-white bg-opacity-10 backdrop-blur-sm"></div>
        </div>

        {/* Goalkeeper */}
        <div 
          className="absolute transition-all duration-100"
          style={{
            left: `${goalKeeperPosition}%`,
            top: '70px',
            transform: 'translateX(-50%)',
            fontSize: '4.5rem',
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
          }}
        >
          🤾
        </div>

        {/* Aim Indicator */}
        {aimPosition && !isKicking && !gameOver && (
          <>
            {/* Arrow from ball to aim position */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 5 }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="white" opacity="0.8" />
                </marker>
              </defs>
              <line
                x1={`${ballPosition.x}%`}
                y1={`${ballPosition.y}%`}
                x2={`${aimPosition.x}%`}
                y2={`${aimPosition.y}%`}
                stroke="white"
                strokeWidth="3"
                strokeDasharray="8,4"
                opacity="0.8"
                markerEnd="url(#arrowhead)"
              />
            </svg>
            {/* Target circle at aim position */}
            <div
              className="absolute w-8 h-8 border-4 border-white rounded-full pointer-events-none animate-pulse"
              style={{
                left: `${aimPosition.x}%`,
                top: `${aimPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 5
              }}
            />
          </>
        )}

        {/* Ball */}
        <div 
          className={`absolute transition-all ${
            isKicking ? 'duration-600 ease-out' : 'duration-300'
          }`}
          style={{
            left: `${ballPosition.x}%`,
            top: `${ballPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            fontSize: '3rem',
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
          }}
        >
          ⚽
        </div>

        {/* Result Message */}
        {showResult && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold animate-bounce">
            {showResult === 'goal' ? (
              <span className="text-green-500 drop-shadow-lg">GOAL! 🎉</span>
            ) : (
              <span className="text-red-500 drop-shadow-lg">SAVED! 😮</span>
            )}
          </div>
        )}

        {/* Instructions */}
        {!isKicking && !gameOver && score === 0 && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-white text-center animate-pulse">
            <p className="font-semibold text-lg">Click/Tap to shoot!</p>
            <p className="text-sm">Aim for the goal and avoid the keeper</p>
          </div>
        )}

        {/* Ad Modal */}
        <AdModal isOpen={showAdModal} onClose={() => setShowAdModal(false)} />

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Game Over!</h2>
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Final Score</p>
                <p className="text-6xl font-bold" style={{ color: selectedTeam.color }}>
                  {score}
                </p>
              </div>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Goals contributed to</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">{selectedTeam.flag}</span>
                  <span className="font-bold text-lg">{selectedTeam.name}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={handleRestart} className="w-full" size="lg">
                  Play Again
                </Button>
                <Button onClick={onBack} variant="outline" className="w-full" size="lg">
                  Choose Different Team
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniCupGame;