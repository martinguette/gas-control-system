'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface PendingSale {
  id: string;
  saleData: any;
  timestamp: number;
  retryCount: number;
}

interface UseOfflineManagerReturn {
  isOnline: boolean;
  pendingSales: PendingSale[];
  addPendingSale: (saleData: any) => string;
  removePendingSale: (id: string) => void;
  syncPendingSales: () => Promise<void>;
  canWorkOffline: boolean;
  lastSyncTime: Date | null;
}

const PENDING_SALES_KEY = 'gas-control-pending-sales';
const LAST_SYNC_KEY = 'gas-control-last-sync';

export function useOfflineManager(): UseOfflineManagerReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Cargar datos al inicializar
  useEffect(() => {
    loadPendingSales();
    loadLastSyncTime();
    setupOnlineListener();
  }, []);

  const setupOnlineListener = useCallback(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexión restaurada');
      // Intentar sincronizar automáticamente
      syncPendingSales();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Sin conexión - Modo offline activado');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar estado inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingSales = useCallback(() => {
    try {
      const stored = localStorage.getItem(PENDING_SALES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPendingSales(parsed);
        console.log('📦 Ventas pendientes cargadas:', parsed.length);
      }
    } catch (error) {
      console.error('Error cargando ventas pendientes:', error);
    }
  }, []);

  const savePendingSales = useCallback((sales: PendingSale[]) => {
    try {
      localStorage.setItem(PENDING_SALES_KEY, JSON.stringify(sales));
    } catch (error) {
      console.error('Error guardando ventas pendientes:', error);
    }
  }, []);

  const loadLastSyncTime = useCallback(() => {
    try {
      const stored = localStorage.getItem(LAST_SYNC_KEY);
      if (stored) {
        setLastSyncTime(new Date(stored));
      }
    } catch (error) {
      console.error('Error cargando última sincronización:', error);
    }
  }, []);

  const saveLastSyncTime = useCallback(() => {
    const now = new Date();
    setLastSyncTime(now);
    localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
  }, []);

  const addPendingSale = useCallback(
    (saleData: any): string => {
      const id = `pending_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const pendingSale: PendingSale = {
        id,
        saleData,
        timestamp: Date.now(),
        retryCount: 0,
      };

      setPendingSales((prev) => {
        const updated = [...prev, pendingSale];
        savePendingSales(updated);
        return updated;
      });

      console.log('📝 Venta agregada a pendientes:', id);
      toast.info(
        'Venta guardada localmente. Se sincronizará cuando haya conexión.'
      );

      return id;
    },
    [savePendingSales]
  );

  const removePendingSale = useCallback(
    (id: string) => {
      setPendingSales((prev) => {
        const updated = prev.filter((sale) => sale.id !== id);
        savePendingSales(updated);
        return updated;
      });
    },
    [savePendingSales]
  );

  const syncPendingSales = useCallback(async () => {
    if (!isOnline || pendingSales.length === 0) {
      return;
    }

    console.log('🔄 Sincronizando ventas pendientes...', pendingSales.length);

    for (const pendingSale of pendingSales) {
      try {
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pendingSale.saleData),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('✅ Venta sincronizada:', pendingSale.id);
            removePendingSale(pendingSale.id);
          } else {
            throw new Error(result.error);
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Error sincronizando venta:', pendingSale.id, error);

        // Incrementar contador de reintentos
        setPendingSales((prev) => {
          const updated = prev.map((sale) =>
            sale.id === pendingSale.id
              ? { ...sale, retryCount: sale.retryCount + 1 }
              : sale
          );
          savePendingSales(updated);
          return updated;
        });

        // Si ha fallado muchas veces, remover de la cola
        if (pendingSale.retryCount >= 3) {
          console.warn(
            '⚠️ Venta removida por demasiados fallos:',
            pendingSale.id
          );
          removePendingSale(pendingSale.id);
          toast.error('Algunas ventas no pudieron sincronizarse');
        }
      }
    }

    saveLastSyncTime();
  }, [
    isOnline,
    pendingSales,
    removePendingSale,
    savePendingSales,
    saveLastSyncTime,
  ]);

  const canWorkOffline = true; // Siempre permitir trabajo offline

  return {
    isOnline,
    pendingSales,
    addPendingSale,
    removePendingSale,
    syncPendingSales,
    canWorkOffline,
    lastSyncTime,
  };
}
