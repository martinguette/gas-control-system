'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  location: string;
  custom_prices: Record<string, number>;
}

interface UseCustomerCacheReturn {
  customers: Customer[];
  isLoading: boolean;
  isOffline: boolean;
  lastUpdated: Date | null;
  refreshCustomers: () => Promise<void>;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
}

const CACHE_KEY = 'gas-control-customers-cache';
const CACHE_EXPIRY_KEY = 'gas-control-customers-cache-expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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

  const refreshCustomers = useCallback(async () => {
    setIsLoading(true);
    setIsOffline(false);

    try {
      console.log('🔄 Actualizando clientes desde servidor...');
      const response = await fetch('/api/customers/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '' }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const customersData = result.data || [];
          setCustomers(customersData);
          saveToCache(customersData);
          console.log('✅ Clientes actualizados:', customersData.length);
        } else {
          console.error('❌ Error en respuesta:', result.error);
          // Si falla, intentar cargar desde cache
          if (customers.length === 0) {
            loadFromCache();
          }
        }
      } else {
        console.error('❌ Error HTTP:', response.status);
        // Si falla, intentar cargar desde cache
        if (customers.length === 0) {
          loadFromCache();
        }
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
    } finally {
      setIsLoading(false);
    }
  }, [customers.length, loadFromCache, saveToCache]);

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

  return {
    customers,
    isLoading,
    isOffline,
    lastUpdated,
    refreshCustomers,
    addCustomer,
    updateCustomer,
  };
}
