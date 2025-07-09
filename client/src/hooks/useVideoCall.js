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

  const [callState, setCallState] = useState('idle');
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [callerId, setCallerId] = useState(null);
  
  const pcRef = useRef(null);
  const iceCandidatesRef = useRef([]);
  const earlyCandidatesRef = useRef([]);
  const remoteUserIdRef = useRef(null);
  const callerIdRef = useRef(null);

  // Sync refs with state
  useEffect(() => {
    remoteUserIdRef.current = remoteUserId;
  }, [remoteUserId]);

  useEffect(() => {
    callerIdRef.current = callerId;
  }, [callerId]);

  // Initialize peer connection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers here if needed
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const targetId = remoteUserIdRef.current || callerIdRef.current;
        
        if (targetId) {
          // Send queued candidates first
          if (earlyCandidatesRef.current.length > 0) {
            earlyCandidatesRef.current.forEach(candidate => {
              sendSignal(targetId, {
                type: 'ice-candidate',
                candidate: candidate
              });
            });
            earlyCandidatesRef.current = [];
          }
          
          // Send current candidate
          sendSignal(targetId, {
            type: 'ice-candidate',
            candidate: event.candidate
          });
        } else {
          // Store candidate until we have a target ID
          earlyCandidatesRef.current.push(event.candidate);
          console.debug('ICE candidate queued - no target peer yet');
        }
      }
    };

    pc.ontrack = (event) => {
      if (event.streams?.[0]) {
        console.log('Received remote stream', event.streams[0]);
        // Set remote stream to state/ref for your video component
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || 
          pc.connectionState === 'failed') {
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
      if (callState !== 'idle') return;

      setCallerId(callRequest.callerId);
      setRemoteUserId(callRequest.callerId);
      callerIdRef.current = callRequest.callerId;
      remoteUserIdRef.current = callRequest.callerId;
      
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
          // Don't create PC here - wait for acceptCall
          return;
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
        case 'call-rejected':
          if (callState === 'calling') {
            endCall();
          }
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

      sendSignal(remoteUserIdRef.current, {
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
      
      // Process any queued ICE candidates
      if (iceCandidatesRef.current.length > 0) {
        iceCandidatesRef.current.forEach(async candidate => {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn('Error adding queued ICE candidate:', e);
          }
        });
        iceCandidatesRef.current = [];
      }
      
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

    try {
      pcRef.current = createPeerConnection();
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      
      setRemoteUserId(userId);
      remoteUserIdRef.current = userId;
      setCallState('calling');
      
      initiateCall(userId);
      sendSignal(userId, {
        type: 'offer',
        offer: offer
      });
      
      if (earlyCandidatesRef.current.length > 0) {
        earlyCandidatesRef.current.forEach(candidate => {
          sendSignal(userId, {
            type: 'ice-candidate',
            candidate: candidate
          });
        });
        earlyCandidatesRef.current = [];
      }
    } catch (err) {
      console.error('Error starting call:', err);
      endCall();
    }
  };

  const acceptCall = async () => {
    if (callState !== 'ringing') return;

    try {
      // Create peer connection when call is accepted
      pcRef.current = createPeerConnection();
      
      // Get the offer from the caller (stored in state or need to be passed)
      // This assumes the offer is already received and stored somewhere
      // In a real implementation, you might need to modify this
      const offer = await getPendingOffer(); // You'll need to implement this
      
      if (!offer) {
        throw new Error('No offer found to accept');
      }
      
      await handleOffer(offer);
      setCallState('active');
    } catch (err) {
      console.error('Error accepting call:', err);
      endCall();
    }
  };

  const rejectCall = () => {
    if (callState !== 'ringing') return;
    sendSignal(callerIdRef.current, { type: 'call-rejected' });
    endCall();
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    iceCandidatesRef.current = [];
    earlyCandidatesRef.current = [];
    setCallState('idle');
    setRemoteUserId(null);
    remoteUserIdRef.current = null;
    setCallerId(null);
    callerIdRef.current = null;
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