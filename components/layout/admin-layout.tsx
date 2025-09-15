'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  Fuel,
  LayoutDashboard as Dashboard,
  FileText,
  TrendingUp,
  Package,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { logOut } from '@/actions/auth';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { authState } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      href: '/dashboard/admin',
      icon: Dashboard,
      label: 'Dashboard',
    },
    {
      href: '/dashboard/admin/inventory',
      icon: Package,
      label: 'Inventario',
    },
    {
      href: '/dashboard/admin/vendors',
      icon: Users,
      label: 'Vendedores',
    },
    {
      href: '/dashboard/admin/reports',
      icon: FileText,
      label: 'Reportes',
    },
    {
      href: '/dashboard/admin/assignments',
      icon: TrendingUp,
      label: 'Asignaciones',
    },
    {
      href: '/dashboard/admin/settings',
      icon: Settings,
      label: 'Configuración',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {sidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-sidebar-accent rounded-lg flex items-center justify-center">
                <Fuel className="w-5 h-5 lg:w-6 lg:h-6 text-sidebar-accent-foreground" />
              </div>
              <div>
                <h2 className="text-base lg:text-lg font-semibold text-sidebar-foreground">
                  Gas Control
                </h2>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  Panel Administrativo
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block"
                onClick={() => setSidebarOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  size="sm"
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  <span className="text-sm lg:text-base">{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-3 lg:p-4 border-t border-sidebar-border">
            <div className="mb-3">
              <p className="text-xs lg:text-sm font-medium text-sidebar-foreground truncate">
                {authState.user?.full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {authState.user?.email}
              </p>
            </div>
            <form action={logOut}>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                type="submit"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-xs lg:text-sm">Cerrar Sesión</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        <main className="p-4 lg:p-6 pt-16 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}
