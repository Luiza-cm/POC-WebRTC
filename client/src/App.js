import React, { useRef, useLayoutEffect, useContext } from 'react';
import { Typography, AppBar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SocketContexto } from './Contexto';

// import VideoPlayer from './components/VideoPlayer';

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderRadius: 15,
    margin: '30px 100px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '600px',
    border: '2px solid black',

    [theme.breakpoints.down('xs')]: {
      width: '90%',
    },
  },
  video: {
    width: '200px',
  },
  image: {
    marginLeft: '15px',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
}));

const App = () => {
  const classes = useStyles();
  const { myVideo, itemEls, playerList } = useContext(SocketContexto);

  return (
    <div className={classes.wrapper}>
      <AppBar className={classes.appBar} position="static" color="inherit">
        <Typography variant="h2" align="center">Video Chat</Typography>
      </AppBar>
      <video playsInline muted ref={myVideo} autoPlay className={classes.video} />

      { playerList.map((item) => (
        <video
          key={item}
          ref={(element) => itemEls.current[item] = element}
          autoPlay
          className={classes.video}
        />
      ))}
    </div>
  );
};

export default App;
