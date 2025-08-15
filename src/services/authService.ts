import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, LoginCredentials, SignupCredentials, AuthResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  async initialize() {
    // Any initialization logic
    console.log('AuthService initialized');
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();
      
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData?.name || firebaseUser.displayName || '',
        profileImage: userData?.profileImage || firebaseUser.photoURL,
        phoneNumber: userData?.phoneNumber,
        dateOfBirth: userData?.dateOfBirth,
        emailVerified: firebaseUser.emailVerified,
        createdAt: userData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Get access token
      const accessToken = await firebaseUser.getIdToken();
      
      // Store token and user data
      await AsyncStorage.setItem(this.TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));

      return {
        user,
        accessToken,
        refreshToken: '', // Firebase handles refresh tokens automatically
        success: true,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const { firstName, lastName, email, password } = credentials;
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase profile
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`,
      });

      // Create user document in Firestore
      const userData = {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name,
        emailVerified: firebaseUser.emailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };

      // Get access token
      const accessToken = await firebaseUser.getIdToken();
      
      // Store token and user data
      await AsyncStorage.setItem(this.TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));

      return {
        user,
        accessToken,
        refreshToken: '',
        success: true,
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem(this.TOKEN_KEY);
      await AsyncStorage.removeItem(this.USER_KEY);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  async refreshToken(): Promise<AuthResponse | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }

      const accessToken = await currentUser.getIdToken(true);
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      
      if (!userData) {
        return null;
      }

      const user = JSON.parse(userData);
      
      await AsyncStorage.setItem(this.TOKEN_KEY, accessToken);

      return {
        user,
        accessToken,
        refreshToken: '',
        success: true,
      };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      // Get updated user data
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();

      const updatedUser: User = {
        id: currentUser.uid,
        email: currentUser.email!,
        name: userData?.name || currentUser.displayName || '',
        profileImage: userData?.profileImage || currentUser.photoURL,
        phoneNumber: userData?.phoneNumber,
        dateOfBirth: userData?.dateOfBirth,
        emailVerified: currentUser.emailVerified,
        createdAt: userData?.createdAt || new Date().toISOString(),
        updatedAt: userData?.updatedAt || new Date().toISOString(),
      };

      // Update stored user data
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }
}

export const authService = new AuthService();