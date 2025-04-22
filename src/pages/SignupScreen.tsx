import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert, // Added Alert
  BackHandler,
  Image,
  Keyboard,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useAuthStore from '../store/authStore'; // Added useAuthStore

const SignupScreen = () => {
  const navigation = useNavigation();
  const login = useAuthStore((state) => state.login); // Get login action

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // back button handle
  const backButtonHandler = () => {
    navigation.goBack();
    return true;
  };

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backButtonHandler,
      );
      return () => backHandler.remove();
    }, [navigation]), // Added dependency
  );
  //  End back handle

  // Email validation regex (simple)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle Signup Logic
  const handleSignup = () => {
    Keyboard.dismiss(); // Dismiss keyboard

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    // Simulate API call and login
    console.log('Simulating signup for:', { name, email });
    const dummyToken = `dummy-token-${name}-${Date.now()}`;
    login(dummyToken);
    Alert.alert('Success', 'Signup successful!');
    // Navigation to 'feed' is handled automatically by App.tsx due to auth state change
  };


  useEffect(() => {
    // Set up event listeners for keyboard show and hide events
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // Keyboard is open
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // Keyboard is closed
      },
    );

    // Cleanup the event listeners when the component is unmounted
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

          {/* Name Input */}
          <View
            style={{
              flexDirection: 'row',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1A1A1A',
              width: '95%',
              paddingHorizontal: 10,
              marginTop: 30, // Adjusted margin
            }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingRight: 5,
              }}>
              <Icon name="account-outline" size={20} color={'#fff'} />
            </View>
            <View style={{flex: 1}}>
              <TextInput
                placeholder="Enter your username"
                placeholderTextColor="grey"
                style={{color: '#fff'}}
                onChangeText={txt => setUserName(txt)}
                value={username}
              />
            </View>
          </View>

          {/* email */}
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
                onChangeText={txt => setPassword(txt)}
                value={password}
              />
            </View>
          </View>

          {/* bio */}
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
                placeholder="Enter your bio"
                placeholderTextColor="grey"
                style={{color: '#fff'}}
                onChangeText={txt => setBio(txt)}
                value={bio}
              />
            </View>
          </View>

          {/* Login Btn */}
          <TouchableOpacity
            onPress={() => navigation.navigate('feed')}
            style={{
              width: '95%',
              borderRadius: 4,
              backgroundColor: '#0095F6',
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 30,
            }}>
            <Text style={{fontSize: 16, color: '#fff'}}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Don't have an account?Sign up Btn */}
      {!keyboardVisible ? (
        <View
          style={{
            backgroundColor: '#000',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 10,
          }}>
          <Text style={{color: '#fff', fontSize: 12}}>Have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={{fontWeight: 'bold', color: '#fff'}}>Login.</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );
};
export default SignupScreen;
