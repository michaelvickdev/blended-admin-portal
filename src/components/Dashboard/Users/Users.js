import React, { useState, useEffect, useRef } from 'react';
import styles from './Users.module.css';
import { db } from '../../../config/firebase';
import {
  getDocs,
  collection,
  limit,
  startAfter,
  query,
  orderBy,
} from 'firebase/firestore';
import { getImage } from '../../../hooks/getImage';
import InfiniteScroll from 'react-infinite-scroll-component';
import defaultImg from '../../../assets/default-profile.png';

const POST_PER_PAGE = 4;

export const Users = () => {
  const lastDoc = useRef('start');
  const mounted = useRef(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUsers = async (count = POST_PER_PAGE) => {
    if (lastDoc.current === 'end') return;
    console.log('Getting...');
    setLoading(true);
    const queryArray = [orderBy('dateCreated', 'desc'), limit(count)];
    if (lastDoc.current !== 'start') {
      queryArray.push(startAfter(lastDoc.current));
    }
    const q = query(collection(db, 'users'), ...queryArray);
    const docSnap = await getDocs(q);
    const userData = docSnap.docs.map((doc) => doc.data());
    setUsers((prevPosts) => prevPosts.concat(userData));
    lastDoc.current =
      docSnap.size < count ? 'end' : docSnap.docs[docSnap.docs.length - 1];
    setLoading(false);
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      console.log('In effect');
      getUsers();
    }
  }, []);

  return (
    <div>
      <InfiniteScroll
        dataLength={users.length}
        next={() => {
          if (!loading) getUsers();
        }}
        className={styles.userContainer}
        hasMore={lastDoc.current !== 'end'}
        loader={
          <div className={styles.ldsRoller}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        }
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>All the Users have been loaded</b>
          </p>
        }
      >
        {users.map((user) => (
          <SingleUser key={user.uid} user={user} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

const SingleUser = ({ user }) => {
  const [image, setImage] = useState(defaultImg);

  useEffect(() => {
    (async () => {
      const imageUrl = await getImage(user.avatar);
      if (imageUrl) {
        setImage(imageUrl);
      }
    })();
  }, []);

  return (
    <div className={styles.singleUser}>
      <div>
        <img
          src={image}
          alt="Profile"
          style={{ width: '95px', borderRadius: '50%' }}
        />
      </div>
      <div>
        <h3>{user.fullname}</h3>
        <p style={{ margin: 0 }}>
          <b>{user.username}</b>
        </p>
        <p>{user.gender}</p>
      </div>
    </div>
  );
};
