import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  // Button, // Unused
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
// import Feather from 'react-native-vector-icons/Feather'; // Unused
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker'; // Removed Asset type
import storage from '@react-native-firebase/storage';
import { addPost } from '../services/firestoreService'; // Assuming correct path
import { useAuth } from '../context/AuthContext'; // Assuming correct path

const UploadScreen = () => {
  const { userId } = useAuth(); // Get current user ID from context
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Request permissions on component mount (Android)
  useEffect(() => {
    if (Platform.OS === 'android') {
      requestPermissions();
    }
  }, []);

  const requestPermissions = async () => {
    try {
      // Request Camera Permission (Optional, if you add camera support later)
      // const cameraGranted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.CAMERA,
      //   {
      //     title: "Camera Permission",
      //     message: "App needs access to your camera.",
      //     buttonNeutral: "Ask Me Later",
      //     buttonNegative: "Cancel",
      //     buttonPositive: "OK"
      //   }
      // );
      // if (cameraGranted !== PermissionsAndroid.RESULTS.GRANTED) {
      //   // console.log("Camera permission denied"); // Removed debug log
      // }

      // Request Storage Permission (READ_EXTERNAL_STORAGE is often enough for gallery)
      // For Android 13+, specific permissions like READ_MEDIA_IMAGES might be needed
      const storagePermission = Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      const storageGranted = await PermissionsAndroid.request(
        storagePermission,
        {
          title: "Storage Permission",
          message: "App needs access to your storage to select photos.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (storageGranted !== PermissionsAndroid.RESULTS.GRANTED) {
        // console.log("Storage permission denied"); // Removed debug log
        Alert.alert("Permission Denied", "Storage permission is required to select images.");
      }
    } catch (err) {
      console.warn("Permission request error:", err);
    }
  };


  const selectImage = async () => {
    // Ensure permissions are granted before launching (especially important for Android)
    if (Platform.OS === 'android') {
       const storagePermission = Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const granted = await PermissionsAndroid.check(storagePermission);
      if (!granted) {
        Alert.alert("Permission Required", "Please grant storage permission in settings to select images.");
        await requestPermissions(); // Attempt to request again
        return;
      }
    }

    launchImageLibrary({ mediaType: 'photo' }, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        // console.log('User cancelled image picker'); // Removed debug log
      } else if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorCode, response.errorMessage); // Use console.error
        Alert.alert('Error', 'Failed to select image.');
      } else if (response.assets && response.assets.length > 0) {
        const selectedAsset = response.assets[0];
        if (selectedAsset.uri) {
          setImageUri(selectedAsset.uri);
          // console.log('Image selected:', selectedAsset.uri); // Removed debug log
        }
      }
    });
  };

  const uploadPost = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }
    if (!userId) {
      Alert.alert('Not Logged In', 'You need to be logged in to post.');
      return; // Should ideally not happen if UploadScreen is protected
    }

    setIsUploading(true);
    setUploadProgress(0);

    const fileName = imageUri.substring(imageUri.lastIndexOf('/') + 1);
    const timestamp = Date.now();
    const filePath = `posts/${userId}/${timestamp}-${fileName}`;
    const storageRef = storage().ref(filePath);

    try {
      const task = storageRef.putFile(imageUri);

      task.on('state_changed', snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('Upload is ' + progress + '% done'); // Removed debug log
        setUploadProgress(Math.round(progress));
      });

      await task; // Wait for upload completion

      // console.log('Upload successful!'); // Removed debug log
      const downloadURL = await storageRef.getDownloadURL();
      // console.log('File available at', downloadURL); // Removed debug log

      // Add post details to Firestore
      await addPost(userId, downloadURL, caption);
      Alert.alert('Success', 'Post uploaded successfully!');

    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', error.message || 'Could not upload post.');
    } finally {
      // Reset state regardless of success or failure
      setIsUploading(false);
      setUploadProgress(0);
      setImageUri(null);
      setCaption('');
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000', padding: 10 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          padding: 10,
          paddingVertical: 15,
          alignItems: 'center',
        }}>
        <View style={{flex: 1, paddingHorizontal: 10}}>
          <Text
            style={{
              fontWeight: 'bold',
              color: '#fff',
              fontSize: 18,
              textAlign: 'center',
            }}>
            New Post
          </Text>
        </View>
        {/* Removed duplicate header text */}
      </View>

      {/* Content Area */}
      <View style={{ flex: 1, alignItems: 'center', marginTop: 20 }}>
        {/* Image Preview */}
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '90%', height: 300, marginBottom: 20, resizeMode: 'contain' }}
          />
        )}

        {/* Caption Input */}
        <TextInput
          style={{
            width: '90%',
            height: 50,
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 5,
            marginBottom: 20,
            paddingHorizontal: 10,
            color: '#fff', // White text color
            backgroundColor: '#333', // Dark background for input
          }}
          placeholder="Write a caption..."
          placeholderTextColor="#aaa" // Lighter placeholder text
          value={caption}
          onChangeText={setCaption}
          editable={!isUploading} // Disable input during upload
        />

        {/* Select Image Button */}
         <TouchableOpacity
          onPress={selectImage}
          disabled={isUploading}
          style={{
            backgroundColor: isUploading ? '#555' : '#007AFF', // Gray out when disabled
            padding: 15,
            borderRadius: 5,
            alignItems: 'center',
            width: '90%',
            marginBottom: 10,
          }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Select Image</Text>
        </TouchableOpacity>


        {/* Upload Progress and Indicator */}
        {isUploading && (
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: '#fff', marginTop: 5 }}>
              Uploading: {uploadProgress}%
            </Text>
          </View>
        )}

        {/* Post Button */}
        <TouchableOpacity
          onPress={uploadPost}
          disabled={!imageUri || isUploading} // Disable if no image or uploading
          style={{
            backgroundColor: (!imageUri || isUploading) ? '#555' : '#4CAF50', // Gray out when disabled, Green when active
            padding: 15,
            borderRadius: 5,
            alignItems: 'center',
            width: '90%',
            marginTop: 10, // Add some margin top
          }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Post</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};
export default UploadScreen;
