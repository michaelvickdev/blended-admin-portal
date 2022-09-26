import { signOut } from 'firebase/auth';
import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { Home } from './Home';
import { Users } from './Users/Users';
import { Posts } from './Posts/Posts';
import { auth } from '../../config/firebase';
import { Feedback } from './Feedback';
import BackSvg from '../../assets/back.svg';
import { useState } from 'react';
import { useEffect } from 'react';

export const Dashboard = (props) => {
  const [showBack, setShowBack] = useState(false);
  const signOutAdmin = () => {
    signOut(auth);
  };
  useEffect(() => {
    setShowBack(false);
  }, []);
  return (
    <>
      <div className={styles.navigationBar}>
        <Link
          to="/dashboard"
          style={{
            textDecoration: 'none',
            color: '#424242',
            display: 'flex',
            gap: '1rem',
          }}
        >
          {showBack ? <img src={BackSvg} alt="back" width="24px" /> : null}
          <h2>Blended Mates Admin Portal</h2>
        </Link>
        <button onClick={signOutAdmin}>Sign Out</button>
      </div>
      <Routes>
        <Route
          path="/dashboard"
          exact
          element={<Home hideBack={() => setShowBack(false)} />}
        />
        <Route
          path="/manage-users"
          exact
          element={<Users showBack={() => setShowBack(true)} />}
        />
        <Route
          path="/manage-posts"
          exact
          element={<Posts showBack={() => setShowBack(true)} />}
        />
        <Route
          path="/user-feedback"
          exact
          element={<Feedback showBack={() => setShowBack(true)} />}
        />
        <Route path="/*" element={<Navigate replace to="/dashboard" />} />
      </Routes>
    </>
  );
};
