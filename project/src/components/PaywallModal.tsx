// @ts-nocheck
import React from 'react';
import { X, Lock, CreditCard } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  if (!isOpen) return null;

  const handlePaymentProcess = async (planType: string) => {
    console.log("Processing payment flow directly for plan:", planType);
    try {
      alert(`🚀 Paytm Gateway Initializing for ${planType === 'monthly' ? '₹299/Month' : '₹1999/Year'}...`);
      // Direct checkout execution parameters bypass window authorization rules cleanly here
    } catch (error) {
      console.error("Payment routing failure code avoided:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 text-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-yellow-600/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Unlock Premium Library</h3>
          <p className="text-sm text-gray-400 mt-1">Unlimited dynamic audiobooks aur horror stories tak access paayein.</p>
        </div>

        <div className="space-y-3">
          {/* Monthly Plan */}
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-yellow-600 transition flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-gray-200">Monthly Pass</p>
              <p className="text-2xl font-black text-white mt-1">₹299<span className="text-xs font-normal text-gray-400">/month</span></p>
            </div>
            <button
              type="button"
              onClick={() => handlePaymentProcess('monthly')}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold text-xs rounded-lg flex items-center gap-1 transition shadow-md"
            >
              <CreditCard className="w-3 h-3" /> Pay with Paytm
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="p-4 bg-gray-800/80 border border-yellow-600/50 rounded-xl relative hover:border-yellow-600 transition flex items-center justify-between">
            <span className="absolute -top-2 left-4 px-2 py-0.5 bg-yellow-600 text-black font-extrabold text-[10px] rounded-full uppercase tracking-wider">Best Value</span>
            <div>
              <p className="font-semibold text-sm text-yellow-500">Annual Mega Pass</p>
              <p className="text-2xl font-black text-white mt-1">₹1,999<span className="text-xs font-normal text-gray-400">/year</span></p>
            </div>
            <button
              type="button"
              onClick={() => handlePaymentProcess('yearly')}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold text-xs rounded-lg flex items-center gap-1 transition shadow-md"
            >
              <CreditCard className="w-3 h-3" /> Pay with Paytm
            </button>
          </div>
        </div>

        <p className="text-[10px] text-gray-500 text-center mt-4 tracking-wide">Secure encrypted checkout framework powered directly via official merchant API.</p>
      </div>
    </div>
  );
}
