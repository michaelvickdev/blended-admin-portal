import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const loginHandler = async (e) => {
    try {
      e.preventDefault();
      if (!email || !pwd) {
        setError('Please enter both email and password');
        return;
      }

      const res = await signInWithEmailAndPassword(auth, email, pwd);
      console.log(res);
    } catch (e) {
      setError('Unable to sign in, please try again.');
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, function (user) {
      console.log(user);
    });
  }, []);

  return (
    <div className={styles.Overlay}>
      <div className={styles.loginBox}>
        <img
          src={require('../assets/icon.png')}
          style={{
            display: 'block',
            width: '150px',
            margin: '0 auto',
          }}
          alt="Blended Mates Logo"
        />
        <h2>Sign in to Admin Portal</h2>
        <form autoComplete="off" id="createCooForm" onSubmit={loginHandler}>
          <div className={styles.userBox}>
            <input
              spellCheck="false"
              type="text"
              name="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
            />
            <input
              type="password"
              name="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Enter Password"
            />
          </div>
          {error ? <p className={styles.error}>{error}</p> : null}
          <div className={styles.subButton}>
            <input type="submit" name="signin" value="Sign in" />
          </div>
        </form>
      </div>
    </div>
  );
};
