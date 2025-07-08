import { useEffect, useRef } from 'react';
import { useVideoCall } from '../../hooks/useVideoCall';

function VideoCallComponent({ targetUserId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  
  const {
    callState,
    remoteUserId,
    callerId,
    startCall,
    acceptCall,
    rejectCall,
    endCall
  } = useVideoCall(localStreamRef);

  // Initialize local stream
  useEffect(() => {
    const initLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 },
          audio: true
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to get local stream', err);
      }
    };

    initLocalStream();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle remote stream
  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Main video area */}
        <div className="relative bg-black">
          {/* Remote video (main) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full ${callState === 'active' ? 'block' : 'hidden'}`}
          />
          
          {/* Call states */}
          {callState === 'idle' && (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-800 text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Ready to call</h2>
              <p className="mb-6">Start a video call with your peer</p>
            </div>
          )}
          
          {callState === 'ringing' && (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-800 text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Incoming Call</h2>
              <p className="text-xl mb-2">From: {callerId}</p>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={acceptCall}
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
          
          {/* Local video (pip) */}
          <div className={`absolute bottom-4 right-4 w-1/4 max-w-xs rounded-lg overflow-hidden shadow-lg ${callState === 'active' ? 'block' : 'hidden'}`}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-gray-50 p-4 flex justify-center items-center gap-4">
          {callState === 'idle' && (
            <button
              onClick={() => startCall(targetUserId)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              </svg>
              Start Video Call
            </button>
          )}
          
          {callState === 'active' && (
            <button
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1a1 1 0 10-2 0v8a1 1 0 102 0V6zm-4 0a1 1 0 10-2 0v8a1 1 0 102 0V6z" clipRule="evenodd" />
              </svg>
              End Call
            </button>
          )}
        </div>
      </div>
      
      {/* Status bar */}
      <div className="mt-4 text-sm text-gray-600">
        {callState === 'active' && (
          <p>Connected with: {remoteUserId} • <span className="text-green-500">Live</span></p>
        )}
        {callState === 'calling' && <p>Calling {targetUserId}...</p>}
      </div>
    </div>
  );
}

export default VideoCallComponent;