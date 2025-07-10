import { useEffect, useRef, useState } from 'react';
import { useVideoCall } from '../../hooks/useVideoCall';

function VideoCallComponent({ targetUserId, currentUserId }) {
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMuted, setIsMuted]           = useState(false);
  const [callType, setCallType]         = useState(null); // 'audio' or 'video'

  const {
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
  } = useVideoCall(localStreamRef);

  // Get media stream (audio-only or audio+video)
  const getMediaStream = async (includeVideo = false) => {
    console.log(`[VideoCall] Getting media stream – video: ${includeVideo}`);
    const constraints = {
      audio: true,
      video: includeVideo ? { width: 1280, height: 720 } : false
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = includeVideo ? stream : null;
    }
    setIsVideoEnabled(includeVideo);
    setIsMuted(false);
    return stream;
  };

  // Start audio or video call
  const startAudioCall = async () => {
    console.log('[VideoCall] Starting audio call');
    setCallType('audio');
    await getMediaStream(false);
    startCall(targetUserId);
  };

  const startVideoCall = async () => {
    console.log('[VideoCall] Starting video call');
    setCallType('video');
    await getMediaStream(true);
    startCall(targetUserId);
  };

  // Accept incoming
  const handleAcceptCall = async () => {
    console.log('[VideoCall] Accepting incoming call');
    await getMediaStream(false);
    await acceptCall();
  };

  // Toggle video on/off mid-call
  const toggleVideo = async () => {
    if (!localStreamRef.current) return;
    if (isVideoEnabled) {
      console.log('[VideoCall] Disabling video');
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.stop();
        localStreamRef.current.removeTrack(track);
      });
      localVideoRef.current && (localVideoRef.current.srcObject = null);
      setIsVideoEnabled(false);
    } else {
      console.log('[VideoCall] Enabling video');
      const vs = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      const vt = vs.getVideoTracks()[0];
      localStreamRef.current.addTrack(vt);
      localVideoRef.current && (localVideoRef.current.srcObject = localStreamRef.current);
      setIsVideoEnabled(true);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    console.log(`[VideoCall] Toggling mute – currently ${isMuted ? 'muted' : 'unmuted'}`);
    localStreamRef.current.getAudioTracks().forEach(t => t.enabled = isMuted);
    setIsMuted(!isMuted);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[VideoCall] Cleaning up component');
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      endCall();
    };
  }, []);

  // Attach remote stream when active
  useEffect(() => {
    console.log(`[VideoCall] callState changed: ${callState}`);
    if (callState === 'active' && remoteStreamRef.current && remoteVideoRef.current) {
      console.log('[VideoCall] Attaching remote stream');
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    } else if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [callState, remoteStreamRef.current]);

  // Log errors
  useEffect(() => {
    if (callError) {
      console.error('[VideoCall] Error:', callError);
    }
  }, [callError]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="relative bg-black h-96">
          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full ${callState === 'active' ? 'block' : 'hidden'}`}
          />

          {/* Idle state */}
          {callState === 'idle' && (
            <div className="flex flex-col items-center justify-center h-full text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Ready to Connect</h2>
              <div className="flex gap-4">
                <button onClick={startAudioCall}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full">
                  Audio Call
                </button>
                <button onClick={startVideoCall}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full">
                  Video Call
                </button>
              </div>
            </div>
          )}

          {/* Ringing */}
          {callState === 'ringing' && (
            <div className="flex flex-col items-center justify-center h-full text-white p-6">
              <h2 className="text-2xl font-bold mb-2">
                {callerId === currentUserId ? 'Calling...' : 'Incoming Call'}
              </h2>
              <p className="mb-4">From: {callerId}</p>
              <div className="flex gap-4">
                {callerId !== currentUserId && (
                  <button onClick={handleAcceptCall}
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-full">
                    Accept
                  </button>
                )}
                <button onClick={rejectCall}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-full">
                  {callerId === currentUserId ? 'Cancel' : 'Reject'}
                </button>
              </div>
            </div>
          )}

          {/* Calling */}
          {callState === 'calling' && (
            <div className="flex flex-col items-center justify-center h-full text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Calling...</h2>
              <p className="mb-4">Waiting for {targetUserId}</p>
              <button onClick={endCall}
                      className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-full">
                Cancel
              </button>
            </div>
          )}

          {/* Local preview */}
          {isVideoEnabled && callState === 'active' && (
            <div className="absolute bottom-4 right-4 w-1/4 bg-black rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-50 p-4 flex justify-center gap-4">
          {callState === 'active' && (
            <>
              <button onClick={toggleMute}
                      className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-600'} text-white`}>
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button onClick={toggleVideo}
                      className={`p-3 rounded-full ${isVideoEnabled ? 'bg-purple-600' : 'bg-gray-600'} text-white`}>
                {isVideoEnabled ? 'Turn Video Off' : 'Turn Video On'}
              </button>
              <button onClick={endCall}
                      className="p-3 rounded-full bg-red-600 text-white">
                End Call
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 text-gray-600">
        {callState === 'active' && (
          <div className="flex gap-4">
            <span>Camera: {isVideoEnabled ? 'On' : 'Off'}</span>
            <span>Mic: {isMuted ? 'Muted' : 'On'}</span>
          </div>
        )}
        {callError && <p className="text-red-500 mt-2">{callError}</p>}
      </div>
    </div>
  );
}

export default VideoCallComponent;
