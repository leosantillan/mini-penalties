import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const NewsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Sample news items - these would typically come from an API
  const newsItems = [
    {
      id: 1,
      titleKey: 'news1Title',
      descKey: 'news1Desc',
      date: '2025-01-15',
      icon: '🏆',
    },
    {
      id: 2,
      titleKey: 'news2Title',
      descKey: 'news2Desc',
      date: '2025-01-10',
      icon: '⚽',
    },
    {
      id: 3,
      titleKey: 'news3Title',
      descKey: 'news3Desc',
      date: '2025-01-05',
      icon: '🎮',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">{t('comingSoon')}</h1>
            <p className="text-gray-600">{t('newsSubtitle')}</p>
          </div>
        </div>

        {/* News List */}
        <div className="space-y-4">
          {newsItems.map((news) => (
            <Card 
              key={news.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{news.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{t(news.titleKey)}</h3>
                  <p className="text-gray-600 mb-3">{t(news.descKey)}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{news.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{t('comingSoonLabel')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stay Tuned Message */}
        <div className="mt-8 text-center">
          <div className="bg-green-100 rounded-2xl p-6 border-2 border-green-200">
            <div className="text-5xl mb-3">📣</div>
            <h3 className="font-bold text-xl text-green-800 mb-2">{t('stayTuned')}</h3>
            <p className="text-green-700">{t('stayTunedDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
