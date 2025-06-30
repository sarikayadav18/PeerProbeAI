import React from 'react';
import styles from './Toolbar.module.css';

const Toolbar = ({ onSave, onExport }) => {
  return (
    <div className={styles.toolbar}>
      <button className={styles.toolbarButton}>Save</button>
      <button className={styles.toolbarButton}>Export</button>
      <div className={styles.spacer} />
      <button className={styles.toolbarButton}>Invite</button>
    </div>
  );
};

export default Toolbar;