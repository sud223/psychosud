import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  ScrollView, // Use ScrollView for potentially longer content
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Post, getPostById, incrementPostViews } from '../services/firestoreService'; // Adjust path if needed

// Define navigation parameter list including this screen
type RootStackParamList = {
  // Define other screens based on your App.tsx Stack.Navigator if needed
  feed: undefined;
  chat: { otherUserId: string; otherUserName: string };
  chatList: undefined;
  splash: undefined;
  login: undefined;
  signup: undefined;
  // ... potentially others like 'home', 'search', 'notification', 'account' if they are part of the stack
  Stats: { postId: string }; // Add Stats screen route
};

// Define the type for the StatsScreen route prop
type StatsScreenRouteProp = RouteProp<RootStackParamList, 'Stats'>;

const StatsScreen = () => {
  // State variables
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get route parameters
  const route = useRoute<StatsScreenRouteProp>();
  const { postId } = route.params;

  // Effect to fetch post data and increment views
  useEffect(() => {
    if (!postId) {
      setError('Post ID is missing.');
      setLoading(false);
      return;
    }

    const fetchPostDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPost = await getPostById(postId);
        if (fetchedPost) {
          setPost(fetchedPost);
          // Increment views after successfully fetching the post
          try {
            await incrementPostViews(postId);
            // console.log(`Incremented views for post ${postId}`); // Removed debug log
          } catch (viewError) {
            console.error(`Failed to increment views for post ${postId}:`, viewError);
            // Don't block UI for view increment error, just log it
          }
        } else {
          setError('Post not found.');
        }
      } catch (fetchError: any) {
        console.error(`Error fetching post ${postId}:`, fetchError);
        setError(fetchError.message || 'Failed to fetch post details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]); // Dependency array includes postId

  // Render Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  // Render Error State
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  // Render Post Details
  if (!post) {
     // Should ideally be covered by the error state, but as a fallback:
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Post data could not be loaded.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Post Image */}
        <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="contain" />

        {/* Caption */}
        {post.caption ? (
          <Text style={styles.captionText}>{post.caption}</Text>
        ) : null}

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>Likes: {post.likesCount}</Text>
          <Text style={styles.statText}>Views: {post.viewsCount}</Text>
          <Text style={styles.statText}>Comments: {post.commentsCount}</Text>
        </View>

        {/* Optional: Liker List (Placeholder) */}
        {/* <View style={styles.likersContainer}>
          <Text style={styles.likerTitle}>Liked by:</Text>
          {post.likers.length > 0 ? (
            post.likers.map(likerId => <Text key={likerId} style={styles.likerText}>{likerId}</Text>)
          ) : (
            <Text style={styles.likerText}>No likes yet.</Text>
          )}
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center', // Center loading/error messages
    alignItems: 'center',
  },
  scrollContent: {
    alignItems: 'center', // Center content within ScrollView
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  image: {
    width: '95%',
    aspectRatio: 1, // Make image square or adjust as needed
    marginBottom: 20,
    borderRadius: 5, // Optional: slightly rounded corners
  },
  captionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333', // Subtle border
    marginBottom: 20,
  },
  statText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  // Optional Liker List Styles
  likersContainer: {
    width: '90%',
    marginTop: 10,
  },
  likerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  likerText: {
    color: '#aaa',
    fontSize: 12,
  },
});

export default StatsScreen;
