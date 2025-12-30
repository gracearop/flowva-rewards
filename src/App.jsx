import {Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

import Auth from './pages/Auth';
import Rewards from './pages/Rewards';
import Navbar from './components/Navbar'; // We'll move the Nav to its own file

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    // <Router>
      <div className="min-h-screen bg-gray-900">
        <Navbar session={session} />
        
        <Routes>
          {/* Public Route */}
          <Route 
            path="/auth" 
            element={!session ? <Auth /> : <Navigate to="/rewards" />} 
          />

          {/* Protected Route */}
          <Route 
            path="/rewards" 
            element={session ? <Rewards /> : <Navigate to="/auth" />} 
          />

          {/* Redirect home to rewards or auth */}
          <Route 
            path="/" 
            element={<Navigate to={session ? "/rewards" : "/auth"} />} 
          />
        </Routes>
      </div>
    // </Router>
  );
}

export default App;