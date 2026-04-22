import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import api from '@/services/api';
import { router } from 'expo-router';


type Category = {
  id: number;
  name: string;
};


export default function SubmitReport() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<number | null>(null);
  const [image, setImage] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState('medium');



useEffect(() => {
  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (err) {
      console.log('categories error', err);
    }
  };

  loadCategories();
}, []);




  // 📸 Pick Image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // 📍 Get Location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission denied');
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  // 🚀 Submit
  const handleSubmit = async () => {
    if (!description) {
      Alert.alert('Description is required');
      return;
    }

    if (!location) {
      Alert.alert('Location is required');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('title', title);
      formData.append('description', description);
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      formData.append('severity', severity);


      if (category !== null) {
        formData.append('category_id', category.toString());
        }

      if (image) {
        formData.append('image', {
          uri: image.uri,
          name: 'report.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const response = await api.post('/reports/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Report submitted successfully');
      router.push('/dashboard');
      setTitle('');
      setDescription('');
      setImage(null);
      setLocation(null);
      setCategory(null);
    } catch (error: any) {
      console.log(error.response?.data || error.message);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Submit Report</Text>

      {/* Title */}
      <TextInput
        placeholder="Title (optional)"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      {/* Description */}
      <TextInput
        placeholder="Describe the issue..."
        placeholderTextColor="#94A3B8"
        style={[styles.input, { height: 120 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
  {categories.map((cat) => (
    <TouchableOpacity
      key={cat.id}
      onPress={() => setCategory(cat.id)}
      style={{
        padding: 10,
        margin: 4,
        borderRadius: 10,
        backgroundColor: category === cat.id ? '#6366F1' : '#1E293B',
      }}
    >
      <Text style={{ color: '#fff' }}>{cat.name}</Text>
    </TouchableOpacity>
  ))}
</View>

<View style={{ flexDirection: 'row', marginBottom: 12 }}>
  {['low', 'medium', 'high'].map((level) => (
    <TouchableOpacity
      key={level}
      onPress={() => setSeverity(level)}
      style={{
        padding: 10,
        margin: 4,
        borderRadius: 10,
        backgroundColor: severity === level ? '#6366F1' : '#1E293B',
      }}
    >
      <Text style={{ color: '#fff', textTransform: 'capitalize' }}>
        {level}
      </Text>
    </TouchableOpacity>
  ))}
</View>




      {/* Image Picker */}
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>📷 Add Image</Text>
        )}
      </TouchableOpacity>

      {/* Location */}
      <TouchableOpacity style={styles.locationBtn} onPress={getLocation}>
        <Text style={styles.locationText}>
          {location ? '📍 Location Added' : '📍 Get Location'}
        </Text>
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
    paddingTop: 60,
  },

  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },

  input: {
    backgroundColor: '#1E293B',
    color: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  imageBox: {
    height: 150,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imageText: {
    color: '#94A3B8',
  },

  locationBtn: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },

  locationText: {
    color: '#fff',
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
