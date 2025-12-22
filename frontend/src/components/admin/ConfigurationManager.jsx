import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Settings, Save, RefreshCw, Play, Eye, Share2, Gift } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ConfigurationManager = () => {
  const [config, setConfig] = useState({
    free_plays: 2,
    plays_per_ad: 2,
    plays_per_share: 2,
    max_ad_views: 5,
    max_share_rewards: 3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/admin/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfig(response.data);
    } catch (error) {
      console.error('Error fetching config:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(`${API}/admin/config`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfig(response.data);
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setConfig(prev => ({ ...prev, [field]: numValue }));
  };

  const calculateTotalPlays = () => {
    return config.free_plays + 
           (config.plays_per_ad * config.max_ad_views) + 
           (config.plays_per_share * config.max_share_rewards);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Game Configuration
          </h1>
          <p className="text-gray-600 mt-1">Manage play limits and rewards settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plays */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              Free Plays
            </CardTitle>
            <CardDescription>
              Initial free plays without watching ads or sharing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="free_plays">Number of free plays</Label>
              <Input
                id="free_plays"
                type="number"
                min="0"
                max="100"
                value={config.free_plays}
                onChange={(e) => handleChange('free_plays', e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-gray-500">
                Players get this many plays when they start
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plays per Ad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Plays per Ad View
            </CardTitle>
            <CardDescription>
              Plays rewarded after watching an advertisement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="plays_per_ad">Plays per ad watched</Label>
              <Input
                id="plays_per_ad"
                type="number"
                min="1"
                max="100"
                value={config.plays_per_ad}
                onChange={(e) => handleChange('plays_per_ad', e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-gray-500">
                Players get this many plays after watching an ad
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plays per Share */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              Plays per Share
            </CardTitle>
            <CardDescription>
              Plays rewarded after sharing on social media
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="plays_per_share">Plays per share</Label>
              <Input
                id="plays_per_share"
                type="number"
                min="1"
                max="100"
                value={config.plays_per_share}
                onChange={(e) => handleChange('plays_per_share', e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-gray-500">
                Players get this many plays after sharing
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Max Ad Views */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-orange-600" />
              Max Ad Views per Day
            </CardTitle>
            <CardDescription>
              Maximum times a player can watch ads for plays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="max_ad_views">Maximum ad views</Label>
              <Input
                id="max_ad_views"
                type="number"
                min="0"
                max="100"
                value={config.max_ad_views}
                onChange={(e) => handleChange('max_ad_views', e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-gray-500">
                After this, player must wait until next day
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Max Share Rewards */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-green-600" />
              Max Share Rewards per Day
            </CardTitle>
            <CardDescription>
              Maximum times a player can share for plays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="max_share_rewards">Maximum share rewards</Label>
              <Input
                id="max_share_rewards"
                type="number"
                min="0"
                max="100"
                value={config.max_share_rewards}
                onChange={(e) => handleChange('max_share_rewards', e.target.value)}
                className="text-lg max-w-xs"
              />
              <p className="text-sm text-gray-500">
                After this, sharing won't give more plays until next day
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-white">Daily Play Summary</CardTitle>
          <CardDescription className="text-blue-100">
            Based on current configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <div className="text-3xl font-bold">{config.free_plays}</div>
              <div className="text-blue-100 text-sm">Free Plays</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <div className="text-3xl font-bold">{config.plays_per_ad * config.max_ad_views}</div>
              <div className="text-blue-100 text-sm">From Ads</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <div className="text-3xl font-bold">{config.plays_per_share * config.max_share_rewards}</div>
              <div className="text-blue-100 text-sm">From Shares</div>
            </div>
            <div className="text-center p-4 bg-white/20 rounded-lg border-2 border-white/30">
              <div className="text-4xl font-bold">{calculateTotalPlays()}</div>
              <div className="text-blue-100 text-sm">Max Daily Plays</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationManager;
