import React, {useState, useEffect} from 'react';
import {
  Dimensions,
  FlatList,
  ActivityIndicator, // Added
  Image,
  // Modal removed
  SafeAreaView,
  StatusBar,
  Text,
  // Touchable removed
  TouchableOpacity,
  View,
  // TextInput removed
  Alert, // Import Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Import Firestore service, types, and Auth context
import { Post, getPosts, updatePostLikes } from '../services/firestoreService'; // Import updatePostLikes
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useCallback } from 'react'; // Import useCallback

// const windowWidth = Dimensions.get('window').width; // Unused
const windowHeight = Dimensions.get('window').height;

// Removed feedData and commentList

const HomeScreen = () => {
  const { userId } = useAuth(); // Get current user ID

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPosts = await getPosts(10); // Fetch initial 10 posts
        setPosts(fetchedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError('Failed to fetch posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // Empty dependency array means this runs once on mount


  // Memoized handler for liking/unliking a post
  const handleLikePress = useCallback(async (postId: string, currentLikers: string[]) => {
    if (!userId) {
      Alert.alert("Login Required", "You need to be logged in to like posts.");
      return;
    }

    const isCurrentlyLiked = currentLikers.includes(userId);

    // Optimistic UI update
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likesCount: isCurrentlyLiked ? post.likesCount - 1 : post.likesCount + 1,
            likers: isCurrentlyLiked
              ? post.likers.filter(id => id !== userId)
              : [...post.likers, userId],
          };
        }
        return post;
      })
    );

    // Call backend service
    try {
      await updatePostLikes(postId, userId);
      // console.log(`Like updated for post ${postId}`); // Removed debug log
    } catch (error) {
      console.error(`Failed to update like for post ${postId}:`, error);
      // Optional: Revert optimistic update on error
      setPosts(prevPosts =>
         prevPosts.map(post => {
           if (post.id === postId) {
             // Find original state before optimistic update (or refetch)
             // For simplicity here, we'll just toggle back based on the initial state before this function ran
             // A more robust solution might store the original post state briefly
             return {
               ...post,
               likesCount: isCurrentlyLiked ? post.likesCount + 1 : post.likesCount - 1, // Revert count
               likers: isCurrentlyLiked
                 ? [...post.likers, userId] // Add user back if they were unliking
                 : post.likers.filter(id => id !== userId), // Remove user if they were liking
             };
           }
           return post;
         })
      );
      Alert.alert("Error", "Failed to update like status. Please try again.");
    }
  }, [userId]); // Dependency: userId ensures the function closure captures the correct ID


  const renderPostItem = ({item}: {item: Post}) => {
     // Basic date formatting (consider a library like date-fns for more complex needs)
     const postDate = item.createdAt?.toDate() ? item.createdAt.toDate().toLocaleDateString() : 'Date unknown';
     const isLiked = userId ? item.likers.includes(userId) : false; // Check if liked by current user

      return (
        <View style={{marginTop: 4, marginBottom: 15}}>
          {/* card header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
              paddingVertical: 10,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {/* Placeholder for User Image */}
              <View style={{width: 35, height: 35, borderRadius: 50, backgroundColor: 'grey'}} />
              <View style={{marginHorizontal: 10, width: '80%'}}>
                {/* Display userId for now, replace with actual username fetch later */}
                <Text
                  style={{fontWeight: 'bold', color: '#fff'}}
                  numberOfLines={1}>
                  {item.userId}
                </Text>
              </View>
            </View>
            <View>
              <Icon name="dots-vertical" size={20} color={'#fff'} />
            </View>
          </View>

          {/* image */}
          <View>
            <Image
              source={{
                uri: item.imageUrl, // Use imageUrl from Post data
              }}
              style={{
                width: '100%',
                height: (windowHeight * 40) / 100, // Increased height slightly
              }}
              resizeMode="cover"
            />
          </View>
          {/* card footer */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
              paddingVertical: 10,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {/* Updated Like Button */}
              <TouchableOpacity onPress={() => handleLikePress(item.id, item.likers)}>
                <Icon
                  name={isLiked ? "heart" : "heart-outline"} // Conditional icon name
                  size={25}
                  color={isLiked ? "red" : "#fff"} // Conditional color
                />
              </TouchableOpacity>
              {/* Comment button - still disabled */}
              <TouchableOpacity
                style={{paddingHorizontal: 20}}
                onPress={() => { /* Comment action - TODO */ }}>
                <Icon name="message-reply-text-outline" size={25} color={'#fff'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { /* Share action - TODO */ }}>
                <Icon name="share-variant-outline" size={25} color={'#fff'} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => { /* Bookmark action - TODO */ }}>
              <Icon name="bookmark-outline" size={25} color={'#fff'} />
            </TouchableOpacity>
          </View>

          {/* card sub footer */}
          <View style={{paddingHorizontal: 10}}>
            {/* Display likesCount */}
            <Text style={{color: '#fff', fontWeight: '600'}}>{item.likesCount} likes</Text>
            {/* Display caption if available */}
            {item.caption ? (
              <Text style={{color: '#fff', marginTop: 3}}>
                <Text style={{fontWeight: 'bold'}}>
                  {item.userId}{' '}
                </Text>
                <Text>
                  {item.caption}
                </Text>
              </Text>
            ) : null}
            {/* Removed comment text */}
             {/* Display createdAt timestamp */}
            <Text style={{color: 'grey', fontSize: 10, marginTop: 5}}>
              {postDate}
            </Text>
          </View>
        </View>
      );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  if (error) {
     return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
      <StatusBar
        backgroundColor={'#000'}
        animated={true}
        barStyle={'light-content'}
        hidden={false}
      />
      {/* Header */}
      <View
        style={{
          backgroundColor: '#000',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          paddingVertical: 2,
          borderBottomWidth: 0.5,
          borderBottomColor: '#333' // Subtle border
        }}>
        <View
          style={{
            width: 100,
            height: 40,
            alignItems: 'flex-start',
          }}>
          <Image
            source={require('../assets/images/psycho.png')} // Ensure this path is correct
            style={{width: '100%', height: '100%',
              // tintColor: '#fff' // Optional tinting
            }}
            resizeMode="contain"
          />
        </View>
        {/* Removed message icon */}
      </View>

      {/* Feed Card start */}
      <FlatList
        data={posts} // Use posts from state
        renderItem={renderPostItem} // Use the defined render function
        keyExtractor={(item) => item.id} // Use post ID as key
        contentContainerStyle={{ paddingBottom: 10 }} // Add padding at the bottom
      />
      {/* Feed Card end */}

      {/* Comment Modal Removed */}
    </SafeAreaView>
  );
};
export default HomeScreen;
