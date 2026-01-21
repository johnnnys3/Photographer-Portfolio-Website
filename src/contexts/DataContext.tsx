import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchImages, getGalleries, testSupabaseConnection } from '../lib/storage';
import type { DatabaseImage } from '../lib/supabase';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface DataContextType {
  images: DatabaseImage[];
  galleries: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [images, setImages] = useState<DatabaseImage[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      console.log('Starting data load...');
      
      // First test Supabase connection
      const connectionTest = await testSupabaseConnection();
      console.log('Connection test:', connectionTest);
      
      if (!connectionTest.success) {
        console.warn('Supabase connection failed, using empty state:', connectionTest.error);
        // Don't throw error, just use empty state
        setImages([]);
        setGalleries([]);
        setError(`Connection issue: ${connectionTest.error}`);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const [imagesData, galleriesData] = await Promise.all([
        fetchImages(),
        getGalleries(),
      ]);
      
      console.log('Data loaded:', { imagesData, galleriesData });
      setImages(imagesData || []);
      setGalleries(galleriesData || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      // Set empty arrays on error
      setImages([]);
      setGalleries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const value: DataContextType = {
    images,
    galleries,
    loading,
    error,
    refetch: loadData,
  };

  return (
    <ErrorBoundary context="Data Provider">
      <DataContext.Provider value={value}>
        {children}
      </DataContext.Provider>
    </ErrorBoundary>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
