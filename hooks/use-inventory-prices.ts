'use client';

import { useState, useEffect, useCallback } from 'react';

interface InventoryPrice {
  type: '33lb' | '40lb' | '100lb';
  unit_cost: number;
}

interface UseInventoryPricesReturn {
  prices: Record<string, number>;
  isLoading: boolean;
  isOffline: boolean;
  lastUpdated: Date | null;
  refreshPrices: () => Promise<void>;
}

const CACHE_KEY = 'gas-control-inventory-prices-cache';
const CACHE_EXPIRY_KEY = 'gas-control-inventory-prices-cache-expiry';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

export function useInventoryPrices(): UseInventoryPricesReturn {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cargar desde cache al inicializar
  useEffect(() => {
    loadFromCache();
    // Intentar actualizar en background
    refreshPrices();
  }, []);

  const loadFromCache = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);

      if (cachedData && cachedExpiry) {
        const expiry = new Date(cachedExpiry);
        const now = new Date();

        if (now < expiry) {
          const parsedPrices = JSON.parse(cachedData);
          setPrices(parsedPrices);
          setLastUpdated(new Date(expiry.getTime() - CACHE_DURATION));
          console.log('📦 Precios cargados desde cache:', parsedPrices);
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading prices from cache:', error);
    }
    return false;
  }, []);

  const saveToCache = useCallback((pricesData: Record<string, number>) => {
    try {
      const expiry = new Date(Date.now() + CACHE_DURATION);
      localStorage.setItem(CACHE_KEY, JSON.stringify(pricesData));
      localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toISOString());
      setLastUpdated(new Date());
      console.log('💾 Precios guardados en cache:', pricesData);
    } catch (error) {
      console.error('Error saving prices to cache:', error);
    }
  }, []);

  const refreshPrices = useCallback(async () => {
    setIsLoading(true);
    setIsOffline(false);

    try {
      console.log('🔄 Actualizando precios desde servidor...');
      const response = await fetch('/api/inventory/prices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const pricesData = result.data || {};
          setPrices(pricesData);
          saveToCache(pricesData);
          console.log('✅ Precios actualizados:', pricesData);
        } else {
          console.error('❌ Error en respuesta:', result.error);
          // Si falla, intentar cargar desde cache
          if (Object.keys(prices).length === 0) {
            loadFromCache();
          }
        }
      } else {
        console.error('❌ Error HTTP:', response.status);
        // Si falla, intentar cargar desde cache
        if (Object.keys(prices).length === 0) {
          loadFromCache();
        }
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setIsOffline(true);

      // Si falla, intentar cargar desde cache
      if (Object.keys(prices).length === 0) {
        const cacheLoaded = loadFromCache();
        if (!cacheLoaded) {
          // Usar precios por defecto si no hay cache
          const defaultPrices = {
            '33lb': 25000,
            '40lb': 30000,
            '100lb': 70000,
          };
          setPrices(defaultPrices);
          console.log('⚠️ Usando precios por defecto');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [prices, loadFromCache, saveToCache]);

  return {
    prices,
    isLoading,
    isOffline,
    lastUpdated,
    refreshPrices,
  };
}
