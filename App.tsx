import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MarkerDetailScreen from './screens/MarkerDetailScreen';
import { View, Text, ActivityIndicator } from 'react-native';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { initDatabase } from './database/shema';
import MapScreen from './screens/MapScreen';
import * as SQLite from 'expo-sqlite';

const Stack = createStackNavigator();

const App: React.FC = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация базы данных
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const database = await initDatabase();
        setDb(database);
      } catch (error) {
        console.error('Ошибка при инициализации базы данных:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (!db) {
    return <Text>Ошибка: База данных не инициализирована</Text>;
  }

  return (
    <DatabaseProvider db={db}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Map">
          <Stack.Screen
            name="Map"
            component={MapScreen} 
          />
          <Stack.Screen
            name="MarkerDetail"
            component={MarkerDetailScreen} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </DatabaseProvider>
  );
};

export default App;