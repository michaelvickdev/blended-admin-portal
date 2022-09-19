import React, { useState, useEffect, useRef } from 'react';
import styles from './Users.module.css';
import { db } from '../../../config/firebase';
import {
  getDocs,
  collection,
  limit,
  startAfter,
  where,
  query,
  orderBy,
} from 'firebase/firestore';
import { getImage } from '../../../hooks/getImage';
import InfiniteScroll from 'react-infinite-scroll-component';
import defaultImg from '../../../assets/default-profile.png';
const DEL_URL =
  'https://us-central1-blended-mates.cloudfunctions.net/deleteUser';

const POST_PER_PAGE = 4;

export const Users = () => {
  const lastDoc = useRef('start');
  const mounted = useRef(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [deleteUser, setDeleteUser] = useState(null);

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
        setUsers((prev) => prev.filter((user) => user.uid !== deleteUser.uid));
      }
    } catch (e) {
      console.log('Error deleting user: ', e);
    }

    setDeleteUser(null);
    setDeleting(false);
  };

  const searchUsers = async (text) => {
    setLoading(true);
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '>=', text.toLowerCase()),
      where('username', '<=', text.toLowerCase() + '\uf8ff'),
      limit(5)
    );
    const usersSnapshot = await getDocs(usersQuery);
    const usersData = usersSnapshot.docs.map((doc) => doc.data());
    setSearchData(usersData);
    setLoading(false);
  };

  useEffect(() => {
    if (searchUser.length > 2) {
      searchUsers(searchUser);
    }
  }, [searchUser]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      console.log('In effect');
      getUsers();
    }
  }, []);

  return (
    <div>
      <div className={styles.inputContainer}>
        <input
          placeholder="Search Users"
          value={searchUser}
          onChange={(e) => {
            setSearchUser(e.target.value);
          }}
        />
      </div>
      {searchUser.length > 2 ? (
        searchData.length ? (
          <div className={styles.userContainer}>
            {searchData.map((user) => (
              <SingleUser key={user.uid} user={user} {...{ showDelModal }} />
            ))}
          </div>
        ) : loading ? (
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
        ) : (
          <p style={{ textAlign: 'center' }}>'No user found'</p>
        )
      ) : (
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
            <SingleUser key={user.uid} user={user} {...{ showDelModal }} />
          ))}
        </InfiniteScroll>
      )}

      {deleteUser ? (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalBody}>
              <h3 style={{ textAlign: 'center' }}>Delete User!</h3>
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

const SingleUser = ({ user, showDelModal }) => {
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
      <div className={styles.imgContainer}>
        <img
          src={image}
          alt="Profile"
          style={{ width: '95px', height: '95px', borderRadius: '50%' }}
        />
      </div>
      <div>
        <h3>{user.fullname}</h3>
        <p style={{ margin: 0 }}>
          <b>{user.username}</b>
        </p>
        <p>{user.gender}</p>
      </div>
      <div className={styles.delBtn}>
        <button
          onClick={() => {
            showDelModal(user);
          }}
        >
          Delete User
        </button>
      </div>
    </div>
  );
};
