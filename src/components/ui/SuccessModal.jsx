import React from 'react';

export default function SuccessModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-sans animate-in fade-in duration-300">
      <div className="relative w-full max-w-[450px] bg-white rounded-[32px] shadow-2xl flex flex-col items-center justify-center p-12 text-center pb-14">

        {/* Main Illustration Area */}
        <div className="relative w-64 h-64 mb-6 flex items-center justify-center">

          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">

            {/* Particles (Burst/Pop) */}
            <g className="origin-center animate-[particlesPop_0.5s_cubic-bezier(0.17,0.89,0.32,1.2)_0.2s_forwards] opacity-0 scale-50">
              {/* Top left giant solid circle */}
              <circle cx="85" cy="30" r="4" fill="#BBF7D0" />
              {/* Far top left hollow circle */}
              <circle cx="50" cy="65" r="4" fill="none" stroke="#86EFAC" strokeWidth="1.5" />
              {/* Top right star */}
              <path d="M140 25 L142 32 L149 34 L142 36 L140 43 L138 36 L131 34 L138 32 Z" fill="#22C55E" />
              {/* Top right solid light circle */}
              <circle cx="155" cy="53" r="3" fill="#BBF7D0" />
              {/* Far right small solid dark circle */}
              <circle cx="170" cy="73" r="2" fill="#22C55E" />
              {/* Left cross */}
              <path d="M48 105 L54 111 M54 105 L48 111" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
              {/* Right giant cross */}
              <path d="M165 75 L173 83 M173 75 L165 83" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
              {/* Right hollow circle below cross */}
              <circle cx="155" cy="94" r="3.5" fill="none" stroke="#86EFAC" strokeWidth="1.5" />
              {/* Right solid light circle bottom */}
              <circle cx="170" cy="115" r="2.5" fill="#BBF7D0" />
              {/* Bottom left light circle */}
              <circle cx="65" cy="120" r="2" fill="#BBF7D0" />
            </g>

            {/* Envelope Drop Shadow (Pulses as envelope lands) */}
            <ellipse cx="100" cy="175" rx="35" ry="5" fill="#b0b4b8" fillOpacity="0" className="origin-center animate-[shadowPulse_0.6s_ease-out_forwards]" />

            {/* Main Envelope Group (Drops from top and squashes naturally) */}
            <g className="animate-[envelopeDrop_0.6s_cubic-bezier(0.2,0.8,0.2,1)_forwards] opacity-0 origin-bottom">

              {/* Back Tab */}
              <path d="M85 85 C85 75 115 75 115 85" fill="#D1D5DB" />

              {/* Inside Back Panel */}
              <path d="M40 85 L160 85 L160 155 C160 160 156 163 151 163 L49 163 C44 163 40 160 40 155 Z" fill="#E5E7EB" />

              {/* Animated Success Card (Shoots Up Bouncily) */}
              <g className="animate-[cardShootUp_0.6s_cubic-bezier(0.17,0.89,0.32,1.2)_0.3s_forwards] translate-y-[35px]">
                {/* Add this wrapper to slide the whole card up by 15 pixels */}
                <g transform="translate(0, -35)">
                  {/* Outer Card */}
                  <rect x="48" y="60" width="104" height="85" rx="6" fill="#4ADE80" stroke="#10B981" strokeWidth="2" />
                  {/* Inner Darker Card */}
                  <rect x="53" y="66" width="94" height="73" rx="4" fill="#22C55E" />
                  {/* Checkmark (Draws self swiftly) */}
                  <path d="M80 98 L93 111 L123 75" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                    className="animate-[drawCheck_0.4s_ease-out_0.6s_forwards]" strokeDasharray="70" strokeDashoffset="70" />
                </g> {/* Don't forget to close the wrapper here! */}
              </g>


              {/* Front Envelope Panel */}
              <path d="M40 85 L100 130 L160 85 V155 C160 160 156 163 151 163 H49 C44 163 40 160 40 155 Z" fill="#F4F4F5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinejoin="round" />

              {/* Front Envelope Diagonal Fold Lines */}
              <path d="M40 163 L100 130" stroke="#9CA3AF" strokeWidth="1.5" />
              <path d="M160 163 L100 130" stroke="#9CA3AF" strokeWidth="1.5" />

            </g>
          </svg>
        </div>

        {/* Text Content */}
        <h2 className="text-[#374151] text-2xl font-bold mb-10 px-4 leading-relaxed">
          Thank you for emailing, we'll respond to you soon!
        </h2>

        {/* Button */}
        <button
          onClick={onClose}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white font-[Roboto] font-semibold py-3.5 px-12 rounded-xl transition-all shadow-[0_8px_20px_rgba(242,29,47,0.3)] active:scale-95 text-lg"
        >
          Close
        </button>
      </div>

      {/* --- STYLES --- */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes envelopeDrop {
          0% { transform: translateY(-40px) scale(0.95); opacity: 0; }
          40% { transform: translateY(5px) scale(1.02); opacity: 1; }
          70% { transform: translateY(-3px) scale(0.99); opacity: 1; }
          100% { transform: translateY(0px) scale(1); opacity: 1; }
        }
        
        @keyframes cardShootUp {
          0% { transform: translateY(25px); opacity: 0; }
          20% { transform: translateY(25px); opacity: 1; }
          60% { transform: translateY(-4px); opacity: 1; }
          80% { transform: translateY(2px); opacity: 1; }
          100% { transform: translateY(0px); opacity: 1; }
        }

        
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }

        @keyframes particlesPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes shadowPulse {
          0% { transform: scale(0.5); opacity: 0; }
          40% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes zoomIn { 
          from { opacity: 0; transform: scale(0.9); } 
          to { opacity: 1; transform: scale(1); } 
        }

        .animate-zoomIn {
          animation: zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}
