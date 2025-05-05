import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import StatsScreen from '../../../src/pages/StatsScreen'; // Adjust path as needed
import { getPostById, incrementPostViews } from '../../../src/services/firestoreService'; // Import mocks
import firestore from '@react-native-firebase/firestore'; // Needed for Timestamp type

// --- Mocks Setup ---

// 1. Mock the Firestore Service
jest.mock('../../../src/services/firestoreService');

// 2. Mock @react-navigation/native
// Define a default mock route params object
const mockRouteParams = { params: { postId: 'test-post-id' } };
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'), // Use actual implementation for other hooks/components
  useRoute: jest.fn(() => mockRouteParams), // Mock useRoute to return our params
}));

// 3. Mock react-native-vector-icons (optional but common)
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Helper function to create mock Post data
const createMockPost = (overrides = {}): any => ({
  id: 'test-post-id',
  userId: 'user123',
  imageUrl: 'http://example.com/image.jpg',
  caption: 'Test Caption',
  createdAt: firestore.Timestamp.fromDate(new Date()), // Use Firestore Timestamp
  likesCount: 10,
  viewsCount: 100,
  commentsCount: 5,
  likers: ['user456'],
  ...overrides,
});

// --- Test Suite ---

describe('StatsScreen', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useRoute mock if params need changing per test (optional here)
    // require('@react-navigation/native').useRoute.mockImplementation(() => mockRouteParams);
  });

  it('renders loading indicator initially', () => {
    // Arrange: Mock getPostById to be pending (never resolves in this test)
    (getPostById as jest.Mock).mockReturnValue(new Promise(() => {}));

    // Act
    render(<StatsScreen />);

    // Assert
    expect(screen.getByTestId('loading-indicator')).toBeTruthy(); // Assuming ActivityIndicator has testID="loading-indicator" or find by role
    // Or find ActivityIndicator directly if possible with testing-library/react-native setup
  });

  it('fetches post data, increments views, and displays stats on success', async () => {
    // Arrange
    const mockPost = createMockPost();
    (getPostById as jest.Mock).mockResolvedValue(mockPost);
    (incrementPostViews as jest.Mock).mockResolvedValue(undefined); // Mock successful increment

    // Act
    render(<StatsScreen />);

    // Assert
    // Wait for loading to disappear and data to appear
    await waitFor(() => expect(screen.queryByTestId('loading-indicator')).toBeNull());

    // Check if data is displayed
    expect(screen.getByText(`Likes: ${mockPost.likesCount}`)).toBeTruthy();
    expect(screen.getByText(`Views: ${mockPost.viewsCount}`)).toBeTruthy(); // Note: View count might be incremented in effect
    expect(screen.getByText(`Comments: ${mockPost.commentsCount}`)).toBeTruthy();
    expect(screen.getByText(mockPost.caption)).toBeTruthy();
    expect(screen.getByRole('image', { name: /post image/i })).toHaveProp('source', { uri: mockPost.imageUrl }); // Assuming accessibilityLabel or similar


    // Check if incrementPostViews was called
    expect(incrementPostViews).toHaveBeenCalledTimes(1);
    expect(incrementPostViews).toHaveBeenCalledWith('test-post-id');
  });


  it('displays error message when data fetching fails', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch post details.';
    (getPostById as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act
    render(<StatsScreen />);

    // Assert
    // Wait for loading to disappear
    await waitFor(() => expect(screen.queryByTestId('loading-indicator')).toBeNull());

    // Check if error message is displayed
    expect(screen.getByText(errorMessage)).toBeTruthy();
    // Ensure incrementPostViews was NOT called on fetch error
    expect(incrementPostViews).not.toHaveBeenCalled();
  });

  it('displays "Post not found" message when getPostById returns null', async () => {
    // Arrange
    (getPostById as jest.Mock).mockResolvedValue(null);

    // Act
    render(<StatsScreen />);

    // Assert
    // Wait for loading to disappear
    await waitFor(() => expect(screen.queryByTestId('loading-indicator')).toBeNull());

    // Check if "Post not found" message is displayed
    expect(screen.getByText('Post not found.')).toBeTruthy();
    // Ensure incrementPostViews was NOT called if post is not found
    expect(incrementPostViews).not.toHaveBeenCalled();
  });

  it('displays error if postId is missing in route params', () => {
     // Arrange: Modify the mock implementation for this specific test
     require('@react-navigation/native').useRoute.mockImplementationOnce(() => ({ params: {} })); // No postId

     // Act
     render(<StatsScreen />);

     // Assert
     expect(screen.queryByTestId('loading-indicator')).toBeNull(); // Should not be loading
     expect(screen.getByText('Post ID is missing.')).toBeTruthy();
     expect(getPostById).not.toHaveBeenCalled();
     expect(incrementPostViews).not.toHaveBeenCalled();
  });

  // Optional: Test case for when incrementPostViews fails (should still display data)
  it('displays post data even if incrementPostViews fails', async () => {
    // Arrange
    const mockPost = createMockPost();
    (getPostById as jest.Mock).mockResolvedValue(mockPost);
    const viewError = new Error('Failed to increment views');
    (incrementPostViews as jest.Mock).mockRejectedValue(viewError);

    // Act
    render(<StatsScreen />);

    // Assert
    // Wait for loading to disappear and data to appear
    await waitFor(() => expect(screen.queryByTestId('loading-indicator')).toBeNull());

    // Check if data is displayed despite view increment error
    expect(screen.getByText(`Likes: ${mockPost.likesCount}`)).toBeTruthy();
    expect(screen.getByText(`Views: ${mockPost.viewsCount}`)).toBeTruthy();
    expect(screen.getByText(`Comments: ${mockPost.commentsCount}`)).toBeTruthy();

    // Check that incrementPostViews was still called
    expect(incrementPostViews).toHaveBeenCalledTimes(1);
    expect(incrementPostViews).toHaveBeenCalledWith('test-post-id');
    // You might also check if the error was logged (if using a mock logger)
  });

});

// Add Accessibility Labels or testIDs to components in StatsScreen.tsx for easier selection:
// - ActivityIndicator: testID="loading-indicator"
// - Image: accessibilityLabel="Post Image" (or similar)
// - Error Text View: testID="error-message"
// - Not Found Text View: testID="not-found-message"
