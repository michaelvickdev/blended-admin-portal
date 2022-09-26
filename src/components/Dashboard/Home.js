import React, { useState } from 'react';
import styles from './Dashboard.module.css';
import modalStyles from './Users/Users.module.css';
import { Link } from 'react-router-dom';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useEffect } from 'react';

export const Home = ({ hideBack }) => {
  const [downloadData, setDownloadData] = useState(false);
  useEffect(() => {
    hideBack();
  }, []);
  const getContactInfo = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const userData = [];
    querySnapshot.forEach((doc) => {
      if (!doc.data()?.admin)
        userData.push({
          fullname: doc.data().fullname,
          username: doc.data().username,
          email: doc.data().email,
          phone: doc.data().phone + '',
          gender: doc.data().gender,
        });
    });
    return userData;
  };

  const downloadFile = ({ data, fileName, fileType }) => {
    const blob = new Blob([data], { type: fileType });

    const a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  };

  const downloadHandler = async () => {
    setDownloadData('downloading');
    const usersData = await getContactInfo();
    let headers = [Object.keys(usersData[0]).join(',')];
    let usersCsv = usersData.reduce((acc, user) => {
      acc.push([Object.values(user)].join(','));
      return acc;
    }, []);

    downloadFile({
      data: [...headers, ...usersCsv].join('\n'),
      fileName: 'users.csv',
      fileType: 'text/csv',
    });
    setDownloadData(false);
  };

  return (
    <div className={styles.homeContainer}>
      <Link to="/manage-users">Manage Users</Link>
      <Link to="/manage-posts">Manage Posts</Link>
      <Link to="/user-feedback">User Feedback</Link>
      <a onClick={() => setDownloadData(true)}>Download User Info</a>
      {downloadData ? (
        <div className={modalStyles.modalOverlay}>
          <div className={modalStyles.modal}>
            <div className={modalStyles.modalBody}>
              <h3 style={{ textAlign: 'center' }}>Download Content!</h3>
              <p>
                Are you sure you want to download all user's data?
                <br />
                It will take some time to fetch and download all the data.
              </p>
            </div>
            <div className={modalStyles.modalBtn}>
              <button
                onClick={downloadHandler}
                style={{
                  backgroundColor: '#26742dd6',
                  border: 'none',
                  color: '#fff',
                }}
              >
                {downloadData === 'downloading' ? 'Downloading...' : 'Download'}
              </button>
              {!(downloadData === 'downloading') ? (
                <button
                  onClick={() => {
                    setDownloadData(false);
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
