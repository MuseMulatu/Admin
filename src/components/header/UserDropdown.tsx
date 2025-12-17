import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useAdminStore } from "../../store/useAdminStore"; // Import the store
import UserIcon from "../../icons/user-circle.svg"; // Fallback icon
import SettingsIcon from "../../icons/plug-in.svg"; // Using plug-in icon for settings or similar
import LogoutIcon from "../../icons/arrow-right.svg"; // Using arrow for logout or similar
import ChevronDown from "../../icons/chevron-down.svg";

export default function UserDropdown() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);
  const navigate = useNavigate(); // Hook for navigation

  // Connect to the Admin Store
  const { currentAdmin, logout } = useAdminStore();

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const handleLogout = () => {
      logout(); // Clear session in store
      setDropdownOpen(false);
      // The AdminSelector in App.tsx will automatically show up when isAuthenticated becomes false
      navigate("/"); // Go to home, but the modal will overlay everything
  };

  return (
    <div className="relative">
      <Link
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {currentAdmin?.name || "Guest User"}
          </span>
          <span className="block text-xs font-medium">
            {currentAdmin?.role?.replace("_", " ") || "Read Only"}
          </span>
        </span>

        <span className="h-11 w-11 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
          <img
            src={currentAdmin?.avatar || UserIcon} // Use store avatar or fallback
            alt="User"
            className="h-full w-full object-cover"
            onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLImageElement).src = UserIcon;
            }}
          />
        </span>
        
        <img src={ChevronDown} alt="" className={`hidden sm:block w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </Link>

      {/* Dropdown Start */}
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${
          dropdownOpen === true ? "block" : "hidden"
        }`}
      >
        <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
          
          {/* Profile / My Account */}
          <li>
            <Link
              to="/settings" // Changed to point to settings since we don't have a separate profile page yet
              className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-brand-500 lg:text-base"
              onClick={() => setDropdownOpen(false)}
            >
              <img src={UserIcon} alt="" className="w-5 h-5" />
              My Profile
            </Link>
          </li>

          {/* Account Settings */}
          <li>
            <Link
              to="/settings"
              className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-brand-500 lg:text-base"
              onClick={() => setDropdownOpen(false)}
            >
              <img src={SettingsIcon} alt="" className="w-5 h-5" />
              Account Settings
            </Link>
          </li>
        </ul>
        
        {/* Logout Button */}
        <button
          className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-brand-500 lg:text-base text-left w-full"
          onClick={handleLogout}
        >
          <img src={LogoutIcon} alt="" className="w-5 h-5 rotate-180" /> {/* Rotating arrow to look like exit */}
          Log Out
        </button>
      </div>
      {/* Dropdown End */}
    </div>
  );
}