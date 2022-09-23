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
  getDoc,
  doc,
  where,
  arrayRemove,
  updateDoc,
} from 'firebase/firestore';
import { getImage } from '../../../hooks/getImage';
import InfiniteScroll from 'react-infinite-scroll-component';
import defaultImg from '../../../assets/default-post.jpg';
import userDefault from '../../../assets/default-profile.png';
import { SendMsgModal } from '../../SendMsgModal/SendMsgModal';
const DEL_URL =
  'https://us-central1-blended-mates.cloudfunctions.net/deleteFeed';

const POST_PER_PAGE = 4;

export const Posts = () => {
  const lastDoc = useRef('start');
  const mounted = useRef(false);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteFeed, setDeleteFeed] = useState(null);
  const [reportedOnly, setReportedOnly] = useState(false);
  const [comment, setComment] = useState(false);
  const [msgModal, setMsgModal] = useState(false);

  const getFeeds = async (count = POST_PER_PAGE, reported = false) => {
    if (lastDoc.current === 'end') return;
    setLoading(true);
    const queryArray = [
      orderBy('reported', 'desc'),
      orderBy('uploadDate', 'desc'),
      limit(count),
    ];
    if (reported) {
      queryArray.push(where('reported', '!=', []));
    }

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

  const showDelModal = (feed) => {
    setDeleteFeed(feed);
  };

  const delHandler = async () => {
    try {
      setDeleting(true);
      const res = await fetch(DEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feed: deleteFeed,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFeeds((prev) => prev.filter((feed) => feed.id !== deleteFeed.id));
      }
    } catch (e) {
      console.log('Error deleting user: ', e);
    }

    setDeleteFeed(null);
    setDeleting(false);
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      getFeeds();
    }
  }, []);

  const reportedToggle = (e) => {
    setReportedOnly(e.target.checked);
    lastDoc.current = 'start';
    setFeeds([]);
    e.target.checked ? getFeeds(undefined, true) : getFeeds();
  };

  const delComment = async (toDel) => {
    const id = toDel.id;
    delete toDel.id;
    const feedRef = doc(db, 'feeds', id);
    await updateDoc(feedRef, {
      comments: arrayRemove(toDel),
    });
    setComment((prev) =>
      prev.filter((single) => {
        delete single.id;
        return JSON.stringify(toDel) !== JSON.stringify(single);
      })
    );
    setFeeds((prev) =>
      prev.map((feed) =>
        feed.id === id
          ? {
              ...feed,
              comments: feed.comments.filter(
                (single) => JSON.stringify(toDel) !== JSON.stringify(single)
              ),
            }
          : feed
      )
    );
    if (!comment.length) {
      setComment(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <input
          type="checkbox"
          id="reported"
          name="reported"
          onChange={reportedToggle}
          disabled={loading}
        />
        <label htmlFor="reported"> Show Reported Posts Only</label>
      </div>

      <InfiniteScroll
        dataLength={feeds.length}
        next={() => {
          if (!loading) {
            reportedOnly ? getFeeds(undefined, true) : getFeeds();
          }
        }}
        className={styles.scrollContainer}
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
          <SingleFeed
            key={feed.id}
            feed={feed}
            {...{ showDelModal }}
            setComment={setComment}
            showMsgModal={setMsgModal}
          />
        ))}
      </InfiniteScroll>

      {deleteFeed ? (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalBody}>
              <h3 style={{ textAlign: 'center' }}>Delete Feed!</h3>
              <p>
                Are you sure you want to delete this feed and all the
                likes/comments associated with it?
                <br />
                It is a non-recoverable action.
              </p>
            </div>
            <div className={styles.modalBtn}>
              <button onClick={delHandler}>
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
              {!deleting ? (
                <button
                  onClick={() => {
                    setDeleteFeed(null);
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {comment ? (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modal}
            style={{
              width: '80%',
              maxWidth: '1024px',
              maxHeight: '80%',
              overflowY: 'scroll',
              padding: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                background: '#fff',
              }}
            >
              <h3 style={{ textAlign: 'center' }}>Comments</h3>
              <span
                className={styles.closeComment}
                onClick={() => setComment(false)}
              >
                &#10006;
              </span>
            </div>
            <div style={{ padding: '1rem 2rem' }}>
              {comment.length ? (
                comment.map((single) => (
                  <Comment
                    comment={single}
                    key={single.sentBy + single.timestamp}
                    id={comment.id}
                    delComment={delComment}
                  />
                ))
              ) : (
                <p style={{ textAlign: 'center', margin: '2rem' }}>
                  There are no comments
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
      <SendMsgModal visible={msgModal} closeModal={() => setMsgModal(false)} />
    </div>
  );
};

const SingleFeed = ({ feed, showDelModal, setComment, showMsgModal }) => {
  const [image, setImage] = useState(defaultImg);
  const [user, setUser] = useState(null);
  const [defaultDp, setDefaultDp] = useState(userDefault);
  const getUserData = async () => {
    const userSnap = await getDoc(doc(db, 'users', feed.uid));
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

  useEffect(() => {
    (async () => {
      const imageUrl = await getImage(feed.url);
      if (imageUrl) {
        setImage(imageUrl);
      }
    })();
  }, []);

  return (
    <div className={styles.feedContainer}>
      <div className={styles.desc}>
        <img
          src={defaultDp}
          style={{ width: '95px', aspectRatio: 1, borderRadius: '50%' }}
          alt={user ? user.username + ' dp' : 'default dp'}
        />
        <h3>{user ? user.username : ''}</h3>
        <div className={styles.delBtn}>
          <button
            onClick={() => {
              showDelModal({
                ...feed,
                username: user.username,
                uid: user.uid,
              });
            }}
          >
            Delete Feed
          </button>
          <button
            onClick={() => {
              showMsgModal({
                username: user.username,
                uid: user.uid,
              });
            }}
            style={{ backgroundColor: '#26742dd6' }}
          >
            Send Message
          </button>
        </div>
      </div>
      <div className={styles.imgDiv}>
        <h4 style={{ margin: '0 0 1rem 0' }}>{feed.title}</h4>
        <div
          style={{
            backgroundColor: '#000',
            borderRadius: '2rem',
            overflow: 'hidden',
          }}
        >
          {feed.isVideo ? (
            <video
              width="fit-content"
              height="auto"
              style={{
                margin: '0 auto',
                display: 'block',
              }}
              controls
              name="media"
            >
              <source src={image} type="video/mp4" />
            </video>
          ) : (
            <img
              src={image}
              alt={feed.title}
              style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
            />
          )}
        </div>
        <div className={styles.details}>
          <p>{feed.likes.length} Likes</p>
          <p
            onClick={() =>
              setComment(
                feed.comments.map((single) => ({ ...single, id: feed.id }))
              )
            }
          >
            {feed.comments.length} Comments
          </p>
        </div>
      </div>
    </div>
  );
};

const Comment = ({ comment, id, delComment }) => {
  const [user, setUser] = useState('');
  useEffect(() => {
    (async () => {
      const userData = await getDoc(doc(db, 'users', comment.sentBy));
      setUser(userData.data().username);
    })();
  }, []);

  return (
    <div className={styles.commentBubble}>
      <div className={styles.commentContent}>
        <div>
          <h4>{user}</h4>
          <p>{comment.text}</p>
        </div>
        <div className={styles.delBtn} style={{ margin: 0 }}>
          <button onClick={() => delComment(comment, id)}>Delete</button>
        </div>
      </div>
      <p style={{ alignSelf: 'flex-end', color: '#6e6869' }}>
        {new Date(comment.timestamp).toLocaleTimeString()} on{' '}
        {new Date(comment.timestamp).toLocaleDateString()}
      </p>
    </div>
  );
};
