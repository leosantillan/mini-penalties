import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Edit, Trash2, Shirt } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import ShirtBuilder from './ShirtBuilder';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TeamsManager = () => {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    team_id: '',
    name: '',
    country_id: '',
    color: '#000000',
  });
  const [shirtDesign, setShirtDesign] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, countriesRes] = await Promise.all([
        axios.get(`${API}/admin/teams`, { headers: getAuthHeaders() }),
        axios.get(`${API}/admin/countries`, { headers: getAuthHeaders() }),
      ]);
      setTeams(teamsRes.data);
      setCountries(countriesRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTeam) {
        await axios.put(
          `${API}/admin/teams/${editingTeam.team_id}`,
          formData,
          { headers: getAuthHeaders() }
        );
        toast({ title: 'Success', description: 'Team updated successfully' });
      } else {
        await axios.post(`${API}/admin/teams`, formData, {
          headers: getAuthHeaders(),
        });
        toast({ title: 'Success', description: 'Team created successfully' });
      }

      fetchData();
      closeModal();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save team',
        variant: 'destructive',
      });
    }
  };

  const handleSaveShirtDesign = async (design) => {
    try {
      // Convert grid to canvas and create blob
      const canvas = document.createElement('canvas');
      const cellSize = 20;
      canvas.width = 24 * cellSize;
      canvas.height = 24 * cellSize;
      const ctx = canvas.getContext('2d');

      design.grid.forEach((row, rowIndex) => {
        row.forEach((color, colIndex) => {
          ctx.fillStyle = color;
          ctx.fillRect(
            colIndex * cellSize,
            rowIndex * cellSize,
            cellSize,
            cellSize
          );
        });
      });

      // Convert to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });

      // Upload to backend
      const formData = new FormData();
      formData.append('file', blob, 'shirt-design.png');

      const response = await axios.post(
        `${API}/admin/teams/${editingTeam.team_id}/shirt`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Save design data to localStorage for editing later
      localStorage.setItem(
        `shirt_design_${editingTeam.team_id}`,
        JSON.stringify(design)
      );

      toast({
        title: 'Success',
        description: 'Shirt design saved successfully',
      });

      fetchData();
      setActiveTab('details');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save shirt design',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      await axios.delete(`${API}/admin/teams/${teamId}`, {
        headers: getAuthHeaders(),
      });
      toast({ title: 'Success', description: 'Team deleted successfully' });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete team',
        variant: 'destructive',
      });
    }
  };

  const openModal = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        team_id: team.team_id,
        name: team.name,
        country_id: team.country_id,
        color: team.color,
      });
      // Load saved shirt design if exists
      const savedDesign = localStorage.getItem(`shirt_design_${team.team_id}`);
      if (savedDesign) {
        setShirtDesign(JSON.parse(savedDesign));
      } else {
        setShirtDesign(null);
      }
    } else {
      setEditingTeam(null);
      setFormData({
        team_id: '',
        name: '',
        country_id: '',
        color: '#000000',
      });
      setShirtDesign(null);
    }
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setShirtDesign(null);
    setActiveTab('details');
  };

  const formatGoals = (goals) => {
    if (goals >= 1000000) {
      return `${(goals / 1000000).toFixed(1)}M`;
    }
    return goals.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Teams</h1>
          <p className="text-gray-600 mt-2">Manage teams in the Mini Cup</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Team
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.team_id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{team.flag}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
                  <p className="text-sm text-gray-500">{team.country_name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openModal(team)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(team.team_id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {team.shirt_design_url && (
              <div className="mb-3">
                <img
                  src={`${BACKEND_URL}${team.shirt_design_url}`}
                  alt="Shirt design"
                  className="w-24 h-24 object-contain border-2 border-gray-200 rounded bg-gray-50"
                  onError={(e) => {
                    console.error('Failed to load shirt image:', `${BACKEND_URL}${team.shirt_design_url}`);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-sm text-gray-500">{team.color}</span>
              </div>
              <div>
                <span className="text-2xl font-bold" style={{ color: team.color }}>
                  {formatGoals(team.goals)}
                </span>
                <span className="text-sm text-gray-500 ml-2">goals</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">ID: {team.team_id}</p>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTeam ? 'Edit Team' : 'Add New Team'}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Team Details</TabsTrigger>
              <TabsTrigger value="shirt" disabled={!editingTeam}>
                <Shirt className="w-4 h-4 mr-2" />
                Shirt Builder
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="team_id">Team ID</Label>
                  <Input
                    id="team_id"
                    value={formData.team_id}
                    onChange={(e) =>
                      setFormData({ ...formData, team_id: e.target.value })
                    }
                    placeholder="e.g., france1"
                    required
                    disabled={editingTeam !== null}
                  />
                </div>

                <div>
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Les Bleus"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="country_id">Country</Label>
                  <select
                    id="country_id"
                    value={formData.country_id}
                    onChange={(e) =>
                      setFormData({ ...formData, country_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.country_id} value={country.country_id}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="color">Team Color</Label>
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
                    {editingTeam ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="shirt">
              {editingTeam && (
                <ShirtBuilder
                  initialDesign={shirtDesign}
                  onSave={handleSaveShirtDesign}
                />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsManager;