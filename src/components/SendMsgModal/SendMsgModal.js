import React, { useState } from 'react';
import styles from '../Dashboard/Posts/Posts.module.css';
import modalStyles from './SendMsgModal.module.css';

const SEND_URL = 'https://us-central1-blended-mates.cloudfunctions.net/sendMsg';

export const SendMsgModal = ({ visible, closeModal, reply }) => {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const sendMsg = async () => {
    if (!msg) return;
    try {
      setSending(true);
      console.log({
        username: visible.username,
        email: visible.uid,
        msg: reply
          ? `This message in response to the feedback you provided. \n${msg}`
          : msg,
      });
      await fetch(SEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: visible.username,
          uid: visible.uid,
          msg: msg,
        }),
      });
    } catch (e) {
      console.log('Error sending message: ', e);
    }
    setMsg('');
    setSending(false);
  };
  return visible ? (
    <div className={styles.modalOverlay}>
      <div
        className={styles.modal}
        style={{ width: '70%', maxHeight: '80vh', maxWidth: '976px' }}
      >
        <h3 style={{ textAlign: 'center' }}>Send Message</h3>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className={modalStyles.textarea}
          placeholder="Enter you message..."
          disabled={sending}
        />
        <div className={styles.modalBtn}>
          <button
            style={{
              backgroundColor: '#26742dd6',
              border: 'none',
              color: '#fff',
            }}
            onClick={sendMsg}
            disabled={!msg}
          >
            {sending ? 'Sending' : 'Send'}
          </button>

          {!sending ? <button onClick={closeModal}>Cancel</button> : null}
        </div>
      </div>
    </div>
  ) : null;
};
