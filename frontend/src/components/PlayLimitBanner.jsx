import React from 'react';
import { Card } from './ui/card';
import { Trophy, Calendar, Eye } from 'lucide-react';
import { usePlayLimit } from '../contexts/PlayLimitContext';
import { useLanguage } from '../contexts/LanguageContext';

const PlayLimitBanner = () => {
  const {
    playsRemaining,
    adViewsUsed,
    maxAdViews,
    getTotalPlaysUsed,
    getTotalPlaysAvailable,
  } = usePlayLimit();
  const { t } = useLanguage();

  const totalUsed = getTotalPlaysUsed();
  const totalAvailable = getTotalPlaysAvailable();
  const percentage = (totalUsed / totalAvailable) * 100;

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-full">
            <Trophy className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('playsRemaining')}</p>
            <p className="text-2xl font-bold text-blue-600">{playsRemaining}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">{t('adViewsUsed')}</p>
            <p className="text-xl font-bold text-purple-600">
              {adViewsUsed} / {maxAdViews}
            </p>
          </div>
          <div className="bg-white p-3 rounded-full">
            <Eye className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">{t('totalToday')}</p>
            <p className="text-xl font-bold text-green-600">
              {totalUsed} / {totalAvailable}
            </p>
          </div>
          <div className="bg-white p-3 rounded-full">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">
          {totalAvailable - totalUsed} {t('playsRemainingToday')}
        </p>
      </div>
    </Card>
  );
};

export default PlayLimitBanner;
