import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const AdminLogin = ({ onBack }) => {
  const [email, setEmail] = useState('admin@minicup.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
      navigate('/admin/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 text-white hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Game
        </Button>

        <Card className="p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-4 rounded-full">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Admin Panel</h2>
            <p className="text-gray-600 mt-2">Sign in to manage the Mini Cup</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@minicup.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Default Admin Credentials:</p>
            <p className="text-xs text-gray-500 mt-1">Email: admin@minicup.com</p>
            <p className="text-xs text-gray-500">Password: admin123</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;