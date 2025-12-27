import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Trophy, Play, Settings, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

const LandingPage = ({ onStart, onStats }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Spinning ball animation
    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-green-700 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Language Selector */}
        <div className="mb-8 flex justify-center">
          <LanguageSelector />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Klasigol Logo */}
          <img 
            src="https://customer-assets.emergentagent.com/job_027d5a18-d686-4e2e-bf20-138bfe6449a9/artifacts/r2mdeoph_Klasigol-logo-transparente.png" 
            alt="Klasigol"
            className="h-28 sm:h-36 md:h-44 mx-auto mb-6 drop-shadow-lg"
          />
          <p className="text-xl sm:text-2xl text-green-100 mb-2">{t('clubWorldCup')}</p>
          <p className="text-base sm:text-lg text-green-200 mb-8 px-4">{t('tagline')}</p>
          
          <div className="flex flex-col gap-4 items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Button 
                onClick={onStart}
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 text-lg sm:text-xl px-8 sm:px-12 py-5 sm:py-6 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 font-bold w-full sm:w-auto"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 fill-current" />
                {t('startPlaying')}
              </Button>
              
              <Button 
                onClick={onStats}
                size="lg"
                variant="outline"
                className="bg-white/10 text-white hover:bg-white hover:text-green-600 border-2 border-white text-lg sm:text-xl px-8 py-5 sm:py-6 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 font-bold backdrop-blur-sm w-full sm:w-auto"
              >
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                {t('stats')}
              </Button>
            </div>
            
            <button
              onClick={() => navigate('/admin/login')}
              className="text-green-100 hover:text-white text-sm flex items-center gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {t('adminPanel')}
            </button>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-30">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('howToPlay')}</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-5xl mb-3">🌍</div>
              <h3 className="font-bold text-white mb-2">{t('step1Title')}</h3>
              <p className="text-green-100 text-sm">{t('step1Desc')}</p>
            </div>
            <div>
              <div className="text-5xl mb-3">🎯</div>
              <h3 className="font-bold text-white mb-2">{t('step2Title')}</h3>
              <p className="text-green-100 text-sm">{t('step2Desc')}</p>
            </div>
            <div>
              <div className="text-5xl mb-3">🏆</div>
              <h3 className="font-bold text-white mb-2">{t('step3Title')}</h3>
              <p className="text-green-100 text-sm">{t('step3Desc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;