import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-6">
            Welcome to <span className="text-blue-600">PeerProbeAI</span>
          </h1>
          
          <div className="text-center">
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              PeerProbeAI is a platform for peer assessment and collaboration.
              {currentUser ? (
                <span className="block mt-2 font-medium text-blue-700">You are logged in as {currentUser.name}.</span>
              ) : (
                <span className="block mt-2 font-medium text-gray-700">Join us to start evaluating your peers and improve together.</span>
              )}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              {currentUser ? (
                <Link 
                  to="/dashboard" 
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-8 py-3 bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600 font-medium rounded-lg shadow-sm transition duration-300 transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Optional decorative elements */}
      <div className="absolute bottom-4 right-4 text-sm text-gray-500">
        PeerProbeAI © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default Home;