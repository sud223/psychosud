import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert, // Added Alert
  Image,
  Keyboard, // Added Keyboard
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useAuthStore from '../store/authStore'; // Added useAuthStore

const LoginScreen = () => {
  const navigation = useNavigation();
  const login = useAuthStore((state) => state.login); // Get login action

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email validation regex (simple)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle Login Logic
  const handleLogin = () => {
    Keyboard.dismiss(); // Dismiss keyboard

    // Basic Validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    // Simulate API Call & Login
    console.log('Simulating login for:', email);
    // In a real app, you would make an API call here
    // For this simulation, any non-empty email/password is valid
    const dummyToken = `dummy-auth-token-${email}-${Date.now()}`;
    login(dummyToken);
    // Alert.alert('Success', 'Login successful!'); // Optional: remove if navigation is enough
    // Navigation to 'feed' is handled by App.tsx's reaction to auth state change
  };
  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flex: 1,
        }}>
        <StatusBar
          backgroundColor={'#000'}
          animated={true}
          barStyle={'light-content'}
          hidden={false}
        />

        {/* logo */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000',
          }}>
          <Image
            source={require('../assets/images/psycho.png')}
            style={{width: '60%', height: 100}}
            // tintColor={'#fff'}
            resizeMode="contain"
          />

          {/* email */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1A1A1A',
              width: '95%',
              paddingHorizontal: 10,
              marginTop: 30,
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingRight: 5,
              }}>
              <Icon name="email-outline" size={20} color={'#fff'} />
            </View>
            <View style={{flex: 1}}>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="grey"
                style={{color: '#fff'}}
                onChangeText={txt => setEmail(txt)}
                value={email}
              />
            </View>
          </View>

          {/* password */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1A1A1A',
              width: '95%',
              paddingHorizontal: 10,
              marginTop: 15,
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingRight: 5,
              }}>
              <Icon name="lock-outline" size={20} color={'#fff'} />
            </View>
            <View style={{flex: 1}}>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="grey"
                style={{color: '#fff'}}
                onChangeText={setPassword} // Use setPassword
                value={password}
                secureTextEntry // Hide password
              />
            </View>
          </View>

          {/* Login Btn */}
          <TouchableOpacity
            style={{
              width: '95%',
              borderRadius: 4,
              backgroundColor: '#0095F6',
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 30,
            }}>
            <Text style={{fontSize: 16, color: '#fff'}}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Don't have an account?Sign up Btn */}
      <View
        style={{
          backgroundColor: '#000',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 10,
        }}>
        <Text style={{color: '#fff', fontSize: 12}}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('signup')}>
          <Text style={{fontWeight: 'bold', color: '#fff'}}>Sign up.</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
export default LoginScreen;
