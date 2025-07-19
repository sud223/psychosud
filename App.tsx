import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Context Providers
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import GlimpseScreen from './src/pages/GlimpseScreen';
import NewHomeScreen from './src/pages/NewHomeScreen';
import SettingsScreen from './src/pages/AccountScreen'; // Reuse existing as settings
import QuizScreen from './src/pages/QuizScreen';
import MatchYouScreen from './src/pages/MatchYouScreen';

// Components
import AuthModal from './src/components/AuthModal';

// Navigation Types
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main Tab Navigator (Post-Authentication)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#ff4458',
        tabBarInactiveTintColor: '#666',
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={NewHomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabIconContainer}>
              <Icon
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="Quiz"
        component={QuizScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabIconContainer}>
              <Icon
                name={focused ? "puzzle" : "puzzle-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="MatchYou"
        component={MatchYouScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabIconContainer}>
              <Icon
                name={focused ? "heart" : "heart-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabIconContainer}>
              <Icon
                name={focused ? "account" : "account-outline"}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// App Content Component
const AppContent = () => {
  const { isAuthenticated, showAuthModal, openAuthModal, closeAuthModal, setUser } = useAuth();

  const handleAuthRequired = () => {
    openAuthModal();
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
  };

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            // Authenticated Stack
            <Stack.Screen name="MainApp" component={MainTabNavigator} />
          ) : (
            // Unauthenticated Stack
            <Stack.Screen name="Glimpse">
              {() => <GlimpseScreen onAuthRequired={handleAuthRequired} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Authentication Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </View>
  );
};

// Root App Component
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
});

export default App;
