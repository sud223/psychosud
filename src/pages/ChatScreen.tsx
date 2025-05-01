import React, { useState, useEffect } from 'react'; // Import hooks
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'; // Import FlatList, KeyboardAvoidingView
import firestore from '@react-native-firebase/firestore'; // Import firestore

// Define a type for the message object (optional but good practice)
interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any; // Firestore timestamp type
}

// Define a type for user status (optional)
interface UserStatus {
  isOnline: boolean;
  lastSeen: any; // Firestore timestamp or null
  name?: string; // Optionally fetch user name too
}

// Assume route prop is passed by navigation
const ChatScreen = ({ route }: { route: any }) => {
  // Assuming chatId is passed via route params. Default to a test ID if not.
  const chatId = route.params?.chatId || 'testChatId123';
  // Hardcode current user ID for styling differentiation. Replace with actual auth user ID later.
  const currentUserId = 'currentUserHardcodedId';
  // Extract otherUserId from route params, default to a hardcoded ID
  const otherUserId = route.params?.otherUserId || 'otherUserHardcodedId';

  const [messages, setMessages] = useState<Message[]>([]); // State for messages
  const [inputText, setInputText] = useState(''); // State for text input
  const [otherUserStatus, setOtherUserStatus] = useState<UserStatus | null>(null); // State for other user's status

  // Effect hook for fetching messages (existing)
  useEffect(() => {
    // Firestore query to get messages for this chat, ordered by time
    const messagesQuery = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'asc'); // Order by timestamp ascending

    // Set up real-time listener
    const unsubscribe = messagesQuery.onSnapshot(querySnapshot => {
      const fetchedMessages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text || '', // Ensure text exists
          senderId: data.senderId || 'unknown', // Ensure senderId exists
          timestamp: data.timestamp,
        } as Message;
      });
      setMessages(fetchedMessages);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [chatId]); // Re-run effect if chatId changes


  // Effect hook for fetching other user's status
  useEffect(() => {
    if (!otherUserId) return; // Don't run if otherUserId is not set

    console.log(`Setting up listener for user: ${otherUserId}`);
    const userStatusRef = firestore().collection('users').doc(otherUserId);

    const unsubscribeStatus = userStatusRef.onSnapshot(
      docSnapshot => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data() as UserStatus; // Cast to UserStatus type
          // Assuming name is also stored in the user document
          setOtherUserStatus({
            isOnline: data.isOnline || false,
            lastSeen: data.lastSeen || null,
            name: data.name || 'User Name', // Default name if not found
          });
          console.log('Other user status updated:', data);
        } else {
          console.log(`Other user document (${otherUserId}) does not exist.`);
          setOtherUserStatus({ isOnline: false, lastSeen: null, name: 'Unknown User' });
        }
      },
      error => {
        console.error(`Error fetching user status for ${otherUserId}:`, error);
        // Optionally set status to reflect error
        setOtherUserStatus({ isOnline: false, lastSeen: null, name: 'Error' });
      }
    );

    // Cleanup listener on component unmount or if otherUserId changes
    return () => {
      console.log(`Cleaning up status listener for user: ${otherUserId}`);
      unsubscribeStatus();
    };
  }, [otherUserId]); // Re-run effect if otherUserId changes


  // Render each message item
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUserId;
    return (
      <View style={[
        styles.messageBubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]}>
        <Text style={isCurrentUser ? styles.currentUserText : styles.otherUserText}>
          {item.text}
        </Text>
        {/* Optionally display timestamp or sender info */}
      </View>
    );
  };

  // Function to handle sending messages
  const handleSend = async () => {
    const trimmedText = inputText.trim();
    if (trimmedText.length === 0) {
      return; // Don't send empty messages
    }

    const messageObject = {
      text: trimmedText,
      senderId: currentUserId, // Use the hardcoded user ID for now
      timestamp: firestore.FieldValue.serverTimestamp(), // Use server timestamp
    };

    try {
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add(messageObject);

      setInputText(''); // Clear input field after sending
      console.log('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message: ', error);
      // Optionally: show an error message to the user
    }
  };


  return (
    // Use KeyboardAvoidingView to handle keyboard overlap
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Adjust offset as needed
    >
      {/* Header Area */}
      <View style={styles.header}>
        {/* Display User Name from state */}
        <Text style={styles.headerText}>
          {otherUserStatus?.name || 'Loading...'}
        </Text>
        {/* Display Online/Offline Status */}
        <Text style={styles.statusText}>
          {otherUserStatus === null
            ? 'Loading status...' // Initial state before first fetch
            : otherUserStatus.isOnline
              ? 'Online'
              : otherUserStatus.lastSeen
                // Basic formatting for last seen - consider using a date formatting library
                ? `Last seen: ${new Date(otherUserStatus.lastSeen?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Offline'}
        </Text>
      </View>

      {/* Message List Area - Use FlatList */}
      <FlatList
        style={styles.messageList}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        // Optional: Add inverted prop and reverse data for typical chat UI
        // inverted
        // data={messages.slice().reverse()}
      />

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={inputText} // Controlled input
          onChangeText={setInputText} // Update state on change
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}> {/* Attach handleSend */}
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Light background color
  },
  header: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center', // Center header text for now
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2, // Add some space below the name
  },
  statusText: { // Style for the status text
    fontSize: 12,
    color: '#666',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10, // Add padding top
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  currentUserBubble: {
    backgroundColor: '#DCF8C6', // Light green for current user
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0, // Flat corner for speech bubble effect
  },
  otherUserBubble: {
    backgroundColor: '#fff', // White for other user
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0, // Flat corner
    borderWidth: 1,
    borderColor: '#eee',
  },
  currentUserText: {
    color: '#000',
  },
  otherUserText: {
    color: '#000',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
