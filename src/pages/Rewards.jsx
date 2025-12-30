import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRewards } from '../hooks/useRewards';
import RewardCard from '../components/RewardCard';

export default function Rewards() {
  const { rewards, loading: rewardsLoading } = useRewards();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // 1. Fetch Profile Logic
  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('current_points')
        .eq('id', user.id)
        .single();
      if (!error) setProfile(data);
    }
    setProfileLoading(false);
  };

  // --- ADD THIS HERE (The missing function) ---
  const handleEarnPoints = async () => {
    try {
      const { error } = await supabase.rpc('add_points', { amount: 100 });
      if (error) throw error;
      
      // Refresh the points after adding them
      await fetchProfile(); 
    } catch (err) {
      alert("Error: " + err.message);
    }
  };
  // --------------------------------------------

  useEffect(() => {
    fetchProfile();
  }, []);

  if (rewardsLoading || profileLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Rewards</h1>
          <p className="text-blue-600 font-semibold text-lg">
            Balance: {profile?.current_points || 0} Points
          </p>
        </div>
        
        {/* Now this button can find the handleEarnPoints function */}
        <button 
          onClick={handleEarnPoints}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Claim Daily Bonus (+100)
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rewards.map(reward => (
          <RewardCard 
            key={reward.id} 
            reward={reward} 
            userPoints={profile?.current_points || 0}
            onRedeemSuccess={fetchProfile} 
          />
        ))}
      </div>
    </div>
  );
}