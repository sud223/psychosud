import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // Import StackNavigationProp

// Define a type for the User object (adjust based on your Firestore structure)
interface User {
  id: string;
  name: string; // Assuming users have a 'name' field
  // Add other fields if needed, e.g., profilePicUrl
}

// Define ParamList for StackNavigator (adjust based on your navigator setup)
type RootStackParamList = {
  chat: { chatId: string; otherUserId: string };
  // Add other screen definitions here if needed
};

// Define Navigation Prop type for this screen
type ChatListNavigationProp = StackNavigationProp<RootStackParamList, 'chat'>;


const ChatListScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ChatListNavigationProp>(); // Use typed navigation

  // Hardcoded current user ID - replace with actual auth logic
  const currentUserId = 'currentUserHardcodedId';

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await firestore().collection('users').get();
        const fetchedUsers = usersSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<User, 'id'>), // Map data, ensure 'name' exists
          }))
          .filter(user => user.id !== currentUserId); // Exclude current user

        setUsers(fetchedUsers);
        console.log('Fetched users:', fetchedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
        // Handle error (e.g., show a message to the user)
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUserId]); // Depend on currentUserId if it can change

  const handleUserPress = (otherUser: User) => {
    if (!otherUser || !otherUser.id) {
      console.error("Invalid user data passed to handleUserPress");
      return;
    }
    // Generate a consistent chatId by sorting IDs
    const ids = [currentUserId, otherUser.id];
    ids.sort();
    const generatedChatId = ids.join('_');

    console.log(`Navigating to chat with ${otherUser.name} (ID: ${otherUser.id}), Chat ID: ${generatedChatId}`);
    navigation.navigate('chat', {
      chatId: generatedChatId,
      otherUserId: otherUser.id,
      // You might want to pass the other user's name as well for the ChatScreen header
      // otherUserName: otherUser.name
    });
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item)}>
      <Text style={styles.userName}>{item.name || 'Unnamed User'}</Text>
      {/* Add profile picture or other details here */}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'grey',
  },
});

export default ChatListScreen;
