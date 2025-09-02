'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  Fuel,
  LayoutDashboard as Dashboard,
  FileText,
  TrendingUp,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sidebar-accent rounded-lg flex items-center justify-center">
                <Fuel className="w-6 h-6 text-sidebar-accent-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-sidebar-foreground">
                  Gas Control
                </h2>
                <p className="text-sm text-muted-foreground">
                  Panel Administrativo
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Dashboard className="mr-3 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <BarChart3 className="mr-3 h-4 w-4" />
              Análisis
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Users className="mr-3 h-4 w-4" />
              Usuarios
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <FileText className="mr-3 h-4 w-4" />
              Reportes
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <TrendingUp className="mr-3 h-4 w-4" />
              Ventas
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="mr-3 h-4 w-4" />
              Configuración
            </Button>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="mb-3">
              <p className="text-sm font-medium text-sidebar-foreground">
                {authState.user?.full_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {authState.user?.email}
              </p>
            </div>
            <form action={logOut}>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                type="submit"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
