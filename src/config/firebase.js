import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// add firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyD7NOA6Ep9i2Z4J0YJZ4URGB6u4YwuV3vs',
  authDomain: 'blended-mates.firebaseapp.com',
  projectId: 'blended-mates',
  storageBucket: 'blended-mates.appspot.com',
  messagingSenderId: '573825754797',
  appId: '1:573825754797:web:2e43c96e72e51a53e84824',
  measurementId: 'G-EM944JQ0K2',
};

// initialize firebase
const app = initializeApp(firebaseConfig);

// initialize auth
const auth = getAuth(app);

//initialize firestore
const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);

export { auth, db, app, storage };
