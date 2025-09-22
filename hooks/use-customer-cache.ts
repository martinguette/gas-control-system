'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  location: string;
  custom_prices: Record<string, number>;
  created_at?: string;
  updated_at?: string;
  relevance?: number;
}

interface UseCustomerCacheReturn {
  customers: Customer[];
  isLoading: boolean;
  isOffline: boolean;
  lastUpdated: Date | null;
  refreshCustomers: (searchTerm?: string) => Promise<void>;
  searchCustomers: (searchTerm: string) => Promise<Customer[]>;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  syncPendingData: () => Promise<void>;
}

const CACHE_KEY = 'gas-control-customers-cache';
const CACHE_EXPIRY_KEY = 'gas-control-customers-cache-expiry';
const PENDING_SALES_KEY = 'gas-control-pending-sales';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
const OFFLINE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas para modo offline

export function useCustomerCache(): UseCustomerCacheReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cargar desde cache al inicializar
  useEffect(() => {
    loadFromCache();
    // Intentar actualizar en background
    refreshCustomers();
  }, []);

  const loadFromCache = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);

      if (cachedData && cachedExpiry) {
        const expiry = new Date(cachedExpiry);
        const now = new Date();

        if (now < expiry) {
          const parsedCustomers = JSON.parse(cachedData);
          setCustomers(parsedCustomers);
          setLastUpdated(new Date(expiry.getTime() - CACHE_DURATION));
          console.log(
            '📦 Clientes cargados desde cache:',
            parsedCustomers.length
          );
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
    return false;
  }, []);

  const saveToCache = useCallback((customersData: Customer[]) => {
    try {
      const expiry = new Date(Date.now() + CACHE_DURATION);
      localStorage.setItem(CACHE_KEY, JSON.stringify(customersData));
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toISOString());
      setLastUpdated(new Date());
      console.log('💾 Clientes guardados en cache:', customersData.length);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, []);

  const refreshCustomers = useCallback(
    async (searchTerm: string = '') => {
      setIsLoading(true);
      setIsOffline(false);

      try {
        console.log('🔄 Actualizando clientes desde servidor...', {
          searchTerm,
        });
        const response = await fetch('/api/customers/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: searchTerm,
            limit: searchTerm ? 20 : 100, // Menos resultados para búsquedas específicas
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const customersData = result.data || [];

            if (searchTerm) {
              // Para búsquedas, no actualizar el cache completo
              return customersData;
            } else {
              // Para carga completa, actualizar cache
              setCustomers(customersData);
              saveToCache(customersData);
              console.log('✅ Clientes actualizados:', customersData.length);
            }
          } else {
            console.error('❌ Error en respuesta:', result.error);
            throw new Error(result.error);
          }
        } else {
          console.error('❌ Error HTTP:', response.status);
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Error de conexión:', error);
        setIsOffline(true);

        // Si falla, intentar cargar desde cache
        if (customers.length === 0) {
          const cacheLoaded = loadFromCache();
          if (!cacheLoaded) {
            toast.error('Sin conexión y sin datos en cache');
          } else {
            toast.warning('Modo offline - usando datos en cache');
          }
        } else {
          toast.warning('Sin conexión - usando datos en cache');
        }

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [customers.length, loadFromCache, saveToCache]
  );

  // Nueva función para búsqueda específica
  const searchCustomers = useCallback(
    async (searchTerm: string): Promise<Customer[]> => {
      if (!searchTerm.trim()) {
        return customers;
      }

      try {
        // Primero buscar en cache local
        const localResults = customers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.includes(searchTerm) ||
            customer.location.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (localResults.length > 0) {
          console.log(
            '🔍 Resultados encontrados en cache local:',
            localResults.length
          );
          return localResults;
        }

        // Si no hay resultados locales, buscar en servidor
        const serverResults = await refreshCustomers(searchTerm);
        return serverResults || [];
      } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        return [];
      }
    },
    [customers, refreshCustomers]
  );

  const addCustomer = useCallback(
    (customer: Customer) => {
      setCustomers((prev) => {
        const updated = [...prev, customer];
        saveToCache(updated);
        return updated;
      });
    },
    [saveToCache]
  );

  const updateCustomer = useCallback(
    (updatedCustomer: Customer) => {
      setCustomers((prev) => {
        const updated = prev.map((c) =>
          c.id === updatedCustomer.id ? updatedCustomer : c
        );
        saveToCache(updated);
        return updated;
      });
    },
    [saveToCache]
  );

  // Función para sincronizar datos pendientes
  const syncPendingData = useCallback(async () => {
    try {
      console.log('🔄 Sincronizando datos pendientes...');

      const response = await fetch('/api/sync/offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_pending_sales',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const { processed, failed } = result.data;
          console.log('✅ Sincronización completada:', { processed, failed });

          if (processed > 0) {
            toast.success(`${processed} ventas sincronizadas`);
          }
          if (failed > 0) {
            toast.warning(`${failed} ventas fallaron al sincronizar`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error sincronizando datos:', error);
      toast.error('Error al sincronizar datos pendientes');
    }
  }, []);

  return {
    customers,
    isLoading,
    isOffline,
    lastUpdated,
    refreshCustomers,
    searchCustomers,
    addCustomer,
    updateCustomer,
    syncPendingData,
  };
}
