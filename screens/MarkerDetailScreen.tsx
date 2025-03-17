import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { useDatabase } from '../contexts/DatabaseContext'; // Импортируем хук
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker'; // Импортируем ImagePicker

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

type RootStackParamList = {
  MarkerDetail: {
    marker: MarkerType;
    markers: MarkerType[];
    setMarkers: (markers: MarkerType[]) => void;
  };
};

interface MarkerDetailScreenProps {
  route: RouteProp<RootStackParamList, 'MarkerDetail'>;
}

const MarkerDetailScreen: React.FC<MarkerDetailScreenProps> = ({ route }) => {
  const { marker, markers, setMarkers } = route.params;
  const { deleteMarker, addImage, getImages, deleteImage } = useDatabase(); // Используем контекст
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [images, setImages] = useState<ImageType[]>([]);

  // Загружаем изображения при монтировании компонента
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getImages(marker.id);
        setImages(data);
      } catch (err) {
        console.error('Ошибка при получении изображений:', err);
      }
    };

    fetchImages();
  }, [marker.id]);

  // Удаление маркера
  const handleDeleteMarker = async () => {
    try {
      await deleteMarker(marker.id);
      console.log('Маркер удален:', marker.id);

      // Обновляем список маркеров
      const updatedMarkers = markers.filter(m => m.id !== marker.id);
      setMarkers(updatedMarkers);

      // Возвращаемся на предыдущий экран
      navigation.goBack();
    } catch (err) {
      console.error('Ошибка при удалении маркера:', err);
      Alert.alert('Ошибка', 'Не удалось удалить маркер');
    }
  };

  // Выбор изображения из галереи
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        await addImage(marker.id, uri); // Добавляем изображение в базу данных
        const updatedImages = await getImages(marker.id); // Обновляем список изображений
        setImages(updatedImages);
      }
    } catch (err) {
      console.error('Ошибка при выборе изображения:', err);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  // Удаление изображения
  const handleDeleteImage = async (id: number) => {
    try {
      await deleteImage(id);
      console.log('Изображение удалено:', id);

      // Обновляем список изображений
      const updatedImages = images.filter(image => image.id !== id);
      setImages(updatedImages);
    } catch (err) {
      console.error('Ошибка при удалении изображения:', err);
      Alert.alert('Ошибка', 'Не удалось удалить изображение');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Детали маркера</Text>

      <ScrollView>
        {images.map((image) => (
          <View key={image.id} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <Button title="Удалить" onPress={() => handleDeleteImage(image.id)} />
          </View>
        ))}
      </ScrollView>

      <Button title="Удалить маркер" onPress={handleDeleteMarker} />
      <Button title="Добавить изображение" onPress={pickImage} />

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 5,
  },
});

export default MarkerDetailScreen;