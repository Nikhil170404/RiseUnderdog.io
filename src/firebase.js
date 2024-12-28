import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs,
  getDoc,
  query, 
  where,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  serverTimestamp,
  increment,
  orderBy,
  writeBatch,
  arrayUnion
} from 'firebase/firestore';
import { 
  getStorage, 
  ref,
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCxdoKab4agDCag2syrjpeF2vYfNTIbYEE",
  authDomain: "esports-d882d.firebaseapp.com",
  projectId: "esports-d882d",
  storageBucket: "esports-d882d.appspot.com",
  messagingSenderId: "314534424935",
  appId: "1:314534424935:web:4f2c8a8c3f5b8b8b8b8b8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Admin credentials
const ADMIN_EMAIL = 'admin@esports.com';
const ADMIN_PASSWORD = 'Admin@123';

// Function to initialize admin account
const initializeAdminAccount = async () => {
  try {
    // First, try to sign in as admin
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      console.log('Admin login successful');
      return;
    } catch (error) {
      // If login fails, proceed with creation
      console.log('Admin login failed, attempting creation');
    }

    // Create admin user in Firebase Auth
    const { user } = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    // Create admin profile in Firestore
    const adminData = {
      uid: user.uid,
      email: ADMIN_EMAIL,
      displayName: 'Admin',
      role: 'admin',
      isAdmin: true,
      createdAt: new Date().toISOString(),
      photoURL: null,
      active: true
    };

    await setDoc(doc(db, 'users', user.uid), adminData);
    console.log('Admin account created successfully');

  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      // If admin exists, ensure the Firestore document exists
      const adminQuery = await getDocs(
        query(collection(db, 'users'), where('email', '==', ADMIN_EMAIL))
      );

      if (adminQuery.empty) {
        // Create admin document if it doesn't exist
        const adminUser = (await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)).user;
        await setDoc(doc(db, 'users', adminUser.uid), {
          uid: adminUser.uid,
          email: ADMIN_EMAIL,
          displayName: 'Admin',
          role: 'admin',
          isAdmin: true,
          createdAt: new Date().toISOString(),
          photoURL: null,
          active: true
        });
      }
      console.log('Admin account verified');
    } else {
      console.error('Error initializing admin account:', error);
    }
  }
};

// Initialize admin account when the app starts
initializeAdminAccount();

// Player Stats and Ranking Functions
const updatePlayerStats = async (userId, gameResult) => {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    gamesPlayed: increment(1),
    gamesWon: increment(gameResult.won ? 1 : 0),
    gamesLost: increment(gameResult.won ? 0 : 1),
    totalScore: increment(gameResult.score || 0),
    lastUpdated: serverTimestamp()
  });
};

const getPlayerRankings = async () => {
  const playersQuery = query(
    collection(db, 'users'),
    where('role', '==', 'player'),
    orderBy('gamesWon', 'desc')
  );

  const snapshot = await getDocs(playersQuery);
  return snapshot.docs.map((doc, index) => ({
    id: doc.id,
    rank: index + 1,
    ...doc.data()
  }));
};

// Team Management Functions
const createTeam = async (teamData) => {
  const teamRef = await addDoc(collection(db, 'teams'), {
    ...teamData,
    createdAt: serverTimestamp(),
    status: 'pending'
  });
  return teamRef.id;
};

const updateTeamStatus = async (teamId, status) => {
  const teamRef = doc(db, 'teams', teamId);
  await updateDoc(teamRef, {
    status,
    updatedAt: serverTimestamp()
  });
};

export {
  auth,
  db,
  storage,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,
  arrayUnion,
  ref,
  uploadBytes,
  getDownloadURL,
  getPlayerRankings,
  createTeam,
  updateTeamStatus,
  updatePlayerStats
};