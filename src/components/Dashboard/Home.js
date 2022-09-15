import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { Link } from 'react-router-dom';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { CSVLink } from 'react-csv';

export const Home = () => {
  const [userData, setUserData] = useState([]);
  const getContactInfo = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    querySnapshot.forEach((doc) => {
      setUserData((prev) => [
        ...prev,
        {
          fullname: doc.data().fullname,
          username: doc.data().username,
          email: doc.data().email,
          phone: doc.data().phone,
          gender: doc.data().gender,
        },
      ]);
    });
  };

  useEffect(() => {
    getContactInfo();
  }, []);

  return (
    <div className={styles.homeContainer}>
      <Link to="/all-users">Manage Users</Link>
      <Link to="/reported-posts">Manage Posts</Link>
      {userData ? (
        <CSVLink data={userData} filename={'user-info.csv'}>
          Download User Info
        </CSVLink>
      ) : null}
    </div>
  );
};
