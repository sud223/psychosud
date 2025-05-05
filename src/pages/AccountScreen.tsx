import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity, // Import TouchableOpacity
  View,
} from 'react-native';
// Import navigation hooks and types
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Assuming Native Stack is used
// Import Auth and Firestore services
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
import { Post, getUserPosts } from '../services/firestoreService'; // Adjust path if needed

const windowWidth = Dimensions.get('window').width;

// Define RootStackParamList (should match definitions in App.tsx and StatsScreen.tsx)
// Ideally, this should be in a central types file
type RootStackParamList = {
  feed: undefined; // Example, adjust based on App.tsx
  chat: { otherUserId: string; otherUserName: string };
  chatList: undefined;
  splash: undefined;
  login: undefined;
  signup: undefined;
  Stats: { postId: string }; // Screen we are navigating to
  // Add other screens defined in App.tsx's Stack.Navigator
};

// Define the specific navigation prop type for AccountScreen
// Ensure 'Stats' is a valid route name in the navigator containing AccountScreen
type AccountScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Stats'>;


const AccountScreen = () => {
  const { userId } = useAuth(); // Get current user ID
  const navigation = useNavigation<AccountScreenNavigationProp>(); // Get navigation object

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) {
        setLoading(false);
        setError("Please log in to view your profile.");
        setUserPosts([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // console.log(`Fetching posts for user: ${userId}`); // Removed debug log
        const fetchedPosts = await getUserPosts(userId);
        setUserPosts(fetchedPosts);
        // console.log(`Fetched ${fetchedPosts.length} posts for user ${userId}`); // Removed debug log
      } catch (err: any) {
        console.error("Error fetching user posts:", err);
        setError(err.message || 'Failed to fetch your posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);


  // Updated render function to include navigation
  const renderUserPostItem = ({ item }: { item: Post }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('Stats', { postId: item.id })} // Navigate on press
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={{
            width: windowWidth / 3,
            height: 130,
            borderWidth: 0.5,
            borderColor: '#000',
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  // Handle loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
      {/* header */}
      <View
        style={{
          flexDirection: 'row',
          padding: 10,
          paddingVertical: 15,
          alignItems: 'center',
          borderBottomWidth: 0.5,
          borderBottomColor: '#333'
        }}>
        <View style={{flex: 1, paddingHorizontal: 10}}>
          <Text
            style={{
              fontWeight: 'bold',
              color: '#fff',
              fontSize: 18,
              textAlign: 'left',
            }}>
            {userId || 'Username'}
          </Text>
        </View>
      </View>

      {/* profile card */}
      <View style={{flexDirection: 'row', alignItems: 'center', padding: 15}}>
         <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: '#555', marginRight: 20}} />
        <View style={{flex: 1}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <View style={{alignItems: 'center'}}>
              <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}>
                {userPosts.length}
              </Text>
              <Text style={{fontSize: 12, color: 'grey'}}>posts</Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}>0</Text>
              <Text style={{fontSize: 12, color: 'grey'}}>followers</Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}>0</Text>
              <Text style={{fontSize: 12, color: 'grey'}}>following</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => { /* Sign out action - TODO */ }}
            style={{
              paddingVertical: 8,
              backgroundColor: '#333',
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#444',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 15,
            }}>
            <Text style={{color: '#fff', fontSize: 13, fontWeight: '600'}}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* name and bio */}
      <View style={{paddingHorizontal: 15, paddingBottom: 10}}>
        <Text style={{color: '#fff', fontWeight: 'bold'}}>{userId || 'Username'}</Text>
        <Text style={{color: 'grey', fontSize: 12, marginTop: 2}}>
          App User Bio - Placeholder
        </Text>
      </View>

       {/* Error Display */}
      {error && !loading && (
        <View style={{ padding: 10, alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      )}

      {/* Post List */}
      <FlatList
        data={userPosts}
        renderItem={renderUserPostItem} // Use updated render function
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListEmptyComponent={
          !loading && !error ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: 'grey' }}>No posts yet.</Text>
              {userId && <Text style={{ color: 'grey', fontSize: 10 }}>(User ID: {userId})</Text>}
            </View>
          ) : null
        }
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={15}
      />
    </SafeAreaView>
  );
};
export default AccountScreen;
