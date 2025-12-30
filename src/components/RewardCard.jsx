// src/components/RewardCard.jsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function RewardCard({ reward, userPoints, onRedeemSuccess }) {
  const [processing, setProcessing] = useState(false);

  // Check if user has enough points
  const canAfford = userPoints >= reward.points_cost;

  const handleRedeem = async () => {
    // 1. Double Check affordability before even asking
    if (!canAfford) {
      alert("You don't have enough points for this reward.");
      return;
    }

    if (!confirm(`Redeem ${reward.title} for ${reward.points_cost} points?`)) return;

    setProcessing(true);

    try {
      // 2. We use the RPC function to ensure the transaction is Atomic
      const { error } = await supabase.rpc('redeem_reward', { 
        reward_id: reward.id, 
        cost: reward.points_cost 
      });

      if (error) throw error;

      alert("Success! Your reward is on the way.");
      
      // 3. THIS IS KEY: Call the refresh function passed from Rewards.jsx
      if (onRedeemSuccess) {
        onRedeemSuccess();
      }
      
    } catch (error) {
      // Supabase returns the "Insufficient points" message from our SQL here
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full bg-gray-100">
        <img 
          src={reward.image_url} 
          alt={reward.title} 
          className="w-full h-full object-cover" 
        />
        {!canAfford && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
            Need {reward.points_cost - userPoints} more points
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{reward.title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{reward.description}</p>
        
        <div className="mt-auto flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase font-semibold">Cost</span>
            <span className={`font-bold ${canAfford ? 'text-blue-600' : 'text-gray-400'}`}>
              {reward.points_cost} Points
            </span>
          </div>
          
          <button 
            onClick={handleRedeem} 
            disabled={processing || !canAfford}
            className={`px-5 py-2 rounded-lg font-medium transition-colors ${
              processing || !canAfford 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {processing ? 'Processing...' : 'Redeem'}
          </button>
        </div>
      </div>
    </div>
  );
}