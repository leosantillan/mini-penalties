import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CountriesManager = () => {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [formData, setFormData] = useState({
    country_id: '',
    name: '',
    flag: '',
    color: '#000000',
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${API}/admin/countries`, {
        headers: getAuthHeaders(),
      });
      setCountries(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch countries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCountry) {
        await axios.put(
          `${API}/admin/countries/${editingCountry.country_id}`,
          formData,
          { headers: getAuthHeaders() }
        );
        toast({ title: 'Success', description: 'Country updated successfully' });
      } else {
        await axios.post(`${API}/admin/countries`, formData, {
          headers: getAuthHeaders(),
        });
        toast({ title: 'Success', description: 'Country created successfully' });
      }

      fetchCountries();
      closeModal();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save country',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (countryId) => {
    if (!window.confirm('Are you sure you want to delete this country?')) return;

    try {
      await axios.delete(`${API}/admin/countries/${countryId}`, {
        headers: getAuthHeaders(),
      });
      toast({ title: 'Success', description: 'Country deleted successfully' });
      fetchCountries();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete country',
        variant: 'destructive',
      });
    }
  };

  const openModal = (country = null) => {
    if (country) {
      setEditingCountry(country);
      setFormData({
        country_id: country.country_id,
        name: country.name,
        flag: country.flag,
        color: country.color,
      });
    } else {
      setEditingCountry(null);
      setFormData({
        country_id: '',
        name: '',
        flag: '',
        color: '#000000',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCountry(null);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading countries...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Countries</h1>
          <p className="text-gray-600 mt-2">Manage countries in the Mini Cup</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Country
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((country) => (
          <Card key={country.country_id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-5xl">{country.flag}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openModal(country)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(country.country_id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{country.name}</h3>
            <div className="mt-2 flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: country.color }}
              />
              <span className="text-sm text-gray-500">{country.color}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">ID: {country.country_id}</p>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCountry ? 'Edit Country' : 'Add New Country'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="country_id">Country ID</Label>
              <Input
                id="country_id"
                value={formData.country_id}
                onChange={(e) =>
                  setFormData({ ...formData, country_id: e.target.value })
                }
                placeholder="e.g., france"
                required
                disabled={editingCountry !== null}
              />
            </div>

            <div>
              <Label htmlFor="name">Country Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., France"
                required
              />
            </div>

            <div>
              <Label htmlFor="flag">Flag Emoji</Label>
              <Input
                id="flag"
                value={formData.flag}
                onChange={(e) =>
                  setFormData({ ...formData, flag: e.target.value })
                }
                placeholder="🇫🇷"
                required
              />
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-20"
                />
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCountry ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CountriesManager;
