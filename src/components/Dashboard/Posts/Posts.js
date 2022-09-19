import React, { useState, useEffect, useRef } from 'react';
import styles from './Posts.module.css';
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
import defaultImg from '../../../assets/default-post.jpg';
const DEL_URL =
  'https://us-central1-blended-mates.cloudfunctions.net/deleteUser';

const POST_PER_PAGE = 4;

export const Posts = () => {
  const lastDoc = useRef('start');
  const mounted = useRef(false);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);

  const getFeeds = async (count = POST_PER_PAGE) => {
    if (lastDoc.current === 'end') return;
    console.log('Getting...');
    setLoading(true);
    const queryArray = [orderBy('uploadDate', 'desc'), limit(count)];
    if (lastDoc.current !== 'start') {
      queryArray.push(startAfter(lastDoc.current));
    }
    const q = query(collection(db, 'feeds'), ...queryArray);
    const docSnap = await getDocs(q);
    const feedData = docSnap.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setFeeds((prevPosts) => prevPosts.concat(feedData));
    lastDoc.current =
      docSnap.size < count ? 'end' : docSnap.docs[docSnap.docs.length - 1];
    setLoading(false);
  };

  const showDelModal = (user) => {
    setDeleteUser(user);
  };

  const delHandler = async () => {
    try {
      setDeleting(true);
      const res = await fetch(DEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: deleteUser.uid,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFeeds((prev) => prev.filter((user) => user.uid !== deleteUser.uid));
      }
    } catch (e) {
      console.log('Error deleting user: ', e);
    }

    setDeleteUser(null);
    setDeleting(false);
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      getFeeds();
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <button>Show Reported Posts Only</button>
      </div>

      <InfiniteScroll
        dataLength={feeds.length}
        next={() => {
          if (!loading) getFeeds();
        }}
        className={styles.feedContainer}
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
        {feeds.map((feed) => (
          <SingleFeed key={feed.id} feed={feed} {...{ showDelModal }} />
        ))}
      </InfiniteScroll>

      {deleteUser ? (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalBody}>
              <h3 style={{ textAlign: 'center' }}>Delete Feed!</h3>
              <p>
                Are you sure you want to delete <b>{deleteUser.username}</b>?
                <br />
                It is a non-recoverable action.
              </p>
            </div>
            <div className={styles.modalBtn}>
              <button onClick={delHandler}>
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button
                onClick={() => {
                  setDeleteUser(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const SingleFeed = ({ feed, showDelModal }) => {
  const [image, setImage] = useState(defaultImg);

  useEffect(() => {
    (async () => {
      const imageUrl = await getImage(feed.url);
      if (imageUrl) {
        setImage(imageUrl);
      }
    })();
  }, []);

  return (
    <div className={styles.singleFeed}>
      <div className={styles.feedContainer}>
        <h3>{feed.title}</h3>
        <div className={styles.imgDiv}>
          <img src={image} style={{ maxWidth: '100%' }} alt={feed.title} />
        </div>
      </div>
    </div>
  );
};
