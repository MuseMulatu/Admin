export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[90%] max-w-lg">
        {children}
        <button className="mt-4 text-sm text-gray-400" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
