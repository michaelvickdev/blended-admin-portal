import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import ldsRoller from './Users/Users.module.css';
import { getImage } from '../../hooks/getImage';
import userDefault from '../../assets/default-profile.png';
import containerStyle from './Posts/Posts.module.css';
import { SendMsgModal } from '../SendMsgModal/SendMsgModal';

export const Feedback = ({ showBack }) => {
  const [feedback, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgModal, setMsgModal] = useState(false);

  const getFeedback = async () => {
    const feedbackSnaps = await getDocs(collection(db, 'support'));
    const data = feedbackSnaps.docs.map((fb) => fb.data());
    setFeedbacks(data);
    setLoading(false);
  };
  useEffect(() => {
    showBack();
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
    <div className={containerStyle.container}>
      {feedback.map((fb, index) => (
        <SingleFeedback key={index} feedback={fb} showMsgModal={setMsgModal} />
      ))}
      <SendMsgModal
        visible={msgModal}
        closeModal={() => setMsgModal(false)}
        reply={true}
      />
    </div>
  );
};

const SingleFeedback = ({ feedback, showMsgModal }) => {
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
        <div style={{ color: '#6e6869', marginLeft: 'auto' }}>
          <button
            onClick={() => {
              showMsgModal({
                username: user.username,
                uid: user.uid,
              });
            }}
            className={styles.sendMsg}
          >
            Send Message
          </button>
        </div>
      </div>
      <p>{feedback.comment}</p>
      <p style={{ color: '#6e6869', padding: 0, textAlign: 'end' }}>
        {new Date(feedback.createdAt.toDate()).toLocaleTimeString()} on{' '}
        {new Date(feedback.createdAt.toDate()).toLocaleDateString()}
      </p>
    </div>
  );
};
