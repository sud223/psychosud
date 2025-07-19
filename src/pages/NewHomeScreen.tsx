import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

interface BasePost {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  createdAt: Date;
  likes: string[];
  comments: number;
  shares: number;
}

interface ImagePost extends BasePost {
  type: 'image';
  imageUrl: string;
  caption?: string;
}

interface VideoPost extends BasePost {
  type: 'video';
  videoUrl: string;
  thumbnail: string;
  duration: number;
  caption?: string;
}

interface QuizPost extends BasePost {
  type: 'quiz';
  title: string;
  description: string;
  category: string;
  questions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  color: string;
}

type Post = ImagePost | VideoPost | QuizPost;

const NewHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Mock data generator
  const generateMockPosts = (pageNum: number, count: number = 10): Post[] => {
    const mockPosts: Post[] = [];
    const postTypes = ['image', 'video', 'quiz'] as const;
    
    for (let i = 0; i < count; i++) {
      const postId = `${pageNum}_${i}`;
      const type = postTypes[Math.floor(Math.random() * postTypes.length)];
      const basePost = {
        id: postId,
        userId: `user_${Math.floor(Math.random() * 100)}`,
        username: `user${Math.floor(Math.random() * 1000)}`,
        userAvatar: `https://picsum.photos/100/100?random=${postId}`,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 7), // Random time in last week
        likes: Array.from({ length: Math.floor(Math.random() * 500) }, (_, i) => `user_${i}`),
        comments: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
      };

      switch (type) {
        case 'image':
          mockPosts.push({
            ...basePost,
            type: 'image',
            imageUrl: `https://picsum.photos/400/600?random=${postId}`,
            caption: `This is a sample caption for post ${postId}. #lifestyle #photography`,
          } as ImagePost);
          break;
        
        case 'video':
          mockPosts.push({
            ...basePost,
            type: 'video',
            videoUrl: `https://sample-videos.com/zip/10/mp4/SampleVideo_${Math.floor(Math.random() * 10)}.mp4`,
            thumbnail: `https://picsum.photos/400/600?random=${postId}_thumb`,
            duration: Math.floor(Math.random() * 120) + 15, // 15-135 seconds
            caption: `Check out this amazing video! #video #content`,
          } as VideoPost);
          break;
        
        case 'quiz':
          const colors = ['#ff4458', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
          const categories = ['Personality', 'Trivia', 'Dating', 'Fun', 'Knowledge'];
          const difficulties = ['easy', 'medium', 'hard'] as const;
          
          mockPosts.push({
            ...basePost,
            type: 'quiz',
            title: `Quiz ${postId}: What's Your Style?`,
            description: 'Discover something new about yourself with this fun quiz!',
            category: categories[Math.floor(Math.random() * categories.length)],
            questions: Math.floor(Math.random() * 15) + 5, // 5-20 questions
            difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
          } as QuizPost);
          break;
      }
    }
    
    return mockPosts;
  };

  const loadPosts = useCallback(async (pageNum: number, isRefresh = false) => {
    if (loading && !isRefresh) return;
    
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newPosts = generateMockPosts(pageNum);
      
      if (isRefresh) {
        setPosts(newPosts);
        setPage(2);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(prev => prev + 1);
      }
      
      // Simulate end of data after 5 pages
      if (pageNum >= 5) {
        setHasMore(false);
      }
      
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  }, [loading]);

  useEffect(() => {
    loadPosts(1, true);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    loadPosts(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadPosts(page);
    }
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(user.id);
        return {
          ...post,
          likes: isLiked 
            ? post.likes.filter(id => id !== user.id)
            : [...post.likes, user.id]
        };
      }
      return post;
    }));
  };

  const PostHeader = ({ post }: { post: Post }) => (
    <View style={styles.postHeader}>
      <View style={styles.userInfo}>
        <Image 
          source={{ uri: post.userAvatar || 'https://picsum.photos/100/100?random=default' }} 
          style={styles.userAvatar} 
        />
        <View style={styles.userDetails}>
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.timestamp}>
            {post.createdAt.toLocaleDateString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Icon name="dots-vertical" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const PostActions = ({ post }: { post: Post }) => {
    const isLiked = user ? post.likes.includes(user.id) : false;
    
    return (
      <View style={styles.postActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(post.id)}
          >
            <Icon 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "#ff4458" : "#fff"} 
            />
            <Text style={styles.actionText}>{post.likes.length}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="comment-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>{post.shares}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="bookmark-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const ImagePostComponent = ({ post }: { post: ImagePost }) => (
    <View style={styles.postContainer}>
      <PostHeader post={post} />
      <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
      <PostActions post={post} />
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            <Text style={styles.captionUsername}>{post.username} </Text>
            {post.caption}
          </Text>
        </View>
      )}
    </View>
  );

  const VideoPostComponent = ({ post }: { post: VideoPost }) => (
    <View style={styles.postContainer}>
      <PostHeader post={post} />
      <View style={styles.videoContainer}>
        <Image source={{ uri: post.thumbnail }} style={styles.postImage} />
        <View style={styles.videoOverlay}>
          <TouchableOpacity style={styles.playButton}>
            <Icon name="play" size={40} color="#fff" />
          </TouchableOpacity>
          <View style={styles.videoDuration}>
            <Text style={styles.durationText}>
              {Math.floor(post.duration / 60)}:{(post.duration % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </View>
      </View>
      <PostActions post={post} />
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            <Text style={styles.captionUsername}>{post.username} </Text>
            {post.caption}
          </Text>
        </View>
      )}
    </View>
  );

  const QuizPostComponent = ({ post }: { post: QuizPost }) => (
    <View style={styles.postContainer}>
      <PostHeader post={post} />
      <TouchableOpacity style={styles.quizContainer}>
        <LinearGradient
          colors={[post.color, `${post.color}CC`]}
          style={styles.quizGradient}
        >
          <View style={styles.quizContent}>
            <View style={styles.quizHeader}>
              <Icon name="puzzle" size={24} color="#fff" />
              <Text style={styles.quizCategory}>{post.category}</Text>
            </View>
            <Text style={styles.quizTitle}>{post.title}</Text>
            <Text style={styles.quizDescription}>{post.description}</Text>
            <View style={styles.quizMeta}>
              <Text style={styles.quizMetaText}>{post.questions} questions</Text>
              <Text style={styles.quizMetaText}>•</Text>
              <Text style={styles.quizMetaText}>{post.difficulty}</Text>
            </View>
            <View style={styles.quizPlayButton}>
              <Icon name="play" size={20} color="#fff" />
              <Text style={styles.quizPlayText}>Take Quiz</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
      <PostActions post={post} />
    </View>
  );

  const renderPost = ({ item }: { item: Post }) => {
    switch (item.type) {
      case 'image':
        return <ImagePostComponent post={item} />;
      case 'video':
        return <VideoPostComponent post={item} />;
      case 'quiz':
        return <QuizPostComponent post={item} />;
      default:
        return null;
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color="#ff4458" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/psycho.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="heart-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="message-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ff4458"
            colors={['#ff4458']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.feedContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 60,
    paddingBottom: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  logo: {
    width: 100,
    height: 35,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  feedContent: {
    paddingBottom: 20,
  },
  postContainer: {
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  moreButton: {
    padding: 5,
  },
  postImage: {
    width: '100%',
    height: height * 0.5,
    resizeMode: 'cover',
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quizContainer: {
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quizGradient: {
    padding: 20,
  },
  quizContent: {
    alignItems: 'flex-start',
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quizCategory: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  quizTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quizDescription: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 12,
  },
  quizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quizMetaText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginHorizontal: 4,
  },
  quizPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quizPlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '600',
  },
  captionContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 18,
  },
  captionUsername: {
    fontWeight: 'bold',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default NewHomeScreen;

