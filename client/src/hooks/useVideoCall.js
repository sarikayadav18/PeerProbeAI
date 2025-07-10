import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export const useVideoCall = (localStreamRef) => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const yourCurrentUserId = storedUser?.id;

  const {
    initiateCall,
    sendSignal,
    subscribeToIncomingCalls,
    subscribeToSignals,
    isConnected
  } = useSocket();

  const [callState, setCallState]       = useState('idle');
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [callerId, setCallerId]         = useState(null);
  const [callError, setCallError]       = useState(null);

  const pcRef              = useRef(null);
  const iceCandidatesRef   = useRef([]);
  const earlyCandidatesRef = useRef([]);
  const remoteUserIdRef    = useRef(null);
  const callerIdRef        = useRef(null);
  const pendingOfferRef    = useRef(null);
  const remoteStreamRef    = useRef(null);
  const callTimeoutRef     = useRef(null);

  useEffect(() => { remoteUserIdRef.current = remoteUserId }, [remoteUserId]);
  useEffect(() => { callerIdRef.current   = callerId   }, [callerId]);

  const createPeerConnection = () => {
    console.log('[useVideoCall] Creating RTCPeerConnection');
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      iceTransportPolicy: 'all'
    });

    pc.onicecandidate = ({ candidate }) => {
      console.log('[useVideoCall] onicecandidate', candidate);
      if (candidate) {
        const target = remoteUserIdRef.current || callerIdRef.current;
        if (target) {
          console.log(`[useVideoCall] Sending ICE to ${target}`);
          sendSignal(target, {
            type: 'ice-candidate',
            senderId: yourCurrentUserId,
            receiverId: target,
            payload: { candidate: candidate.toJSON() }
          });
        } else {
          console.log('[useVideoCall] Queueing early ICE');
          earlyCandidatesRef.current.push(candidate.toJSON());
        }
      }
    };

    pc.ontrack = (ev) => {
      console.log('[useVideoCall] ontrack', ev.streams);
      if (ev.streams?.[0]) remoteStreamRef.current = ev.streams[0];
    };

    pc.onconnectionstatechange = () => {
      console.log('[useVideoCall] connectionState', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log('[useVideoCall] Connection lost');
        setCallError('Connection lost');
        endCall();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[useVideoCall] iceConnectionState', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.log('[useVideoCall] ICE failed');
        setCallError('Connection failed');
        endCall();
      }
    };

    if (localStreamRef.current) {
      console.log('[useVideoCall] Adding local tracks');
      localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current));
    }

    return pc;
  };

  useEffect(() => {
    if (!isConnected) return;
    console.log('[useVideoCall] Subscribing to incoming calls');
    const unsub = subscribeToIncomingCalls(({ callerId: from }) => {
      console.log(`[useVideoCall] Incoming call from ${from}`);
      if (callState !== 'idle') {
        console.log('[useVideoCall] Busy—sending busy');
        sendSignal(from, {
          type: 'call-busy',
          senderId: yourCurrentUserId,
          receiverId: from
        });
        return;
      }
      setCallerId(from);
      setRemoteUserId(from);
      setCallState('ringing');

      callTimeoutRef.current = setTimeout(() => {
        if (callState === 'ringing') {
          console.log('[useVideoCall] Timeout');
          sendSignal(from, {
            type: 'call-timeout',
            senderId: yourCurrentUserId,
            receiverId: from
          });
          endCall();
        }
      }, 45000);
    });
    return () => {
      console.log('[useVideoCall] Unsubscribing incoming calls');
      clearTimeout(callTimeoutRef.current);
      unsub();
    };
  }, [isConnected, callState]);

  useEffect(() => {
    if (!isConnected) return;
    console.log('[useVideoCall] Subscribing to signals');
    const unsub = subscribeToSignals(async (signal) => {
      console.log('[useVideoCall] Signal', signal.type, signal);
      const { type, senderId: from, payload } = signal;
      const rawCand = payload?.candidate;

      switch (type) {
        case 'offer': {
          console.log('[useVideoCall] Offer');
          const o = payload?.offer || signal.offer;
          pendingOfferRef.current = { ...signal, offer: new RTCSessionDescription(o) };
          if (callState === 'ringing' && pcRef.current) {
            await handleOffer(pendingOfferRef.current);
            pendingOfferRef.current = null;
          }
          break;
        }
        case 'answer': {
          console.log('[useVideoCall] Answer');
          const a = payload?.answer || signal.answer;
          await handleAnswer({ answer: new RTCSessionDescription(a) });
          break;
        }
        case 'ice-candidate': {
          console.log('[useVideoCall] ICE');
          if (rawCand) {
            if (!pcRef.current) {
              iceCandidatesRef.current.push(rawCand);
            } else if (pcRef.current.remoteDescription) {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(rawCand));
            } else {
              iceCandidatesRef.current.push(rawCand);
            }
          } else {
            console.log('[useVideoCall] No candidate data');
          }
          break;
        }
        case 'call-rejected':
        case 'call-busy':
        case 'call-timeout': {
          const msg = {
            'call-rejected': 'Call rejected',
            'call-busy':     'User busy',
            'call-timeout':  'No answer'
          }[type];
          console.log(`[useVideoCall] ${msg}`);
          setCallError(msg);
          endCall();
          break;
        }
      }
    });
    return () => {
      console.log('[useVideoCall] Unsubscribing signals');
      unsub();
    };
  }, [isConnected, callState]);

  const handleOffer = async ({ offer, senderId: from }) => {
    console.log('[useVideoCall] handleOffer');
    if (!pcRef.current) return;
    try {
      await pcRef.current.setRemoteDescription(offer);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      console.log('[useVideoCall] Sending answer');
      sendSignal(from, {
        type: 'answer',
        senderId: yourCurrentUserId,
        receiverId: from,
        payload: { answer }
      });
      while (iceCandidatesRef.current.length) {
        const c = iceCandidatesRef.current.shift();
        await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
        console.log('[useVideoCall] Drained ICE');
      }
      setCallState('active');
      clearTimeout(callTimeoutRef.current);
    } catch (e) {
      console.log('[useVideoCall] handleOffer error', e);
      setCallError('Failed to handle offer');
      endCall();
    }
  };

  const handleAnswer = async ({ answer }) => {
    console.log('[useVideoCall] handleAnswer');
    if (!pcRef.current) return;
    try {
      await pcRef.current.setRemoteDescription(answer);
      while (iceCandidatesRef.current.length) {
        const c = iceCandidatesRef.current.shift();
        await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
        console.log('[useVideoCall] Drained ICE');
      }
      setCallState('active');
      clearTimeout(callTimeoutRef.current);
    } catch (e) {
      console.log('[useVideoCall] handleAnswer error', e);
      setCallError('Failed to handle answer');
      endCall();
    }
  };

  const startCall = async (userId) => {
    console.log('[useVideoCall] startCall', userId);
    if (callState !== 'idle') {
      console.log('[useVideoCall] Not idle');
      return;
    }
    try {
      pcRef.current = createPeerConnection();
      const offer = await pcRef.current.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pcRef.current.setLocalDescription(offer);
      console.log('[useVideoCall] Offer ready');

      setRemoteUserId(userId);
      setCallState('calling');
      setCallError(null);

      initiateCall(userId);
      sendSignal(userId, {
        type: 'offer',
        senderId: yourCurrentUserId,
        receiverId: userId,
        payload: { offer }
      });
      console.log('[useVideoCall] Offer sent');

      callTimeoutRef.current = setTimeout(() => {
        if (callState === 'calling') {
          console.log('[useVideoCall] Timeout no answer');
          setCallError('No answer');
          endCall();
        }
      }, 45000);

      earlyCandidatesRef.current.forEach(c => {
        sendSignal(userId, {
          type: 'ice-candidate',
          senderId: yourCurrentUserId,
          receiverId: userId,
          payload: { candidate: c }
        });
        console.log('[useVideoCall] Sent early ICE');
      });
      earlyCandidatesRef.current = [];
    } catch (e) {
      console.log('[useVideoCall] startCall error', e);
      setCallError('Failed to start call');
      endCall();
    }
  };

  const acceptCall = async () => {
    console.log('[useVideoCall] acceptCall');
    if (callState !== 'ringing') {
      console.log('[useVideoCall] Not ringing');
      return;
    }
    try {
      pcRef.current = createPeerConnection();
      if (pendingOfferRef.current) {
        await handleOffer(pendingOfferRef.current);
        pendingOfferRef.current = null;
      }
    } catch (e) {
      console.log('[useVideoCall] acceptCall error', e);
      setCallError('Failed to accept call');
      endCall();
    }
  };

  const rejectCall = () => {
    console.log('[useVideoCall] rejectCall');
    if (callState !== 'ringing') {
      console.log('[useVideoCall] Not ringing');
      return;
    }
    sendSignal(callerIdRef.current, {
      type: 'call-rejected',
      senderId: yourCurrentUserId,
      receiverId: callerIdRef.current
    });
    endCall();
  };

  const endCall = () => {
    console.log('[useVideoCall] endCall');
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
      console.log('[useVideoCall] PC closed');
    }
    clearTimeout(callTimeoutRef.current);
    iceCandidatesRef.current   = [];
    earlyCandidatesRef.current = [];
    pendingOfferRef.current    = null;

    setCallState('idle');
    setRemoteUserId(null);
    setCallerId(null);
    setCallError(null);
  };

  return {
    callState,
    remoteUserId,
    callerId,
    remoteStreamRef,
    callError,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    isConnected
  };
};
