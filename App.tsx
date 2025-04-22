import React, { useState, useEffect } from 'react';
import {Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LoginScreen from './src/pages/LoginScreen';
import SignupScreen from './src/pages/SignupScreen';
import HomeScreen from './src/pages/HomeScreen';
import UploadScreen from './src/pages/UploadScreen';
import SearchScreen from './src/pages/SearchScreen';
import AccountScreen from './src/pages/AccountScreen';
import SplashScreen from './src/pages/SplashScreen';
import NotificationScreen from './src/pages/NotificationScreen';
import IntroScreen1 from './src/pages/IntroScreen1';
import IntroScreen2 from './src/pages/IntroScreen2';
import useAuthStore from './src/store/authStore'; // Import useAuthStore

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  // First launch check state
  const [isCheckingFirstLaunch, setIsCheckingFirstLaunch] = useState(true); // Renamed
  const [showIntroScreens, setShowIntroScreens] = useState(true); // Renamed

  // Auth state from Zustand store
  const { isLoggedIn, isLoading: isAuthLoading, checkAuthState } = useAuthStore();

  // Effect for checking first launch status
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched !== null) {
          setShowIntroScreens(false); // Use renamed state setter
        }
        // Keep showIntroScreens true if hasLaunched is null
      } catch (error) {
        // Handle error, e.g., log it, but keep showIntroScreens true
        console.error("Failed to check first launch status:", error);
      } finally {
        setIsCheckingFirstLaunch(false); // Use renamed state setter
      }
    };

    checkFirstLaunch();
  }, []);

  // Effect for checking authentication state
  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]); // Added dependency

  const BottomNavigationBar = () => {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#000',
            borderTopWidth: 0,
            // borderColor: '#fff',
            // borderRadius: 10,
          },
        }}>
        <Tab.Screen
          name="home"
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                  }}>
                  <MaterialCommunityIcons
                    name="home"
                    color={focused ? '#fff' : 'grey'}
                    size={20}
                  />
                </View>
              );
            },
          }}
        />
        <Tab.Screen
          name="search"
          component={SearchScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                  }}>
                  <Feather
                    name="search"
                    color={focused ? '#fff' : 'grey'}
                    size={20}
                  />
                </View>
              );
            },
          }}
        />
        {/* <Tab.Screen
          name="upload"
          component={UploadScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                  }}>
                  <Feather
                    name="plus-circle"
                    color={focused ? '#fff' : 'grey'}
                    size={20}
                  />
                </View>
              );
            },
          }}
        /> */}
        <Tab.Screen
          name="notification"
          component={NotificationScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                  }}>
                  <MaterialCommunityIcons
                    name="cards-heart"
                    color={focused ? '#fff' : 'grey'}
                    size={20}
                  />
                </View>
              );
            },
          }}
        />
        <Tab.Screen
          name="account"
          component={AccountScreen}
          options={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({focused}) => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                  }}>
                  <MaterialCommunityIcons
                    name="account"
                    color={focused ? '#fff' : 'grey'}
                    size={20}
                  />
                </View>
              );
            },
          }}
        />
      </Tab.Navigator>
    );
  };

  // Loading State Check
  if (isCheckingFirstLaunch || isAuthLoading) {
    // Render a simple loading indicator
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
    // Alternatively, return null or a dedicated SplashScreen component
    // return <SplashScreen />; // If you have a dedicated splash component for loading
  }

  // Conditional Navigator Rendering
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <NavigationContainer>
        {showIntroScreens ? (
          // Intro Flow Navigator
          <Stack.Navigator initialRouteName="intro1">
            <Stack.Screen name="intro1" component={IntroScreen1} options={{ headerShown: false }} />
            <Stack.Screen name="intro2" component={IntroScreen2} options={{ headerShown: false }} />
            {/* Need login screen here too, so skip works */}
             <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        ) : isLoggedIn ? (
          // Main App Navigator (Logged In)
          <Stack.Navigator initialRouteName="feed">
            <Stack.Screen name="feed" component={BottomNavigationBar} options={{ headerShown: false }} />
          </Stack.Navigator>
        ) : (
          // Auth Flow Navigator (Logged Out)
          <Stack.Navigator initialRouteName="splash">
            <Stack.Screen name="splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="signup" component={SignupScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </View>
  );
};
export default App;
