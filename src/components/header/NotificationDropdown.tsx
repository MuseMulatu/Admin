import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import axios from "axios";

// --- MOCK DATA FOR DEMO ---
const TICKETS = [
  {
    id: 1,
    user: "Sarah Jenkins",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    issue: "Driver was rude & late",
    text: "The driver arrived 15 mins late and refused to turn on the AC. I want a refund.",
    time: "10m ago",
    details: { rideId: "#8821", driver: "Michael T.", cost: "$12.50" }
  },
  {
    id: 2,
    user: "David Bekele",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    issue: "Charged twice",
    text: "I see two charges on my card for the trip to Bole Airport. Please fix this.",
    time: "1h ago",
    details: { rideId: "#9942", driver: "Abebe K.", cost: "$24.00" }
  }
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(TICKETS.length);
  
  // State for the "Active Ticket" view
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  function toggleDropdown() {
    setIsOpen(!isOpen);
    // Reset views when closing/opening
    if (!isOpen) {
        setActiveTicket(null);
        setSendStatus('idle');
    }
  }

  // --- AI HANDLER ---
  const handleGenerateDraft = async () => {
    if (!activeTicket) return;
    
    setIsGenerating(true);
    setDraft(""); // Clear previous

    try {
      // Hit your backend
      const res = await axios.post('http://localhost:5000/api/ai/draft-response', {
        ticketId: activeTicket.id,
        rideDetails: activeTicket.details,
        complaintText: activeTicket.text
      });

      // Simulate typing effect or just set it
      setDraft(res.data.ai_drafted_response || "AI Service Unavailable.");
    } catch (error) {
      console.error(error);
      setDraft("Error connecting to AI. Please draft manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    setSendStatus('sending');
    setTimeout(() => {
        setSendStatus('sent');
        // Remove ticket from list after "sending"
        setTimeout(() => {
            setActiveTicket(null);
            setSendStatus('idle');
            setUnreadCount(prev => Math.max(0, prev - 1));
        }, 1500);
    }, 1000);
  };

  return (
    <div className="relative">
      {/* --- TOGGLE BUTTON (Support Icon) --- */}
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-brand-500 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        <span className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-red-500 ${unreadCount === 0 ? "hidden" : "flex"}`}>
          <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        
        {/* Life Buoy / Support Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" x2="9.17" y1="4.93" y2="9.17"/><line x1="14.83" x2="19.07" y1="14.83" y2="19.07"/><line x1="14.83" x2="19.07" y1="9.17" y2="4.93"/><line x1="14.83" x2="9.17" y1="19.07" y2="14.83"/>
        </svg>
      </button>

      {/* --- DROPDOWN CONTENT --- */}
      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="absolute right-0 mt-2.5 w-80 sm:w-96 translate-y-2">
        
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-2xl">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                {activeTicket ? "Ticket #"+activeTicket.details.rideId : "Support Inbox"}
            </h3>
            {activeTicket && (
                <button onClick={() => setActiveTicket(null)} className="text-xs text-gray-500 hover:text-brand-500">
                    ← Back
                </button>
            )}
        </div>

        {/* --- VIEW 1: TICKET LIST --- */}
        {!activeTicket && (
            <div className="max-h-[400px] overflow-y-auto">
                {TICKETS.map(ticket => (
                    <div 
                        key={ticket.id} 
                        onClick={() => setActiveTicket(ticket)}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-colors"
                    >
                        <div className="flex items-start gap-3">
                            <img src={ticket.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-200" />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{ticket.user}</h4>
                                    <span className="text-[10px] text-gray-400">{ticket.time}</span>
                                </div>
                                <p className="text-xs font-medium text-red-500 mb-1">{ticket.issue}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{ticket.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {TICKETS.length === 0 && <div className="p-4 text-center text-gray-500 text-xs">No pending tickets</div>}
            </div>
        )}

        {/* --- VIEW 2: ACTIVE TICKET & AI DRAFT --- */}
        {activeTicket && (
            <div className="p-4">
                {/* User Complaint Bubble */}
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none mb-4 text-xs text-gray-700 dark:text-gray-300">
                    <p className="font-bold mb-1">{activeTicket.user} wrote:</p>
                    "{activeTicket.text}"
                </div>

                {/* AI Controls */}
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Response Draft</label>
                        <button 
                            onClick={handleGenerateDraft}
                            disabled={isGenerating || sendStatus !== 'idle'}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-lg shadow-md transition-all disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"/>
                            ) : (
                                <span>✨</span>
                            )}
                            {isGenerating ? "Drafting..." : "AI Auto-Reply"}
                        </button>
                    </div>
                    
                    <textarea 
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Click 'AI Auto-Reply' to generate a polite response..."
                        className="w-full h-32 p-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    />
                </div>

                {/* Send Action */}
                <button 
                    onClick={handleSend}
                    disabled={!draft || sendStatus !== 'idle'}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg ${
                        sendStatus === 'sent' 
                        ? 'bg-green-500' 
                        : 'bg-brand-500 hover:bg-brand-600'
                    } disabled:opacity-50`}
                >
                    {sendStatus === 'idle' && "Send Response"}
                    {sendStatus === 'sending' && "Sending..."}
                    {sendStatus === 'sent' && "✅ Sent Successfully!"}
                </button>
            </div>
        )}

      </Dropdown>
    </div>
  );
}