import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const PlayLimitContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Default values (used before config is loaded)
const DEFAULT_CONFIG = {
  free_plays: 2,
  plays_per_ad: 2,
  plays_per_share: 2,
  max_ad_views: 5,
  max_share_rewards: 3,
};

export const PlayLimitProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [playsRemaining, setPlaysRemaining] = useState(DEFAULT_CONFIG.free_plays);
  const [adViewsUsed, setAdViewsUsed] = useState(0);
  const [shareRewardsUsed, setShareRewardsUsed] = useState(0);
  const [lastResetDate, setLastResetDate] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);

  // Fetch configuration from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${API}/config`);
        setConfig(response.data);
        setConfigLoaded(true);
      } catch (error) {
        console.error('Error fetching config, using defaults:', error);
        setConfigLoaded(true);
      }
    };
    fetchConfig();
  }, []);

  // Load play data after config is loaded
  useEffect(() => {
    if (configLoaded) {
      loadPlayData();
    }
  }, [configLoaded, config]);

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
          setPlaysRemaining(data.playsRemaining ?? 0);
          setAdViewsUsed(data.adViewsUsed ?? 0);
          setShareRewardsUsed(data.shareRewardsUsed ?? 0);
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
    setPlaysRemaining(config.free_plays);
    setAdViewsUsed(0);
    setShareRewardsUsed(0);
    setLastResetDate(today);
    savePlayData(config.free_plays, 0, 0);
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
    return playsRemaining > 0 || (adViewsUsed < config.max_ad_views) || (shareRewardsUsed < config.max_share_rewards);
  };

  const needsAd = () => {
    return playsRemaining === 0 && adViewsUsed < config.max_ad_views;
  };

  const canShareForPlays = () => {
    return playsRemaining === 0 && shareRewardsUsed < config.max_share_rewards;
  };

  const shareForPlays = () => {
    if (shareRewardsUsed < config.max_share_rewards) {
      const newShareRewards = shareRewardsUsed + 1;
      const newPlays = config.plays_per_share;
      setShareRewardsUsed(newShareRewards);
      setPlaysRemaining(newPlays);
      savePlayData(newPlays, adViewsUsed, newShareRewards);
      return true;
    }
    return false;
  };

  const watchAd = () => {
    if (adViewsUsed < config.max_ad_views) {
      const newAdViews = adViewsUsed + 1;
      const newPlays = config.plays_per_ad;
      setAdViewsUsed(newAdViews);
      setPlaysRemaining(newPlays);
      savePlayData(newPlays, newAdViews, shareRewardsUsed);
      setShowAdModal(false);
      return true;
    }
    return false;
  };

  const getTotalPlaysUsed = () => {
    return (adViewsUsed * config.plays_per_ad) + (shareRewardsUsed * config.plays_per_share) + (config.free_plays - playsRemaining);
  };

  const getTotalPlaysAvailable = () => {
    return config.free_plays + (config.max_ad_views * config.plays_per_ad) + (config.max_share_rewards * config.plays_per_share);
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
        maxAdViews: config.max_ad_views,
        maxShareRewards: config.max_share_rewards,
        config,
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