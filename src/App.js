import React, { useEffect, useContext, useState } from 'react';
import './App.css';
import { Login } from './components/Login/Login';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { AuthenticatedUserContext } from './providers/AuthUserProvider';
import { auth, db } from './config/firebase';
import { Dashboard } from './components/Dashboard/Dashboard';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState('');

  const checkAdmin = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data()?.admin) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const unsubscribeAuthStateChanged = onAuthStateChanged(
      auth,
      async function (authenticatedUser) {
        let isAdmin = false;
        if (authenticatedUser) {
          isAdmin = await checkAdmin(authenticatedUser.uid);
          if (!isAdmin) {
            setErrorState(
              'Only Admins can sign in, please use Admin Credentials'
            );
            await signOut(auth);
          }
        }
        isAdmin ? setUser(authenticatedUser) : setUser(null);
        setLoading(false);
      }
    );
    return unsubscribeAuthStateChanged;
  }, []);

  if (loading) {
    return (
      <div className="lds-roller">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login {...{ errorState, setErrorState }} />;
}

export default App;
