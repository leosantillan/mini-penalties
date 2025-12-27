import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NewsPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get(`${API}/announcements`);
        setAnnouncements(response.data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Get the title/description based on current language
  const getLocalizedText = (announcement, field) => {
    const langField = `${field}_${language}`;
    return announcement[langField] || announcement[`${field}_en`];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

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

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            <p>{t('noAnnouncements') || 'No announcements yet. Check back soon!'}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card 
                key={announcement.announcement_id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{announcement.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">
                      {getLocalizedText(announcement, 'title')}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {getLocalizedText(announcement, 'description')}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{announcement.date}</span>
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
        )}

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
