import React, { createContext, useState, useContext, useEffect } from 'react';

const PlayLimitContext = createContext();

const PLAYS_PER_SESSION = 2;
const MAX_AD_VIEWS = 5;

export const PlayLimitProvider = ({ children }) => {
  const [playsRemaining, setPlaysRemaining] = useState(PLAYS_PER_SESSION);
  const [adViewsUsed, setAdViewsUsed] = useState(0);
  const [lastResetDate, setLastResetDate] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);

  useEffect(() => {
    loadPlayData();
  }, []);

  const loadPlayData = () => {
    const savedData = localStorage.getItem('playLimitData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        const today = new Date().toDateString();
        
        // Check if we need to reset (new day)
        if (data.lastResetDate !== today) {
          resetPlayData();
        } else {
          setPlaysRemaining(data.playsRemaining || 0);
          setAdViewsUsed(data.adViewsUsed || 0);
          setLastResetDate(data.lastResetDate);
        }
      } catch (error) {
        console.error('Error loading play data:', error);
        resetPlayData();
      }
    } else {
      resetPlayData();
    }
  };

  const savePlayData = (plays, adViews) => {
    const data = {
      playsRemaining: plays,
      adViewsUsed: adViews,
      lastResetDate: new Date().toDateString(),
    };
    localStorage.setItem('playLimitData', JSON.stringify(data));
  };

  const resetPlayData = () => {
    const today = new Date().toDateString();
    setPlaysRemaining(PLAYS_PER_SESSION);
    setAdViewsUsed(0);
    setLastResetDate(today);
    savePlayData(PLAYS_PER_SESSION, 0);
  };

  const usePlay = () => {
    if (playsRemaining > 0) {
      const newPlays = playsRemaining - 1;
      setPlaysRemaining(newPlays);
      savePlayData(newPlays, adViewsUsed);
      return true;
    }
    return false;
  };

  const canPlayMore = () => {
    return playsRemaining > 0 || (adViewsUsed < MAX_AD_VIEWS);
  };

  const needsAd = () => {
    return playsRemaining === 0 && adViewsUsed < MAX_AD_VIEWS;
  };

  const watchAd = () => {
    if (adViewsUsed < MAX_AD_VIEWS) {
      const newAdViews = adViewsUsed + 1;
      const newPlays = PLAYS_PER_SESSION;
      setAdViewsUsed(newAdViews);
      setPlaysRemaining(newPlays);
      savePlayData(newPlays, newAdViews);
      setShowAdModal(false);
      return true;
    }
    return false;
  };

  const getTotalPlaysUsed = () => {
    return (adViewsUsed * PLAYS_PER_SESSION) + (PLAYS_PER_SESSION - playsRemaining);
  };

  const getTotalPlaysAvailable = () => {
    return (MAX_AD_VIEWS + 1) * PLAYS_PER_SESSION; // 5 ad views + initial 2 plays = 12 total
  };

  const getPlaysUntilNextAd = () => {
    return playsRemaining;
  };

  return (
    <PlayLimitContext.Provider
      value={{
        playsRemaining,
        adViewsUsed,
        showAdModal,
        setShowAdModal,
        usePlay,
        canPlayMore,
        needsAd,
        watchAd,
        getTotalPlaysUsed,
        getTotalPlaysAvailable,
        getPlaysUntilNextAd,
        maxAdViews: MAX_AD_VIEWS,
      }}
    >
      {children}
    </PlayLimitContext.Provider>
  );
};

export const usePlayLimit = () => {
  const context = useContext(PlayLimitContext);
  if (!context) {
    throw new Error('usePlayLimit must be used within a PlayLimitProvider');
  }
  return context;
};