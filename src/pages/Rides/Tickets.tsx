import { useState } from 'react';
import Breadcrumb from '../../components/common/PageBreadCrumb';

// Mock Data
const mockTickets = [
    { id: 'T-101', user: 'Kebede', issue: 'Driver was rude and took a long route.', status: 'OPEN', rideId: 'ride_001' },
    { id: 'T-102', user: 'Almaz', issue: 'I lost my scarf in the car.', status: 'OPEN', rideId: 'ride_005' },
];

const API_BASE = import.meta.env.VITE_API_URL || 'https://app.share-rides.com';

const Tickets = () => {
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);

    const handleAutoDraft = async (ticket: any) => {
        setIsDrafting(true);
        setReplyText(''); // Clear previous
        
        try {
            const response = await fetch(`${API_BASE}/api/ai/draft-response`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: ticket.id,
                    complaintText: ticket.issue,
                    rideDetails: { id: ticket.rideId, driver: "Unknown" } // Pass actual ride details here
                })
            });
            const data = await response.json();
            setReplyText(data.ai_drafted_response || "AI could not generate a response.");
        } catch (err) {
            console.error(err);
            setReplyText("Error connecting to AI.");
        } finally {
            setIsDrafting(false);
        }
    };

    return (
        <>
            <Breadcrumb pageName="Support Tickets" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* List Column */}
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                        <h3 className="font-medium text-black dark:text-white">Active Tickets</h3>
                    </div>
                    <div className="p-4">
                        {mockTickets.map(ticket => (
                            <div 
                                key={ticket.id} 
                                onClick={() => { setSelectedTicket(ticket); setReplyText(''); }}
                                className={`cursor-pointer p-4 mb-2 rounded border ${selectedTicket?.id === ticket.id ? 'border-primary bg-gray-50 dark:bg-meta-4' : 'border-stroke hover:bg-gray-50 dark:border-strokedark'}`}
                            >
                                <div className="flex justify-between">
                                    <span className="font-bold text-black dark:text-white">{ticket.id}</span>
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">{ticket.status}</span>
                                </div>
                                <p className="text-sm mt-1">{ticket.issue}</p>
                                <p className="text-xs text-gray-500 mt-2">User: {ticket.user}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail/Reply Column */}
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    {selectedTicket ? (
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Reply to {selectedTicket.id}</h3>
                            <div className="mb-4 p-4 bg-gray-100 dark:bg-meta-4 rounded text-sm italic">
                                "{selectedTicket.issue}"
                            </div>

                            <div className="mb-4">
                                <label className="mb-2.5 block font-medium text-black dark:text-white">
                                    Response
                                </label>
                                <div className="relative">
                                    <textarea
                                        rows={6}
                                        placeholder="Type your reply..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    ></textarea>
                                    
                                    {/* Auto Draft Button */}
                                    <button
                                        onClick={() => handleAutoDraft(selectedTicket)}
                                        disabled={isDrafting}
                                        className="absolute top-2 right-2 text-xs bg-primary text-white px-3 py-1 rounded-full opacity-80 hover:opacity-100 flex items-center gap-1 transition"
                                    >
                                        {isDrafting ? (
                                            <>Loading...</>
                                        ) : (
                                            <><span>✨</span> Auto-Draft</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray">
                                Send Reply
                            </button>
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center p-6 text-gray-500">
                            Select a ticket to view details
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Tickets;