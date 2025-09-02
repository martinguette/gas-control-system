'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  ShoppingCart,
  BarChart3,
  User,
  LogOut,
  Fuel,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { logOut } from '@/actions/auth';

interface VendorLayoutProps {
  children: ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const { authState } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Fuel className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Gas Control
              </h1>
              <p className="text-sm text-muted-foreground">Panel Vendedor</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {authState.user?.full_name}
            </p>
            <p className="text-xs text-muted-foreground">Vendedor</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">{children}</main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="grid grid-cols-5 gap-1 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center py-3 h-auto"
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs">Inicio</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center py-3 h-auto"
          >
            <ShoppingCart className="h-5 w-5 mb-1" />
            <span className="text-xs">Ventas</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center py-3 h-auto"
          >
            <BarChart3 className="h-5 w-5 mb-1" />
            <span className="text-xs">Reportes</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center py-3 h-auto"
          >
            <User className="h-5 w-5 mb-1" />
            <span className="text-xs">Perfil</span>
          </Button>
          <form action={logOut} className="contents">
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center py-3 h-auto"
              type="submit"
            >
              <LogOut className="h-5 w-5 mb-1" />
              <span className="text-xs">Salir</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
