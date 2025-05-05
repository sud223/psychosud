import React, {useEffect, useRef} from 'react';
import {Text, View, AppState} from 'react-native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
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
import ChatScreen from './src/pages/ChatScreen'; // Import ChatScreen
import ChatListScreen from './src/pages/ChatListScreen'; // Import ChatListScreen
import StatsScreen from './src/pages/StatsScreen'; // Import StatsScreen
// Import Auth Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Firebase Config (assuming it's placed here for simplicity, consider a separate config file)
// Note: Initialization using default files (google-services.json/GoogleService-Info.plist)
// usually happens automatically. This explicit check is often redundant but can be
// useful for debugging or specific configurations.
const firebaseConfig = {
  // Your web app's Firebase configuration (Optional if using native files)
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // storageBucket: "...",
  // messagingSenderId: "...",
  // appId: "..."
};

// Initialize Firebase
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} else {
  console.log('Firebase already initialized');
}

// Define AppContent component to hold the main app logic
const AppContent = () => {
  const { userId } = useAuth(); // Get userId from context
  const appState = useRef(AppState.currentState);

  // Effect for Firebase initialization confirmation (existing)
  useEffect(() => {
    console.log('App mounted, Firebase apps:', firebase.apps.length);
  }, []);

  // Effect for AppState listener and Firestore status updates
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (!userId) return; // Don't do anything if userId is null

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        // Update Firestore: User is online
        try {
          await firestore().collection('users').doc(userId).update({ // Use userId from context
            isOnline: true,
            lastSeen: firestore.FieldValue.serverTimestamp(),
          });
          console.log('User status updated to online.');
        } catch (error) {
          console.error('Error updating user status to online:', error);
          // Handle potential errors (e.g., user doc doesn't exist yet)
          // Maybe create the document if it doesn't exist?
          // await firestore().collection('users').doc(currentUserId).set({
          //   isOnline: true,
          //   lastSeen: firestore.FieldValue.serverTimestamp(),
          // }, { merge: true });
        }
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log('App has gone to the background!');
        // Update Firestore: User is offline
        try {
          await firestore().collection('users').doc(userId).update({ // Use userId from context
            isOnline: false,
            lastSeen: firestore.FieldValue.serverTimestamp(),
          });
          console.log('User status updated to offline.');
        } catch (error) {
          console.error('Error updating user status to offline:', error);
        }
      }
      appState.current = nextAppState;
      console.log('AppState:', appState.current);
    };

    // Add the event listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    console.log('AppState listener added.');

    // Initial status update when app starts (set to online)
    const setInitialStatus = async () => {
      if (!userId) return; // Don't do anything if userId is null
      try {
        await firestore().collection('users').doc(userId).update({ // Use userId from context
          isOnline: true,
          lastSeen: firestore.FieldValue.serverTimestamp(),
        });
         console.log('Initial user status set to online.');
      } catch (error) {
         console.error('Error setting initial user status:', error);
         // Handle potential errors (e.g., user doc doesn't exist)
         // Consider creating the document here if needed
      }
    };
    setInitialStatus();


    // Cleanup function: remove the listener when the component unmounts
    return () => {
      console.log('Removing AppState listener.');
      subscription.remove();
      // Optional: Set user offline when app is completely closed?
      // This is tricky because cleanup function might not run reliably on app kill.
      // Firestore's presence system might be better for true offline detection.
    };
  }, [userId]); // Dependency array includes userId


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
        {/* Chat List Tab */}
        <Tab.Screen
          name="chatTab" // Keep the tab name
          component={ChatListScreen} // Point tab to ChatListScreen
          options={{
            headerShown: false, // Keep header hidden as it's part of the stack now
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
                    name="message-text-outline" // Use chat icon
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
        {/* Uncomment Account Tab */}
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

  return (
    <View style={{flex: 1, backgroundColor: '#000'}}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="feed">
          <Stack.Screen
            name="splash"
            component={SplashScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="signup"
            component={SignupScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="feed"
            component={BottomNavigationBar}
            options={{headerShown: false}}
          />
          {/* Add ChatScreen to the main stack */}
          <Stack.Screen
            name="chat"
            component={ChatScreen}
            // Options can be configured per screen, e.g., dynamically set title in ChatScreen
            options={({ route }) => ({ title: route.params?.otherUserName || 'Chat' })}
          />
          {/* Add ChatListScreen to the main stack */}
          <Stack.Screen
            name="chatList"
            component={ChatListScreen}
            options={{ title: 'Messages' }} // Set title for the list screen
          />
          {/* Add StatsScreen to the main stack */}
          <Stack.Screen
            name="Stats"
            component={StatsScreen}
            options={{ title: 'Post Statistics' }} // Set title for the stats screen
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

// New root component that includes the AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
