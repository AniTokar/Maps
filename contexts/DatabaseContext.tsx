import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

interface DatabaseContextType {
  getMarkers: () => Promise<MarkerType[]>;
  addMarker: (latitude: number, longitude: number) => Promise<number>;
  deleteMarker: (id: number) => Promise<void>;
  addImage: (markerId: number, uri: string) => Promise<void>; 
  getImages: (markerId: number) => Promise<ImageType[]>;
  deleteImage: (id: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}
//Определяем свойство объектов
interface MarkerType {
  id: number;
  latitude: number;
  longitude: number;
}

interface ImageType {
  id: number;
  uri: string;
  markerId: number;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);
//Для управления базой данных и представлением его дочерним компонентам через контекст
export const DatabaseProvider: React.FC<{ children: React.ReactNode; db: SQLite.SQLiteDatabase }> = ({ children, db }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Получение маркеров
  const getMarkers = async (): Promise<MarkerType[]> => {
    if (!db) {
      throw new Error('База данных не инициализирована');
    }

    try {
      //указываем начало загрузки данных в бд
      setIsLoading(true);
      const result = await db.getAllAsync<MarkerType>('SELECT * FROM Marker;');
      //указываем что все сделали
      setIsLoading(false);
      return result;
    } catch (err) {
      console.error('Ошибка при получении маркеров:', err);
      setIsLoading(false);
      setError(err as Error);
      throw err;
    }
  };

  // Удаление маркера (так же удаляем изображения, которые были прикреплены к маркеру)
  const deleteMarker = async (id: number): Promise<void> => {
    if (!db) {
      throw new Error('База данных не инициализирована');
    }

    try {
      setIsLoading(true);
      await db.runAsync('DELETE FROM Marker WHERE id = ?;', [id]);
      await db.runAsync('DELETE FROM Image WHERE markerId = ?', [id]);
      setIsLoading(false);
    } catch (err) {
      console.error('Ошибка при удалении маркера:', err);
      setIsLoading(false);
      setError(err as Error);
      throw err;
    }
  };

  // Добавление маркера
  const addMarker = async (latitude: number, longitude: number): Promise<number> => {
    if (!db) {
      throw new Error('База данных не инициализирована');
    }

    try {
      setIsLoading(true);
      const result = await db.runAsync(
        'INSERT INTO Marker (latitude, longitude) VALUES (?, ?);',
        [latitude, longitude]
      );
      setIsLoading(false);
      return result.lastInsertRowId as number;
    } catch (err) {
      console.error('Ошибка при добавлении маркера:', err);
      setIsLoading(false);
      setError(err as Error);
      throw err;
    }
  };

  // Добавление изображения
  const addImage = async (markerId: number, uri: string): Promise<void> => {
    if (!db) {
      throw new Error('База данных не инициализирована');
    }
  
    try {
      setIsLoading(true);
      await db.runAsync(
        'INSERT INTO Image (uri, markerId) VALUES (?, ?);',
        [uri, markerId]
      );
      setIsLoading(false);
    } catch (err) {
      console.error('Ошибка при добавлении изображения:', err);
      setIsLoading(false);
      setError(err as Error);
      throw err;
    }
  };
  
  // Получение изображений
  const getImages = async (markerId: number): Promise<ImageType[]> => {
    if (!db) {
      throw new Error('База данных не инициализирована');
    }
  
    try {
      setIsLoading(true);
      const result = await db.getAllAsync<ImageType>(
        'SELECT * FROM Image WHERE markerId = ?;',
        [markerId]
      );
      setIsLoading(false);
      return result;
    } catch (err) {
      console.error('Ошибка при получении изображений:', err);
      setIsLoading(false);
      setError(err as Error);
      throw err;
    }
  };

  // Удаление изображения
  const deleteImage = async (id: number): Promise<void> => {
    if (!db) {
      throw new Error('База данных не инициализирована');
    }
  
    try {
      setIsLoading(true);
      await db.runAsync('DELETE FROM Image WHERE id = ?;', [id]);
      setIsLoading(false);
    } catch (err) {
      console.error('Ошибка при удалении изображения:', err);
      setIsLoading(false);
      setError(err as Error);
      throw err;
    }
  };

  return (
    <DatabaseContext.Provider value={{ getMarkers, addMarker, deleteMarker, addImage, getImages, deleteImage, isLoading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Хук для использования контекста
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};