import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import ldsRoller from './Users/Users.module.css';
import { getImage } from '../../hooks/getImage';
import userDefault from '../../assets/default-profile.png';

export const Feedback = () => {
  const [feedback, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getFeedback = async () => {
    const feedbackSnaps = await getDocs(collection(db, 'support'));
    const data = feedbackSnaps.docs.map((fb) => fb.data());
    setFeedbacks(data);
    setLoading(false);
  };
  useEffect(() => {
    getFeedback();
  }, []);
  if (!feedback.length) {
    return loading ? (
      <div className={ldsRoller.ldsRoller}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    ) : (
      <h3 style={{ textAlign: 'center', padding: '2rem' }}>No Feedback yet.</h3>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {feedback.map((fb, index) => (
        <SingleFeedback key={index} feedback={fb} />
      ))}
    </div>
  );
};

const SingleFeedback = ({ feedback }) => {
  const [user, setUser] = useState(null);
  const [defaultDp, setDefaultDp] = useState(userDefault);
  const getUserData = async () => {
    const userSnap = await getDoc(doc(db, 'users', feedback.user));
    if (userSnap.exists()) {
      const userImg = await getImage(userSnap.data().avatar);
      if (userImg) {
        setDefaultDp(userImg);
      }
      setUser(userSnap.data());
    }
  };
  console.log(new Date(feedback.createdAt.toDate()));
  useEffect(() => {
    getUserData();
  }, []);
  return (
    <div className={styles.feedbackContainer}>
      <div className={styles.desc}>
        <img
          src={defaultDp}
          style={{ width: '95px', aspectRatio: 1, borderRadius: '50%' }}
          alt={user ? user.username + ' dp' : 'default dp'}
        />
        <h3>{user ? user.username : ''}</h3>
        <p style={{ color: '#6e6869', marginLeft: 'auto' }}>
          {new Date(feedback.createdAt.toDate()).toLocaleTimeString()} on{' '}
          {new Date(feedback.createdAt.toDate()).toLocaleDateString()}
        </p>
      </div>
      <p>{feedback.comment}</p>
    </div>
  );
};
