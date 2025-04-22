import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IntroScreen1 = () => {
  const navigation = useNavigation();

  const handleNext = () => {
    navigation.navigate('intro2');
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      navigation.navigate('login'); // Navigate to login after setting flag
    } catch (error) {
      console.error("Failed to set 'hasLaunched' flag:", error);
      // Optionally navigate anyway or show an error
      navigation.navigate('login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Psychosud</Text>
      <Text style={styles.description}>
        Your pocket companion for exploring and understanding psychological concepts.
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // Light text
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC', // Lighter grey text
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#BB86FC', // A Material Design purple accent
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#121212', // Dark text for contrast on button
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#BB86FC', // Use accent color for skip button text
  },
});

export default IntroScreen1;
