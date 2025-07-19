import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

interface GlimpseScreenProps {
  onAuthRequired: () => void;
}

const GlimpseScreen: React.FC<GlimpseScreenProps> = ({ onAuthRequired }) => {
  // Mock data for preview content
  const previewPosts = [
    {
      id: '1',
      image: 'https://picsum.photos/400/600?random=1',
      likes: 234,
      comments: 45,
    },
    {
      id: '2',
      image: 'https://picsum.photos/400/600?random=2',
      likes: 567,
      comments: 89,
    },
    {
      id: '3',
      image: 'https://picsum.photos/400/600?random=3',
      likes: 123,
      comments: 23,
    },
  ];

  const handleAnyInteraction = () => {
    onAuthRequired();
  };

  const PreviewPost = ({ post, index }: { post: any; index: number }) => (
    <TouchableOpacity
      style={[styles.previewPost, { marginTop: index * 20 }]}
      onPress={handleAnyInteraction}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={{ uri: post.image }}
        style={styles.postImage}
        imageStyle={styles.blurredImage}
      >
        {/* Blur overlay */}
        <View style={styles.blurOverlay} />
        
        {/* Content overlay */}
        <View style={styles.postOverlay}>
          <View style={styles.postActions}>
            <View style={styles.actionItem}>
              <Icon name="heart-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>{post.likes}</Text>
            </View>
            <View style={styles.actionItem}>
              <Icon name="comment-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>{post.comments}</Text>
            </View>
            <View style={styles.actionItem}>
              <Icon name="share-outline" size={24} color="#fff" />
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

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
        <Text style={styles.tagline}>Discover • Connect • Play</Text>
      </View>

      {/* Preview Content */}
      <ScrollView
        style={styles.previewContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Disable scrolling to force auth
      >
        {previewPosts.map((post, index) => (
          <PreviewPost key={post.id} post={post} index={index} />
        ))}
      </ScrollView>

      {/* Call to Action Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
        style={styles.ctaOverlay}
      >
        <View style={styles.ctaContent}>
          <Text style={styles.ctaTitle}>Unlock Full Experience</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands discovering amazing content, finding connections, and playing interactive quizzes
          </Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="account-group" size={20} color="#fff" />
              <Text style={styles.statText}>10K+ Users</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="heart" size={20} color="#ff4458" />
              <Text style={styles.statText}>1M+ Connections</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="puzzle" size={20} color="#4CAF50" />
              <Text style={styles.statText}>5K+ Quizzes</Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleAnyInteraction}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff4458', '#ff6b7a']}
              style={styles.ctaButtonGradient}
            >
              <Text style={styles.ctaButtonText}>Get Started</Text>
              <Icon name="arrow-right" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAnyInteraction}>
            <Text style={styles.tapAnywhere}>
              Or tap anywhere to continue
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Invisible overlay to catch all touches */}
      <TouchableOpacity
        style={styles.invisibleOverlay}
        onPress={handleAnyInteraction}
        activeOpacity={1}
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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 10,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 8,
  },
  tagline: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '300',
    opacity: 0.8,
  },
  previewContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewPost: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  postImage: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
  },
  blurredImage: {
    borderRadius: 12,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(2px)', // Note: This might not work on all platforms
  },
  postOverlay: {
    padding: 15,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  ctaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  ctaContent: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaSubtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
  ctaButton: {
    width: '80%',
    marginBottom: 15,
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  tapAnywhere: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  invisibleOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
});

export default GlimpseScreen;

