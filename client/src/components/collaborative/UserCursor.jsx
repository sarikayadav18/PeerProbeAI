import React from 'react';
import styles from './UserCursor.module.css';

const UserCursor = ({ position, color, name }) => {
  const style = {
    left: `${position * 10}px`, // Adjust based on your editor's character width
    backgroundColor: color,
  };

  return (
    <div className={styles.cursorContainer} style={style}>
      <div className={styles.cursor} />
      <div className={styles.cursorLabel} style={{ backgroundColor: color }}>
        {name}
      </div>
    </div>
  );
};

export default UserCursor;