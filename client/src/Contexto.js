import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContexto = createContext();

const socket = io('http://localhost:5000');

const ContextoProvider = ({ children }) => {
  const [me, setMe] = useState('');
  const [playerList, setPlayerList] = useState([]);
  const [stream, setStream] = useState();
  const [isInitiator, setIsInitiator] = useState(true);

  const myVideo = useRef();
  const itemEls = useRef({});
  const connectionRefs = useRef({});

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);

        myVideo.current.srcObject = currentStream;

        socket.on('criarChamada', ({ from, signal }) => {
          console.log(`recebendo chamada de ${from}`);
    
          const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });
    
          peer.on('signal', (data) => {
            socket.emit('responderChamada', { signal: data, to: from, from: socket.id });
          });
    
          peer.signal(signal);
    
          peer.on('stream', (currentStream2) => {
            itemEls.current[from].srcObject = currentStream2;
          });

          connectionRefs.current[from] = peer;

        });
      });

    socket.on('me', (id) => {
      setMe(id);
      console.log(`meu id: ${id}`);
    });
    socket.on('playerList', (list) => {
      setPlayerList(list.filter((p) => p !== socket.id));
      console.log(`atualizando list ${JSON.stringify(list)}`);
    });

    socket.on('chamadaAceita', ({signal, from}) => {  
      console.log(`${from} aceitou a chamada`);
      connectionRefs.current[from].signal(signal);

      connectionRefs.current[from].on('stream', (currentStream) => {
        itemEls.current[from].srcObject = currentStream;
      });
    });

    socket.on('callEnded', ({ from }) => {
      connectionRefs.current[from].destroy();
      setPlayerList((list) => list.filter((p) => p !== from));
    });

  }, []);

  useEffect(() => {
    if (!stream || !isInitiator) return;

    console.log(`ligando para ${JSON.stringify(playerList)}`);

    playerList.forEach((player) => {
      const peer = new Peer({ initiator: true, trickle: false, stream });

      peer.on('signal', (data) => {
        socket.emit('criarChamada', { userToCall: player, signalData: data, from: me });
      });

      peer.on('stream', (currentStream) => {
        console.log('stream')
        itemEls.current[player].srcObject = currentStream;
      });

      peer.on('error', (error) => {
        console.error(error);
      });
      console.log(`connection ref ${player} created`)

      connectionRefs.current[player] = peer;
    });
    setIsInitiator(false);
  }, [playerList.length, stream, isInitiator]);


  return (
    <SocketContexto.Provider value={{
      myVideo,
      itemEls,
      playerList
    }}
    >
      {children}
    </SocketContexto.Provider>
  );
};

export { ContextoProvider, SocketContexto };
