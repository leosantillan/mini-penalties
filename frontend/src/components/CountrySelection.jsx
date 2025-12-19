import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Trophy, ArrowLeft, Globe } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CountrySelection = ({ onCountrySelect, onBack }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(`${API}/countries`);
        setCountries(response.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-gray-800 text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-800">{t('chooseCountry')}</h1>
            </div>
            <p className="text-gray-600">{t('selectCountryDesc')}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((country) => (
            <Card 
              key={country.country_id}
              className="p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              style={{ borderTop: `6px solid ${country.color}` }}
              onClick={() => onCountrySelect(country)}
            >
              <div className="text-center">
                <div className="text-7xl mb-4 transform group-hover:scale-110 transition-transform">
                  {country.flag}
                </div>
                <h3 className="font-bold text-2xl text-gray-800 mb-4">{country.name}</h3>
                <Button 
                  className="w-full" 
                  style={{ backgroundColor: country.color }}
                >
                  {t('select')} {country.name}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CountrySelection;
