import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Trophy, ArrowLeft } from 'lucide-react';
import { mockTeams, addGoalsToTeam, addGameHistory } from '../mock';

const MiniCupGame = ({ selectedTeam, onBack }) => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 85 });
  const [isKicking, setIsKicking] = useState(false);
  const [goalKeeperPosition, setGoalKeeperPosition] = useState(50);
  const [showResult, setShowResult] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const gameRef = useRef(null);
  const touchStartRef = useRef(null);

  useEffect(() => {
    if (!gameOver && !isKicking) {
      // Goalkeeper movement - gets faster with higher difficulty
      const interval = setInterval(() => {
        setGoalKeeperPosition(prev => {
          const speed = 2 + (difficulty * 0.5);
          const newPos = prev + speed;
          if (newPos >= 85 || newPos <= 15) {
            return prev - speed;
          }
          return newPos;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameOver, isKicking, difficulty]);

  const handleTouchStart = (e) => {
    if (isKicking || gameOver) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    if (isKicking || gameOver || !touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touchStartRef.current.y - touch.clientY;
    
    if (deltaY > 30) {
      shootBall(deltaX, deltaY);
    }
    touchStartRef.current = null;
  };

  const handleMouseDown = (e) => {
    if (isKicking || gameOver) return;
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e) => {
    if (isKicking || gameOver || !touchStartRef.current) return;
    
    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = touchStartRef.current.y - e.clientY;
    
    if (deltaY > 30) {
      shootBall(deltaX, deltaY);
    }
    touchStartRef.current = null;
  };

  const shootBall = (deltaX, deltaY) => {
    setIsKicking(true);
    
    // Calculate target position based on swipe
    const targetX = Math.max(10, Math.min(90, 50 + (deltaX / 5)));
    const power = Math.min(deltaY / 3, 100);
    
    // Animate ball
    setBallPosition({ x: targetX, y: 20 });
    
    setTimeout(() => {
      // Check if goal
      const goalKeeperRange = 15;
      const isGoal = Math.abs(targetX - goalKeeperPosition) > goalKeeperRange;
      
      if (isGoal) {
        setShowResult('goal');
        setScore(prev => prev + 1);
        addGoalsToTeam(selectedTeam.id, 1);
        setDifficulty(prev => prev + 0.3);
        setTimeout(() => {
          setShowResult(null);
          setBallPosition({ x: 50, y: 85 });
          setIsKicking(false);
        }, 1500);
      } else {
        setShowResult('miss');
        addGameHistory(selectedTeam.name, score);
        setTimeout(() => {
          setGameOver(true);
        }, 1500);
      }
    }, 600);
  };

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    setBallPosition({ x: 50, y: 85 });
    setIsKicking(false);
    setShowResult(null);
    setDifficulty(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-green-300 flex flex-col">
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
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
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
            top: '80px',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="w-16 h-20 bg-yellow-400 rounded-lg flex items-center justify-center text-3xl relative">
            🧤
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-yellow-400 rounded-b-full"></div>
          </div>
        </div>

        {/* Ball */}
        <div 
          className={`absolute w-12 h-12 transition-all ${
            isKicking ? 'duration-600 ease-out' : 'duration-300'
          }`}
          style={{
            left: `${ballPosition.x}%`,
            top: `${ballPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-full h-full bg-white rounded-full shadow-lg flex items-center justify-center text-2xl">
            ⚽
          </div>
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
            <p className="font-semibold text-lg">Swipe up to shoot!</p>
            <p className="text-sm">Swipe left/right to aim</p>
          </div>
        )}

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