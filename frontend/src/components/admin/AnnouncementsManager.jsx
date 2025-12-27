import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ICON_OPTIONS = ['📣', '🏆', '⚽', '🎮', '🎯', '🌍', '⭐', '🔥', '💪', '🎉'];

const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_es: '',
    title_pt: '',
    title_fr: '',
    title_it: '',
    description_en: '',
    description_es: '',
    description_pt: '',
    description_fr: '',
    description_it: '',
    icon: '📣',
    date: new Date().toISOString().split('T')[0],
    is_active: true,
    order: 0
  });
  const { toast } = useToast();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API}/admin/announcements`, {
        headers: getAuthHeaders()
      });
      setAnnouncements(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch announcements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_es: '',
      title_pt: '',
      title_fr: '',
      title_it: '',
      description_en: '',
      description_es: '',
      description_pt: '',
      description_fr: '',
      description_it: '',
      icon: '📣',
      date: new Date().toISOString().split('T')[0],
      is_active: true,
      order: announcements.length
    });
    setEditingAnnouncement(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await axios.put(
          `${API}/admin/announcements/${editingAnnouncement.announcement_id}`,
          formData,
          { headers: getAuthHeaders() }
        );
        toast({ title: 'Success', description: 'Announcement updated successfully' });
      } else {
        await axios.post(`${API}/admin/announcements`, formData, {
          headers: getAuthHeaders()
        });
        toast({ title: 'Success', description: 'Announcement created successfully' });
      }
      fetchAnnouncements();
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save announcement',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title_en: announcement.title_en,
      title_es: announcement.title_es,
      title_pt: announcement.title_pt,
      title_fr: announcement.title_fr,
      title_it: announcement.title_it,
      description_en: announcement.description_en,
      description_es: announcement.description_es,
      description_pt: announcement.description_pt,
      description_fr: announcement.description_fr,
      description_it: announcement.description_it,
      icon: announcement.icon,
      date: announcement.date,
      is_active: announcement.is_active,
      order: announcement.order
    });
    setShowForm(true);
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`${API}/admin/announcements/${announcementId}`, {
        headers: getAuthHeaders()
      });
      toast({ title: 'Success', description: 'Announcement deleted successfully' });
      fetchAnnouncements();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete announcement',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (announcement) => {
    try {
      await axios.put(
        `${API}/admin/announcements/${announcement.announcement_id}`,
        { is_active: !announcement.is_active },
        { headers: getAuthHeaders() }
      );
      fetchAnnouncements();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update announcement',
        variant: 'destructive'
      });
    }
  };

  const updateOrder = async (announcement, direction) => {
    const newOrder = direction === 'up' ? announcement.order - 1 : announcement.order + 1;
    try {
      await axios.put(
        `${API}/admin/announcements/${announcement.announcement_id}`,
        { order: newOrder },
        { headers: getAuthHeaders() }
      );
      fetchAnnouncements();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Announcement
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Icon and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icon</Label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`text-2xl p-2 rounded ${
                          formData.icon === icon ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                        }`}
                        onClick={() => setFormData({ ...formData, icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Titles */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Titles (Multilingual)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>English 🇬🇧</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      placeholder="Title in English"
                      required
                    />
                  </div>
                  <div>
                    <Label>Spanish 🇪🇸</Label>
                    <Input
                      value={formData.title_es}
                      onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                      placeholder="Título en Español"
                      required
                    />
                  </div>
                  <div>
                    <Label>Portuguese 🇧🇷</Label>
                    <Input
                      value={formData.title_pt}
                      onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                      placeholder="Título em Português"
                      required
                    />
                  </div>
                  <div>
                    <Label>French 🇫🇷</Label>
                    <Input
                      value={formData.title_fr}
                      onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                      placeholder="Titre en Français"
                      required
                    />
                  </div>
                  <div>
                    <Label>Italian 🇮🇹</Label>
                    <Input
                      value={formData.title_it}
                      onChange={(e) => setFormData({ ...formData, title_it: e.target.value })}
                      placeholder="Titolo in Italiano"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Descriptions (Multilingual)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>English 🇬🇧</Label>
                    <Input
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      placeholder="Description in English"
                      required
                    />
                  </div>
                  <div>
                    <Label>Spanish 🇪🇸</Label>
                    <Input
                      value={formData.description_es}
                      onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                      placeholder="Descripción en Español"
                      required
                    />
                  </div>
                  <div>
                    <Label>Portuguese 🇧🇷</Label>
                    <Input
                      value={formData.description_pt}
                      onChange={(e) => setFormData({ ...formData, description_pt: e.target.value })}
                      placeholder="Descrição em Português"
                      required
                    />
                  </div>
                  <div>
                    <Label>French 🇫🇷</Label>
                    <Input
                      value={formData.description_fr}
                      onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                      placeholder="Description en Français"
                      required
                    />
                  </div>
                  <div>
                    <Label>Italian 🇮🇹</Label>
                    <Input
                      value={formData.description_it}
                      onChange={(e) => setFormData({ ...formData, description_it: e.target.value })}
                      placeholder="Descrizione in Italiano"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active">Active (visible on Coming Soon page)</Label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAnnouncement ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No announcements yet. Click "Add Announcement" to create one.
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.announcement_id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{announcement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{announcement.title_en}</h3>
                    {!announcement.is_active && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{announcement.description_en}</p>
                  <p className="text-gray-400 text-xs mt-1">Date: {announcement.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateOrder(announcement, 'up')}
                    disabled={announcement.order === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateOrder(announcement, 'down')}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(announcement)}
                  >
                    {announcement.is_active ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(announcement.announcement_id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsManager;
