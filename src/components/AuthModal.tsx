import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const slideAnim = useRef(new Animated.Value(height)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user = {
        id: '1',
        email: formData.email,
        username: isLogin ? 'User' : formData.username,
      };
      
      setLoading(false);
      onAuthSuccess(user);
    }, 1500);
  };

  const handleSocialAuth = (provider: string) => {
    setLoading(true);
    
    // Simulate social auth
    setTimeout(() => {
      const user = {
        id: '1',
        email: `user@${provider}.com`,
        username: `${provider}User`,
      };
      
      setLoading(false);
      onAuthSuccess(user);
    }, 1000);
  };

  const InputField = ({ 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false, 
    keyboardType = 'default',
    error 
  }: any) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                  {isLogin ? 'Welcome Back' : 'Join PsychoSud'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {isLogin 
                    ? 'Sign in to continue your journey' 
                    : 'Create your account to get started'
                  }
                </Text>
              </View>

              {/* Social Auth Buttons */}
              <View style={styles.socialContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialAuth('google')}
                  disabled={loading}
                >
                  <Icon name="google" size={20} color="#fff" />
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialAuth('facebook')}
                  disabled={loading}
                >
                  <Icon name="facebook" size={20} color="#fff" />
                  <Text style={styles.socialButtonText}>Continue with Facebook</Text>
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                {!isLogin && (
                  <InputField
                    placeholder="Username"
                    value={formData.username}
                    onChangeText={(text: string) => setFormData({ ...formData, username: text })}
                    error={errors.username}
                  />
                )}
                
                <InputField
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(text: string) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  error={errors.email}
                />
                
                <InputField
                  placeholder="Password"
                  value={formData.password}
                  onChangeText={(text: string) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                  error={errors.password}
                />
                
                {!isLogin && (
                  <InputField
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(text: string) => setFormData({ ...formData, confirmPassword: text })}
                    secureTextEntry
                    error={errors.confirmPassword}
                  />
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#ff4458', '#ff6b7a']}
                    style={styles.submitButtonGradient}
                  >
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <Text style={styles.submitButtonText}>
                          {isLogin ? 'Signing In...' : 'Creating Account...'}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {isLogin ? 'Sign In' : 'Create Account'}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Forgot Password */}
                {isLogin && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Switch Auth Mode */}
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </Text>
                <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                  <Text style={styles.switchLink}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Terms */}
              {!isLogin && (
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.9,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 20,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  socialContainer: {
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    fontSize: 14,
    marginHorizontal: 15,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    color: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#f44336',
    borderWidth: 1,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  submitButton: {
    marginTop: 10,
    marginBottom: 15,
  },
  submitButtonGradient: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#ff4458',
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: 20,
    marginBottom: 15,
  },
  switchText: {
    color: '#666',
    fontSize: 14,
  },
  switchLink: {
    color: '#ff4458',
    fontSize: 14,
    fontWeight: '600',
  },
  termsText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  termsLink: {
    color: '#ff4458',
  },
});

export default AuthModal;

