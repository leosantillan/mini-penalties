import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Edit, Trash2, Shield, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UsersManager = () => {
  const { getAuthHeaders, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [teams, setTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    country_id: '',
    team_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.country_id) {
      fetchTeamsByCountry(formData.country_id);
    } else {
      setTeams([]);
    }
  }, [formData.country_id]);

  const fetchData = async () => {
    try {
      const [usersRes, countriesRes, teamsRes] = await Promise.all([
        axios.get(`${API}/admin/users`, { headers: getAuthHeaders() }),
        axios.get(`${API}/admin/countries`, { headers: getAuthHeaders() }),
        axios.get(`${API}/admin/teams`, { headers: getAuthHeaders() }),
      ]);
      setUsers(usersRes.data);
      setCountries(countriesRes.data);
      setAllTeams(teamsRes.data);
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

  const fetchTeamsByCountry = async (countryId) => {
    try {
      const response = await axios.get(`${API}/countries/${countryId}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Update user
        const updateData = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          country_id: formData.country_id || null,
          team_id: formData.team_id || null,
        };
        
        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }

        await axios.put(
          `${API}/admin/users/${editingUser.user_id}`,
          updateData,
          { headers: getAuthHeaders() }
        );
        toast({ title: 'Success', description: 'User updated successfully' });
      } else {
        // Create new user
        await axios.post(
          `${API}/auth/register`,
          {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            country_id: formData.country_id || null,
            team_id: formData.team_id || null,
          }
        );
        toast({ title: 'Success', description: 'User created successfully' });
      }

      fetchData();
      closeModal();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save user',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser.user_id) {
      toast({
        title: 'Error',
        description: 'You cannot delete your own account',
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${API}/admin/users/${userId}`, {
        headers: getAuthHeaders(),
      });
      toast({ title: 'Success', description: 'User deleted successfully' });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        country_id: user.country_id || '',
        team_id: user.team_id || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        country_id: '',
        team_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const getTeamInfo = (teamId) => {
    return allTeams.find(t => t.team_id === teamId);
  };

  const getCountryInfo = (countryId) => {
    return countries.find(c => c.country_id === countryId);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-600 mt-2">Manage users and their roles</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Favorite Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username}
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {user.user_id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === 'admin' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      User
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.team_id ? (
                    <div className="flex items-center gap-2">
                      <span>{getCountryInfo(user.country_id)?.flag}</span>
                      <span className="text-sm text-gray-900">
                        {getTeamInfo(user.team_id)?.name}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">No favorite team</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user.user_id)}
                      disabled={user.user_id === currentUser.user_id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found. Create your first user!
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="johndoe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">
                Password {editingUser && '(leave blank to keep unchanged)'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={editingUser ? 'Enter new password' : 'Enter password'}
                required={!editingUser}
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Favorite Team (Optional)
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country_id">Country</Label>
                  <select
                    id="country_id"
                    value={formData.country_id}
                    onChange={(e) =>
                      setFormData({ ...formData, country_id: e.target.value, team_id: '' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  <Label htmlFor="team_id">Team</Label>
                  <select
                    id="team_id"
                    value={formData.team_id}
                    onChange={(e) =>
                      setFormData({ ...formData, team_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={!formData.country_id}
                  >
                    <option value="">Select a team</option>
                    {teams.map((team) => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {!formData.country_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      Select a country first
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManager;
