import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, Globe } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-gray-800 text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Globe className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{t('chooseCountry')}</h1>
            </div>
            <p className="text-gray-600">{t('selectCountryDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {countries.map((country) => (
            <Card 
              key={country.country_id}
              className="p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col items-center text-center"
              onClick={() => onCountrySelect(country)}
            >
              {/* Flag */}
              <div className="text-5xl sm:text-6xl mb-2">
                {country.flag}
              </div>
              
              {/* Country Name */}
              <h3 className="font-bold text-sm sm:text-base text-gray-800">{country.name}</h3>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CountrySelection;
