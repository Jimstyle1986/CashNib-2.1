import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let firebaseApp: admin.app.App;
let db: FirebaseFirestore.Firestore;
let auth: admin.auth.Auth;
let storage: admin.storage.Storage;

export const initializeFirebase = () => {
  try {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      // Check if we have valid Firebase credentials
      if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === 'cashnib-demo') {
        console.warn('⚠️ Firebase credentials not configured. Using mock Firebase for development.');
        // Create a mock Firebase app for development
        firebaseApp = admin.initializeApp({
          projectId: 'demo-project'
        }, 'demo');
      } else {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
          ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
          : require('../../config/serviceAccountKey.json');

        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
      }
    } else {
      firebaseApp = admin.app();
    }

    // Initialize services
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    storage = getStorage(firebaseApp);

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.warn('⚠️ Continuing with limited functionality...');
    // Don't throw error to allow server to start
  }
};

// Firestore collections
export const collections = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  GOALS: 'goals',
  INVESTMENTS: 'investments',
  BUDGETS: 'budgets',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  AI_CONVERSATIONS: 'ai_conversations',
  AI_INSIGHTS: 'ai_insights'
};

// Export Firebase services
export { db, auth, storage, firebaseApp };

// Helper functions
export const verifyIdToken = async (idToken: string) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
};

export const getUserById = async (uid: string) => {
  try {
    const userDoc = await db.collection(collections.USERS).doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

export const createUser = async (uid: string, userData: any) => {
  try {
    const userRef = db.collection(collections.USERS).doc(uid);
    await userRef.set({
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: uid, ...userData };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

export const updateUser = async (uid: string, userData: any) => {
  try {
    const userRef = db.collection(collections.USERS).doc(uid);
    await userRef.update({
      ...userData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: uid, ...userData };
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};