import { signOut } from 'firebase/auth';
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { Home } from './Home';
import { Users } from './Users/Users';
import { Posts } from './Posts/Posts';
import { auth } from '../../config/firebase';

export const Dashboard = () => {
  const signOutAdmin = () => {
    signOut(auth);
  };
  return (
    <>
      <div className={styles.navigationBar}>
        <h2>Blended Mates Admin Portal</h2>
        <button onClick={signOutAdmin}>Sign Out</button>
      </div>
      <Routes>
        <Route path="/dashboard" exact element={<Home />} />
        <Route path="/manage-users" exact element={<Users />} />
        <Route path="/manage-posts" exact element={<Posts />} />
        <Route path="/*" element={<Navigate replace to="/dashboard" />} />
      </Routes>
    </>
  );
};
