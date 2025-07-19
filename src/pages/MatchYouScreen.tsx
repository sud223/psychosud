import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  PanGestureHandler,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  images: string[];
  distance: number;
  interests: string[];
  compatibility: number;
}

const MatchYouScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showActions, setShowActions] = useState(true);
  
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const users: User[] = [
    {
      id: '1',
      name: 'Emma',
      age: 24,
      bio: 'Adventure seeker, coffee lover, and quiz enthusiast! Looking for someone to explore the city with.',
      images: ['https://picsum.photos/400/600?random=10'],
      distance: 2,
      interests: ['Travel', 'Coffee', 'Photography', 'Hiking'],
      compatibility: 89,
    },
    {
      id: '2',
      name: 'Alex',
      age: 27,
      bio: 'Musician by night, developer by day. Love creating music and solving puzzles.',
      images: ['https://picsum.photos/400/600?random=11'],
      distance: 5,
      interests: ['Music', 'Technology', 'Gaming', 'Art'],
      compatibility: 76,
    },
    {
      id: '3',
      name: 'Sarah',
      age: 22,
      bio: 'Fitness enthusiast and foodie. Always up for trying new restaurants and workouts!',
      images: ['https://picsum.photos/400/600?random=12'],
      distance: 3,
      interests: ['Fitness', 'Food', 'Yoga', 'Dancing'],
      compatibility: 92,
    },
    {
      id: '4',
      name: 'Mike',
      age: 29,
      bio: 'Bookworm and movie buff. Let\'s discuss our favorite stories over dinner.',
      images: ['https://picsum.photos/400/600?random=13'],
      distance: 7,
      interests: ['Reading', 'Movies', 'Writing', 'History'],
      compatibility: 84,
    },
  ];

  const currentUser = users[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    const toValue = direction === 'right' ? width : -width;
    
    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: direction === 'right' ? 0.3 : -0.3,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animations and move to next user
      translateX.setValue(0);
      translateY.setValue(0);
      rotate.setValue(0);
      setCurrentIndex((prev) => (prev + 1) % users.length);
    });
  };

  const handleLike = () => handleSwipe('right');
  const handlePass = () => handleSwipe('left');

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#FF9800';
    if (score >= 70) return '#2196F3';
    return '#f44336';
  };

  if (!currentUser) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.noMoreText}>No more profiles to show!</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="tune" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="message-text" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Card Container */}
      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX },
                { translateY },
                { rotate: rotate.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ['-30deg', '30deg'],
                }) },
              ],
            },
          ]}
        >
          {/* User Image */}
          <Image source={{ uri: currentUser.images[0] }} style={styles.userImage} />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
          />
          
          {/* User Info */}
          <View style={styles.userInfo}>
            {/* Compatibility Badge */}
            <View style={[styles.compatibilityBadge, { backgroundColor: getCompatibilityColor(currentUser.compatibility) }]}>
              <Icon name="heart" size={16} color="#fff" />
              <Text style={styles.compatibilityText}>{currentUser.compatibility}% Match</Text>
            </View>
            
            {/* Name and Age */}
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{currentUser.name}, {currentUser.age}</Text>
              <View style={styles.distanceContainer}>
                <Icon name="map-marker" size={16} color="#fff" />
                <Text style={styles.distanceText}>{currentUser.distance} km away</Text>
              </View>
            </View>
            
            {/* Bio */}
            <Text style={styles.userBio}>{currentUser.bio}</Text>
            
            {/* Interests */}
            <View style={styles.interestsContainer}>
              {currentUser.interests.slice(0, 3).map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
              {currentUser.interests.length > 3 && (
                <View style={styles.interestTag}>
                  <Text style={styles.interestText}>+{currentUser.interests.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={handlePass}
            activeOpacity={0.8}
          >
            <Icon name="close" size={32} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.superLikeButton]}
            activeOpacity={0.8}
          >
            <Icon name="star" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={handleLike}
            activeOpacity={0.8}
          >
            <Icon name="heart" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.bottomText}>
          {users.length - currentIndex - 1} more profiles nearby
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: width - 40,
    height: height * 0.65,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  userImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  userInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  compatibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  compatibilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.8,
  },
  userBio: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 15,
    opacity: 0.9,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  passButton: {
    backgroundColor: '#f44336',
  },
  superLikeButton: {
    backgroundColor: '#2196F3',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  bottomInfo: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  bottomText: {
    color: '#666',
    fontSize: 14,
  },
  noMoreText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#ff4458',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MatchYouScreen;

