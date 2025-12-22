import React, { createContext, useState, useContext, useEffect } from 'react';

const PlayLimitContext = createContext();

const PLAYS_PER_SESSION = 2;
const MAX_AD_VIEWS = 5;
const MAX_SHARE_REWARDS = 3; // Limit share rewards per day

export const PlayLimitProvider = ({ children }) => {
  const [playsRemaining, setPlaysRemaining] = useState(PLAYS_PER_SESSION);
  const [adViewsUsed, setAdViewsUsed] = useState(0);
  const [shareRewardsUsed, setShareRewardsUsed] = useState(0);
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
          setShareRewardsUsed(data.shareRewardsUsed || 0);
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

  const savePlayData = (plays, adViews, shares = shareRewardsUsed) => {
    const data = {
      playsRemaining: plays,
      adViewsUsed: adViews,
      shareRewardsUsed: shares,
      lastResetDate: new Date().toDateString(),
    };
    localStorage.setItem('playLimitData', JSON.stringify(data));
  };

  const resetPlayData = () => {
    const today = new Date().toDateString();
    setPlaysRemaining(PLAYS_PER_SESSION);
    setAdViewsUsed(0);
    setShareRewardsUsed(0);
    setLastResetDate(today);
    savePlayData(PLAYS_PER_SESSION, 0, 0);
  };

  const usePlay = () => {
    if (playsRemaining > 0) {
      const newPlays = playsRemaining - 1;
      setPlaysRemaining(newPlays);
      savePlayData(newPlays, adViewsUsed, shareRewardsUsed);
      return true;
    }
    return false;
  };

  const canPlayMore = () => {
    return playsRemaining > 0 || (adViewsUsed < MAX_AD_VIEWS) || (shareRewardsUsed < MAX_SHARE_REWARDS);
  };

  const needsAd = () => {
    return playsRemaining === 0 && adViewsUsed < MAX_AD_VIEWS;
  };

  const canShareForPlays = () => {
    return playsRemaining === 0 && shareRewardsUsed < MAX_SHARE_REWARDS;
  };

  const shareForPlays = () => {
    if (shareRewardsUsed < MAX_SHARE_REWARDS) {
      const newShareRewards = shareRewardsUsed + 1;
      const newPlays = PLAYS_PER_SESSION;
      setShareRewardsUsed(newShareRewards);
      setPlaysRemaining(newPlays);
      savePlayData(newPlays, adViewsUsed, newShareRewards);
      return true;
    }
    return false;
  };

  const watchAd = () => {
    if (adViewsUsed < MAX_AD_VIEWS) {
      const newAdViews = adViewsUsed + 1;
      const newPlays = PLAYS_PER_SESSION;
      setAdViewsUsed(newAdViews);
      setPlaysRemaining(newPlays);
      savePlayData(newPlays, newAdViews, shareRewardsUsed);
      setShowAdModal(false);
      return true;
    }
    return false;
  };

  const getTotalPlaysUsed = () => {
    return (adViewsUsed * PLAYS_PER_SESSION) + (shareRewardsUsed * PLAYS_PER_SESSION) + (PLAYS_PER_SESSION - playsRemaining);
  };

  const getTotalPlaysAvailable = () => {
    return (MAX_AD_VIEWS + MAX_SHARE_REWARDS + 1) * PLAYS_PER_SESSION;
  };

  const getPlaysUntilNextAd = () => {
    return playsRemaining;
  };

  return (
    <PlayLimitContext.Provider
      value={{
        playsRemaining,
        adViewsUsed,
        shareRewardsUsed,
        showAdModal,
        setShowAdModal,
        usePlay,
        canPlayMore,
        needsAd,
        canShareForPlays,
        shareForPlays,
        watchAd,
        getTotalPlaysUsed,
        getTotalPlaysAvailable,
        getPlaysUntilNextAd,
        maxAdViews: MAX_AD_VIEWS,
        maxShareRewards: MAX_SHARE_REWARDS,
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