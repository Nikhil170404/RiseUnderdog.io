import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import { SET_USER, LOGOUT } from '../redux/actions/authAction';

const useFirebaseAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get additional user data from Firestore
          const userRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();

          const authUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            ...userData,
          };

          dispatch({
            type: SET_USER,
            payload: authUser,
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        dispatch({ type: LOGOUT });
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [dispatch]);
};

export default useFirebaseAuth;
