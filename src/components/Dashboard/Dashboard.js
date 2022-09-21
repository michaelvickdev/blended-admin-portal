import { signOut } from 'firebase/auth';
import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { Home } from './Home';
import { Users } from './Users/Users';
import { Posts } from './Posts/Posts';
import { auth } from '../../config/firebase';
import { Feedback } from './Feedback';

export const Dashboard = () => {
  const signOutAdmin = () => {
    signOut(auth);
  };
  return (
    <>
      <div className={styles.navigationBar}>
        <Link
          to="/dashboard"
          style={{ textDecoration: 'none', color: '#424242' }}
        >
          <h2>Blended Mates Admin Portal</h2>
        </Link>
        <button onClick={signOutAdmin}>Sign Out</button>
      </div>
      <Routes>
        <Route path="/dashboard" exact element={<Home />} />
        <Route path="/manage-users" exact element={<Users />} />
        <Route path="/manage-posts" exact element={<Posts />} />
        <Route path="/user-feedback" exact element={<Feedback />} />
        <Route path="/*" element={<Navigate replace to="/dashboard" />} />
      </Routes>
    </>
  );
};
