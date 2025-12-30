// src/hooks/useRewards.js
import { useEffect, useState } from 'react';
// Make sure this points to where you initialized your client
import { supabase } from '../supabaseClient'; 

export function useRewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Add this inside a useEffect to get the user's balance
const fetchProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('current_points')
      .eq('id', user.id)
      .single();
    setPoints(data.current_points);
  }
};
    async function fetchRewards() {
      try {
        setLoading(true);
        // This queries the 'rewards' table in Supabase
        const { data, error } = await supabase
          .from('rewards')
          .select('*')
          .eq('is_active', true)
          .order('points_cost', { ascending: true });

        if (error) throw error;
        setRewards(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRewards();
  }, []);

  return { rewards, loading, error };
}