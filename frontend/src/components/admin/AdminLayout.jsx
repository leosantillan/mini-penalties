import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { Button } from '../ui/button';
import { LayoutDashboard, Globe, Users, Trophy, BarChart3, LogOut, Home, Settings, Megaphone } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAdmin()) {
      navigate('/admin/login');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Globe, label: 'Countries', path: '/admin/countries' },
    { icon: Trophy, label: 'Teams', path: '/admin/teams' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
    { icon: BarChart3, label: 'Statistics', path: '/admin/statistics' },
    { icon: Settings, label: 'Configuration', path: '/admin/configuration' },
  ];

  if (!isAdmin()) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">⚽ Mini Cup</h1>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="mb-3 px-4 py-2 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="text-white font-medium">{user?.username}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white mb-2"
            onClick={() => navigate('/')}
          >
            <Home className="w-5 h-5 mr-3" />
            Back to Game
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:bg-red-900 hover:text-red-300"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;