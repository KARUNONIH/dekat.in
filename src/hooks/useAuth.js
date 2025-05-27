// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';

// Fetcher dengan token untuk user yang sudah login
const fetcher = async (url, token) => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  return response.json();
};

// Fetcher tanpa token untuk user yang belum login
const publicFetcher = async (url) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  return response.json();
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setIsAuthenticated(true);
      setToken(accessToken);
    }
  }, []);

  const logout = async () => {
    if (!mounted) return;
    
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_DEKATIN}/api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setToken(null);
    mutate(() => true, undefined, { revalidate: false });
  };

  return {
    isAuthenticated: mounted ? isAuthenticated : false,
    token: mounted ? token : null,
    logout,
    setIsAuthenticated,
    setToken,
    mounted
  };
};

// Hook untuk fetch locations yang bekerja dengan atau tanpa token
export const useLocations = (token) => {
  // Jika ada token, gunakan fetcher dengan auth, jika tidak gunakan publicFetcher
  const { data, error, isLoading } = useSWR(
    token 
      ? [`${process.env.NEXT_PUBLIC_API_DEKATIN}/api/locations`, token]
      : `${process.env.NEXT_PUBLIC_API_DEKATIN_DEMO}/api/locations`,
    token 
      ? ([url, token]) => fetcher(url, token)
      : publicFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    locations: data || [],
    isLoading,
    error
  };
};