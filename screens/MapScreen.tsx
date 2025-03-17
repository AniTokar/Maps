import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, Text, ActivityIndicator, Button, StyleSheet } from 'react-native';
import { useDatabase } from '../contexts/DatabaseContext'; // Импортируем хук
import { StackNavigationProp } from '@react-navigation/stack'; // Для навигации

interface MarkerType {
  id: number;
  latitude: number;
  longitude: number;
}

interface MapScreenProps {
  navigation: StackNavigationProp<any>; // Тип для навигации
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const { getMarkers, addMarker, isLoading, error } = useDatabase(); // Используем контекст
  const [markers, setMarkers] = useState<MarkerType[]>([]);

  // Загружаем маркеры при монтировании компонента
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const data = await getMarkers();
        setMarkers(data);
      } catch (err) {
        console.error('Failed to fetch markers:', err);
      }
    };

    fetchMarkers();
  }, [getMarkers]);

  // Обработка нажатия на карту
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    handleAddMarker(latitude, longitude);
  };

  // Добавление маркера
  const handleAddMarker = async (latitude: number, longitude: number) => {
    try {
      const newMarkerId = await addMarker(latitude, longitude);
      console.log('New marker added with ID:', newMarkerId);
      // Обновляем список маркеров после добавления
      const updatedMarkers = await getMarkers();
      setMarkers(updatedMarkers);
    } catch (err) {
      console.error('Failed to add marker:', err);
    }
  };

  // Переход на страницу с деталями маркера
  const handleMarkerPress = (marker: MarkerType) => {
    navigation.navigate('MarkerDetail', { marker, markers, setMarkers });
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 58.010455,
          longitude: 56.229443,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress} // Обработка нажатия на карту
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            onPress={() => handleMarkerPress(marker)} // Обработка нажатия на маркер
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;