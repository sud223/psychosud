import firestore from '@react-native-firebase/firestore';

// Define the Post interface
export interface Post {
  id: string; // Document ID
  userId: string;
  imageUrl: string;
  caption?: string; // Optional caption
  createdAt: firestore.Timestamp; // Use firestore.Timestamp
  likesCount: number;
  viewsCount: number; // Added based on instructions
  commentsCount: number; // Added based on instructions
  likers: string[]; // Added based on instructions
}

/**
 * Adds a new post to the Firestore 'posts' collection.
 *
 * @param userId The ID of the user creating the post.
 * @param imageUrl The URL of the image for the post.
 * @param caption An optional caption for the post.
 * @returns The ID of the newly created post document.
 * @throws Throws an error if the post creation fails.
 */
export const addPost = async (
  userId: string,
  imageUrl: string,
  caption?: string,
): Promise<string> => {
  try {
    const postRef = await firestore().collection('posts').add({
      userId,
      imageUrl,
      caption: caption || '', // Store empty string if caption is undefined
      createdAt: firestore.FieldValue.serverTimestamp(), // Use server timestamp
      likesCount: 0,
      viewsCount: 0,
      commentsCount: 0,
      likers: [],
    });
    console.log('Post added successfully with ID:', postRef.id);
    return postRef.id;
  } catch (error) {
    console.error('Error adding post:', error);
    throw new Error('Failed to add post.'); // Re-throw a generic error
  }
};

/**
 * Updates the like status of a post atomically using a Firestore transaction.
 * Increments/decrements likesCount and adds/removes userId from the likers array.
 *
 * @param postId The ID of the post to update.
 * @param userId The ID of the user liking/unliking the post.
 * @throws Throws an error if the transaction fails.
 */
export const updatePostLikes = async (postId: string, userId: string): Promise<void> => {
  const postRef = firestore().collection('posts').doc(postId);

  try {
    await firestore().runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) {
        throw new Error(`Post with ID ${postId} does not exist.`);
      }

      const postData = postDoc.data() as Post; // Cast to Post type
      const likers = postData.likers || []; // Ensure likers is an array
      const isLiked = likers.includes(userId);

      if (isLiked) {
        // User is unliking the post
        transaction.update(postRef, {
          likesCount: firestore.FieldValue.increment(-1),
          likers: firestore.FieldValue.arrayRemove(userId),
        });
      } else {
        // User is liking the post
        transaction.update(postRef, {
          likesCount: firestore.FieldValue.increment(1),
          likers: firestore.FieldValue.arrayUnion(userId),
        });
      }
    });
    console.log(`Like status updated successfully for post ${postId} by user ${userId}`);
  } catch (error) {
    console.error(`Error updating likes for post ${postId}:`, error);
    throw new Error('Failed to update post likes.');
  }
};


/**
 * Increments the view count for a specific post.
 *
 * @param postId The ID of the post to increment the view count for.
 * @throws Throws an error if the update fails.
 */
export const incrementPostViews = async (postId: string): Promise<void> => {
   const postRef = firestore().collection('posts').doc(postId);
   try {
     await postRef.update({
       viewsCount: firestore.FieldValue.increment(1),
     });
     console.log(`View count incremented for post ${postId}`);
   } catch (error) {
     console.error(`Error incrementing view count for post ${postId}:`, error);
     // Decide if this should be a critical error. Maybe just log it?
     // throw new Error('Failed to increment post views.');
   }
};

/**
 * Fetches a paginated list of posts from the Firestore 'posts' collection,
 * ordered by creation date.
 *
 * @param limitNum The maximum number of posts to fetch (default: 10).
 * @param lastVisiblePost The last post document from the previous fetch, used for pagination.
 * @returns An array of Post objects.
 * @throws Throws an error if fetching posts fails.
 */
export const getPosts = async (
  limitNum: number = 10,
  lastVisiblePost?: Post,
): Promise<Post[]> => {
  try {
    let query = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(limitNum);

    // If lastVisiblePost is provided, start the query after it
    if (lastVisiblePost?.createdAt) {
      query = query.startAfter(lastVisiblePost.createdAt);
    }

    const snapshot = await query.get();

    const posts: Post[] = snapshot.docs.map(doc => ({
      id: doc.id,
      userId: doc.data().userId,
      imageUrl: doc.data().imageUrl,
      caption: doc.data().caption,
      createdAt: doc.data().createdAt,
      likesCount: doc.data().likesCount,
      viewsCount: doc.data().viewsCount,
      commentsCount: doc.data().commentsCount,
      likers: doc.data().likers,
    }));

    console.log(`Fetched ${posts.length} posts.`);
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts.');
  }
};

/**
 * Fetches a paginated list of posts for a specific user from the Firestore
 * 'posts' collection, ordered by creation date.
 *
 * @param userId The ID of the user whose posts are to be fetched.
 * @param limitNum The maximum number of posts to fetch (default: 10).
 * @param lastVisiblePost The last post document from the previous fetch, used for pagination.
 * @returns An array of Post objects.
 * @throws Throws an error if fetching posts fails.
 */
export const getUserPosts = async (
  userId: string,
  limitNum: number = 10,
  lastVisiblePost?: Post,
): Promise<Post[]> => {
  try {
    let query = firestore()
      .collection('posts')
      .where('userId', '==', userId) // Filter by userId
      .orderBy('createdAt', 'desc')
      .limit(limitNum);

    // If lastVisiblePost is provided, start the query after it
    if (lastVisiblePost?.createdAt) {
      query = query.startAfter(lastVisiblePost.createdAt);
    }

    const snapshot = await query.get();

    const posts: Post[] = snapshot.docs.map(doc => ({
      id: doc.id,
      userId: doc.data().userId,
      imageUrl: doc.data().imageUrl,
      caption: doc.data().caption,
      createdAt: doc.data().createdAt,
      likesCount: doc.data().likesCount,
      viewsCount: doc.data().viewsCount,
      commentsCount: doc.data().commentsCount,
      likers: doc.data().likers,
    }));

    console.log(`Fetched ${posts.length} posts for user ${userId}.`);
    return posts;
  } catch (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    throw new Error('Failed to fetch user posts.');
  }
};

/**
 * Fetches a single post by its ID from the Firestore 'posts' collection.
 *
 * @param postId The ID of the post to fetch.
 * @returns The Post object if found, otherwise null.
 * @throws Throws an error if fetching the post fails.
 */
export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const postDoc = await firestore().collection('posts').doc(postId).get();

    if (postDoc.exists) {
      const postData = postDoc.data();
      if (!postData) {
        // Should not happen if exists is true, but good for type safety
        console.warn(`Post data missing for existing doc ID: ${postId}`);
        return null;
      }
      const post: Post = {
        id: postDoc.id,
        userId: postData.userId,
        imageUrl: postData.imageUrl,
        caption: postData.caption,
        createdAt: postData.createdAt,
        likesCount: postData.likesCount,
        viewsCount: postData.viewsCount,
        commentsCount: postData.commentsCount,
        likers: postData.likers,
      };
      console.log(`Fetched post with ID: ${postId}`);
      return post;
    } else {
      console.log(`No post found with ID: ${postId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching post with ID ${postId}:`, error);
    throw new Error('Failed to fetch post.');
  }
};
