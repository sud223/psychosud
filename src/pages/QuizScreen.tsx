import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: number;
  plays: number;
  rating: number;
  color: string;
}

const QuizScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: 'view-grid' },
    { id: 'personality', name: 'Personality', icon: 'account-heart' },
    { id: 'trivia', name: 'Trivia', icon: 'brain' },
    { id: 'dating', name: 'Dating', icon: 'heart' },
    { id: 'fun', name: 'Fun', icon: 'emoticon-happy' },
  ];

  const quizzes: Quiz[] = [
    {
      id: '1',
      title: 'What\'s Your Dating Style?',
      description: 'Discover your unique approach to romance and relationships',
      category: 'personality',
      difficulty: 'easy',
      questions: 10,
      plays: 15420,
      rating: 4.8,
      color: '#ff4458',
    },
    {
      id: '2',
      title: 'Movie Trivia Challenge',
      description: 'Test your knowledge of cinema from classics to blockbusters',
      category: 'trivia',
      difficulty: 'medium',
      questions: 15,
      plays: 8930,
      rating: 4.6,
      color: '#4CAF50',
    },
    {
      id: '3',
      title: 'Are You Ready for Love?',
      description: 'Find out if you\'re emotionally prepared for a relationship',
      category: 'dating',
      difficulty: 'easy',
      questions: 12,
      plays: 23100,
      rating: 4.9,
      color: '#FF9800',
    },
    {
      id: '4',
      title: 'Which City Should You Live In?',
      description: 'Discover the perfect city that matches your lifestyle',
      category: 'fun',
      difficulty: 'easy',
      questions: 8,
      plays: 12750,
      rating: 4.7,
      color: '#9C27B0',
    },
    {
      id: '5',
      title: 'Science Facts or Fiction?',
      description: 'Can you separate real science from popular myths?',
      category: 'trivia',
      difficulty: 'hard',
      questions: 20,
      plays: 5680,
      rating: 4.5,
      color: '#2196F3',
    },
  ];

  const filteredQuizzes = selectedCategory === 'all' 
    ? quizzes 
    : quizzes.filter(quiz => quiz.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#f44336';
      default: return '#4CAF50';
    }
  };

  const QuizCard = ({ quiz }: { quiz: Quiz }) => (
    <TouchableOpacity style={styles.quizCard} activeOpacity={0.8}>
      <LinearGradient
        colors={[quiz.color, `${quiz.color}CC`]}
        style={styles.quizGradient}
      >
        <View style={styles.quizHeader}>
          <View style={styles.quizInfo}>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <Text style={styles.quizDescription}>{quiz.description}</Text>
          </View>
          <View style={styles.quizMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quiz.difficulty) }]}>
              <Text style={styles.difficultyText}>{quiz.difficulty.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.quizFooter}>
          <View style={styles.quizStats}>
            <View style={styles.statItem}>
              <Icon name="help-circle-outline" size={16} color="#fff" />
              <Text style={styles.statText}>{quiz.questions} questions</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="play" size={16} color="#fff" />
              <Text style={styles.statText}>{quiz.plays.toLocaleString()} plays</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>{quiz.rating}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.playButton}>
            <Icon name="play" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quizzes</Text>
        <Text style={styles.headerSubtitle}>Test your knowledge & personality</Text>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Icon
              name={category.icon}
              size={20}
              color={selectedCategory === category.id ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quizzes List */}
      <ScrollView
        style={styles.quizzesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.quizzesContent}
      >
        {filteredQuizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </ScrollView>

      {/* Create Quiz Button */}
      <TouchableOpacity style={styles.createButton} activeOpacity={0.8}>
        <LinearGradient
          colors={['#ff4458', '#ff6b7a']}
          style={styles.createButtonGradient}
        >
          <Icon name="plus" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 16,
  },
  categoriesContainer: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  categoryButtonActive: {
    backgroundColor: '#ff4458',
  },
  categoryText: {
    color: '#666',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  quizzesContainer: {
    flex: 1,
  },
  quizzesContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  quizCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quizGradient: {
    padding: 20,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  quizInfo: {
    flex: 1,
    marginRight: 15,
  },
  quizTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  quizDescription: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 20,
  },
  quizMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizStats: {
    flexDirection: 'row',
    flex: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.9,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  createButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuizScreen;

