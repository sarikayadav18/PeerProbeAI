import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export const useVideoCall = (localStreamRef) => {
  const {
    initiateCall,
    sendSignal,
    subscribeToIncomingCalls,
    subscribeToSignals,
    isConnected
  } = useSocket();

  const [callState, setCallState] = useState('idle'); // 'idle', 'calling', 'ringing', 'active', 'ended'
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [callerId, setCallerId] = useState(null);
  const pcRef = useRef(null);
  const iceCandidatesRef = useRef([]);

  // Initialize peer connection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add your TURN servers here if needed
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(remoteUserId || callerId, {
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        // You would typically set this remote stream to a state or ref
        // that your video component can use
        console.log('Received remote stream', event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    // Add local stream if available
    if (localStreamRef?.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    return pc;
  };

  // Handle incoming call
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribeToIncomingCalls((callRequest) => {
      if (callState !== 'idle') return; // Already in a call

      setCallerId(callRequest.callerId);
      setRemoteUserId(callRequest.callerId);
      setCallState('ringing');
    });

    return unsubscribe;
  }, [isConnected, callState, subscribeToIncomingCalls]);

  // Handle signaling messages
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribeToSignals((signal) => {
      if (!pcRef.current) {
        if (signal.type === 'offer' && callState === 'ringing') {
          // We're the callee receiving an offer
          pcRef.current = createPeerConnection();
          handleOffer(signal);
        }
        return;
      }

      switch (signal.type) {
        case 'offer':
          handleOffer(signal);
          break;
        case 'answer':
          handleAnswer(signal);
          break;
        case 'ice-candidate':
          handleIceCandidate(signal);
          break;
        default:
          console.warn('Unknown signal type:', signal.type);
      }
    });

    return unsubscribe;
  }, [isConnected, callState, subscribeToSignals]);

  const handleOffer = async (signal) => {
    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      sendSignal(remoteUserId || callerId, {
        type: 'answer',
        answer: answer
      });

      setCallState('active');
    } catch (err) {
      console.error('Error handling offer:', err);
      endCall();
    }
  };

  const handleAnswer = async (signal) => {
    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.answer));
      setCallState('active');
    } catch (err) {
      console.error('Error handling answer:', err);
      endCall();
    }
  };

  const handleIceCandidate = async (signal) => {
    try {
      if (pcRef.current.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
      } else {
        iceCandidatesRef.current.push(signal.candidate);
      }
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  };

  const startCall = async (userId) => {
    if (callState !== 'idle') return;

    setRemoteUserId(userId);
    setCallState('calling');

    try {
      pcRef.current = createPeerConnection();
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      initiateCall(userId);
      sendSignal(userId, {
        type: 'offer',
        offer: offer
      });
    } catch (err) {
      console.error('Error starting call:', err);
      endCall();
    }
  };

  const acceptCall = () => {
    if (callState !== 'ringing') return;
    // The actual acceptance happens in the signal handler when we respond to the offer
  };

  const rejectCall = () => {
    if (callState !== 'ringing') return;
    sendSignal(callerId, { type: 'call-rejected' });
    endCall();
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    iceCandidatesRef.current = [];
    setCallState('idle');
    setRemoteUserId(null);
    setCallerId(null);
  };

  return {
    callState,
    remoteUserId,
    callerId,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    isConnected
  };
};