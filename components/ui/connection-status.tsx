'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  className?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ConnectionStatus({
  className,
  onRetry,
  isRetrying = false,
}: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Verificar estado inicial
    setIsOnline(navigator.onLine);
    setLastSync(new Date());

    // Escuchar cambios de conectividad
    const handleOnline = () => {
      setIsOnline(true);
      setShowWarning(false);
      setLastSync(new Date());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowWarning(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getLastSyncText = () => {
    if (!lastSync) return '';
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  if (isRetrying) {
    return (
      <Badge variant="secondary" className={className}>
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        Sincronizando...
      </Badge>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className={className}>
          <WifiOff className="h-3 w-3 mr-1" />
          Sin conexión
        </Badge>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (showWarning) {
    return (
      <Badge variant="secondary" className={className}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        Conexión restaurada
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`text-green-600 border-green-600 ${className}`}
    >
      <Wifi className="h-3 w-3 mr-1" />
      Conectado {getLastSyncText() && `(${getLastSyncText()})`}
    </Badge>
  );
}
