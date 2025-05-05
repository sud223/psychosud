// __mocks__/src/services/firestoreService.ts

// Mock implementations for Firestore service functions
export const getPostById = jest.fn();
export const incrementPostViews = jest.fn();

// Mock other functions from the service if they were used by the component under test
// export const addPost = jest.fn();
// export const getPosts = jest.fn();
// export const getUserPosts = jest.fn();
// export const updatePostLikes = jest.fn();

// Helper to reset mocks between tests if needed (can also use jest.clearAllMocks())
export const __resetMocks = () => {
  getPostById.mockReset();
  incrementPostViews.mockReset();
  // Reset other mocks here
};
