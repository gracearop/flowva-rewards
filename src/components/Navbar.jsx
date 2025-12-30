import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Navbar({ session }) {
  const handleLogout = () => supabase.auth.signOut();

  return (
    <nav className="bg-blue-300 border-b sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl text-blue-600">
          FLOWVA
        </Link>

        {session && (
          <div className="flex items-center gap-6">
            {/* You could fetch and display points here too! */}
            <Link to="/rewards" className="text-gray-600 hover:text-blue-600 font-medium">
              Rewards
            </Link>
            <button 
              onClick={handleLogout}
              className="bg-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}