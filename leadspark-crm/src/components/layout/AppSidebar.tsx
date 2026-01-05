import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Phone,
  Calendar,
  LogOut,
  ChevronLeft,
  Briefcase,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebarContext } from './AppLayout';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Briefcase, label: 'All Leads', path: '/leads' },
  { icon: Calendar, label: 'Follow-Ups', path: '/follow-ups' },
  { icon: Phone, label: 'Call History', path: '/call-history' },
  { icon: UserCog, label: 'Users', path: '/users' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const employeeNavItems = [
  { icon: Briefcase, label: 'My Leads', path: '/leads' },
  { icon: Calendar, label: 'Follow-Ups', path: '/follow-ups' },
  { icon: Phone, label: 'Call History', path: '/call-history' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function AppSidebar() {
  const { user, isAdmin, signOut } = useAuth();
  const { collapsed, setCollapsed } = useSidebarContext();

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border shadow-xl z-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl from-sidebar-primary to-blue-600 flex items-center justify-center overflow-hidden">
              <img
                src="/public/android-chrome-512x512.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="font-display font-bold text-lg text-sidebar-accent-foreground tracking-tight">
              Nucleosys LeadFlow
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-all duration-200"
        >
          <ChevronLeft
            className={cn(
              'w-4 h-4 transition-transform duration-300',
              collapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ animationDelay: `${index * 50}ms` }}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 animate-fade-in',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground hover:translate-x-1'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
        {!collapsed && user && (
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-accent-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-sidebar-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                isAdmin
                  ? 'bg-gradient-to-r from-sidebar-primary/20 to-blue-600/20 text-sidebar-primary'
                  : 'bg-sidebar-accent text-sidebar-accent-foreground'
              )}
            >
              {user.role}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={signOut}
          className={cn(
            'text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200',
            !collapsed && 'w-full justify-start'
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
