import { useEffect, useRef, useState } from 'react';
import { useVideoCall } from '../../hooks/useVideoCall';

function VideoCallComponent({ targetUserId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const localStreamRef = useRef(null);

  const {
    callState,
    remoteUserId,
    callerId,
    startCall,
    acceptCall,
    rejectCall,
    endCall
  } = useVideoCall(localStreamRef);

  // Initialize media stream with configurable video
  const initMediaStream = async (withVideo = true) => {
    try {
      const constraints = {
        audio: true,
        video: withVideo ? { width: 1280, height: 720 } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsVideoEnabled(withVideo);
      return true;
    } catch (err) {
      console.error('Failed to get media stream', err);
      return false;
    }
  };

  // Toggle video during call
  const toggleVideo = async () => {
    if (!localStreamRef.current) return;
    
    try {
      // Stop existing video tracks
      localStreamRef.current.getVideoTracks().forEach(track => track.stop());
      
      if (!isVideoEnabled) {
        // Enable video
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 }
        });
        
        const videoTrack = videoStream.getVideoTracks()[0];
        localStreamRef.current.addTrack(videoTrack);
        
        // Update UI
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }
      
      setIsVideoEnabled(!isVideoEnabled);
    } catch (err) {
      console.error('Error toggling video:', err);
    }
  };

  // Toggle audio mute
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    
    localStreamRef.current.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    
    setIsMuted(!isMuted);
  };

  // Initialize audio when component mounts
  useEffect(() => {
    initMediaStream(false); // Start with audio-only by default
    
    return () => {
      endCall();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle remote stream
  useEffect(() => {
    if (remoteVideoRef.current && callState === 'active') {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [callState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Main video area */}
        <div className="relative bg-black">
          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full ${callState === 'active' ? 'block' : 'hidden'}`}
          />
          
          {/* Call states */}
          {callState === 'idle' && (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-800 text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Ready to Connect</h2>
              <p className="mb-6">Start a conversation with your peer</p>
            </div>
          )}
          
          {callState === 'ringing' && (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-800 text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Incoming Call</h2>
              <p className="text-xl mb-2">From: {callerId}</p>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    if (!isVideoEnabled) initMediaStream(true);
                    acceptCall();
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition"
                >
                  Accept
                </button>
                <button
                  onClick={rejectCall}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
          
          {callState === 'calling' && (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-800 text-white p-6">
              <div className="animate-pulse flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4">Calling...</h2>
                <p className="mb-6">Waiting for {targetUserId} to answer</p>
                <div className="w-12 h-12 border-4 border-t-white border-r-white border-b-white border-l-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          
          {/* Local video (only shown when video is enabled) */}
          {isVideoEnabled && (
            <div className={`absolute bottom-4 right-4 w-1/4 max-w-xs rounded-lg overflow-hidden shadow-lg ${callState === 'active' ? 'block' : 'hidden'}`}>
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
        <div className="bg-gray-50 p-4 flex justify-center items-center gap-4">
          {callState === 'idle' && (
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  await initMediaStream(false);
                  startCall(targetUserId);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1A1.5 1.5 0 016 3.5v1A1.5 1.5 0 014.5 6h-1A1.5 1.5 0 012 4.5v-1zM14 3.5a1.5 1.5 0 011.5-1.5h1a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5h-1a1.5 1.5 0 01-1.5-1.5v-1zM2 15.5a1.5 1.5 0 011.5-1.5h1a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5h-1A1.5 1.5 0 012 16.5v-1zM14 15.5a1.5 1.5 0 011.5-1.5h1a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5h-1a1.5 1.5 0 01-1.5-1.5v-1z" clipRule="evenodd" />
                </svg>
                Audio Call
              </button>
              
              <button
                onClick={async () => {
                  await initMediaStream(true);
                  startCall(targetUserId);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                </svg>
                Video Call
              </button>
            </div>
          )}
          
          {callState === 'active' && (
            <div className="flex gap-3">
              <button
                onClick={toggleMute}
                className={`${isMuted ? 'bg-red-600' : 'bg-gray-600'} hover:bg-gray-700 text-white font-bold p-3 rounded-full transition`}
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={toggleVideo}
                className={`${isVideoEnabled ? 'bg-purple-600' : 'bg-gray-600'} hover:bg-gray-700 text-white font-bold p-3 rounded-full transition`}
              >
                {isVideoEnabled ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 text-white font-bold p-3 rounded-full transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1a1 1 0 10-2 0v8a1 1 0 102 0V6zm-4 0a1 1 0 10-2 0v8a1 1 0 102 0V6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Status bar */}
      <div className="mt-4 text-sm text-gray-600">
        {callState === 'active' && (
          <div className="flex items-center">
            <span className="flex items-center mr-4">
              <span className={`w-3 h-3 rounded-full mr-1 ${isVideoEnabled ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              Camera {isVideoEnabled ? 'On' : 'Off'}
            </span>
            <span className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-1 ${!isMuted ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Mic {isMuted ? 'Muted' : 'On'}
            </span>
          </div>
        )}
        {callState === 'calling' && <p>Calling {targetUserId}...</p>}
      </div>
    </div>
  );
}

export default VideoCallComponent;