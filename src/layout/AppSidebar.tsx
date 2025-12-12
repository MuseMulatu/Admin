import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import GridIcon from "../icons/grid.svg";
import UserIcon from "../icons/user-line.svg";
import CarIcon from "../icons/box-line.svg"; // Using box as car placeholder if car icon missing
import DollarIcon from "../icons/dollar-line.svg";
import MapIcon from "../icons/map.svg"; // You might need to add this or use existing

interface SidebarProps {}

const AppSidebar: React.FC<SidebarProps> = () => {
  const { isExpanded, isMobileOpen, setMobileOpen, isHovered, setIsHovered } =
    useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "sub";
    name: string;
  } | null>(null);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen || isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-8 flex justify-center">
        <Link to="/">
           {/* Replace with your logo */}
           {(isExpanded || isMobileOpen || isHovered) ? (
             <h1 className="text-2xl font-bold text-brand-500 dark:text-white">AdminPanel</h1>
           ) : (
             <h1 className="text-2xl font-bold text-brand-500">AP</h1>
           )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            
            {/* Dashboard */}
            <div>
              <Link
                to="/"
                className={`menu-item group ${isActive("/") ? "active" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                   <span className={`menu-icon ${isActive("/") ? "active" : ""}`}>
                      <img src={GridIcon} alt="Dashboard" className="w-5 h-5" />
                   </span>
                   <span className={`text-base font-medium ${(isExpanded || isMobileOpen || isHovered) ? "block" : "hidden"}`}>
                     Dashboard
                   </span>
                </div>
              </Link>
            </div>

            {/* Drivers */}
            <div>
              <Link
                to="/drivers"
                className={`menu-item group ${isActive("/drivers") ? "active" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                   <span className={`menu-icon ${isActive("/drivers") ? "active" : ""}`}>
                      <img src={UserIcon} alt="Drivers" className="w-5 h-5" />
                   </span>
                   <span className={`text-base font-medium ${(isExpanded || isMobileOpen || isHovered) ? "block" : "hidden"}`}>
                     Drivers (Operations)
                   </span>
                </div>
              </Link>
            </div>

            {/* Riders */}
            <div>
              <Link
                to="/riders"
                className={`menu-item group ${isActive("/riders") ? "active" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                   <span className={`menu-icon ${isActive("/riders") ? "active" : ""}`}>
                      <img src={UserIcon} alt="Riders" className="w-5 h-5" />
                   </span>
                   <span className={`text-base font-medium ${(isExpanded || isMobileOpen || isHovered) ? "block" : "hidden"}`}>
                     Riders / Users
                   </span>
                </div>
              </Link>
            </div>

            {/* Rides */}
            <div>
              <Link
                to="/rides"
                className={`menu-item group ${isActive("/rides") ? "active" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                   <span className={`menu-icon ${isActive("/rides") ? "active" : ""}`}>
                      <img src={CarIcon} alt="Rides" className="w-5 h-5" />
                   </span>
                   <span className={`text-base font-medium ${(isExpanded || isMobileOpen || isHovered) ? "block" : "hidden"}`}>
                     Ride Management
                   </span>
                </div>
              </Link>
            </div>

            {/* Financials */}
            <div>
              <Link
                to="/financials"
                className={`menu-item group ${isActive("/financials") ? "active" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                   <span className={`menu-icon ${isActive("/financials") ? "active" : ""}`}>
                      <img src={DollarIcon} alt="Financials" className="w-5 h-5" />
                   </span>
                   <span className={`text-base font-medium ${(isExpanded || isMobileOpen || isHovered) ? "block" : "hidden"}`}>
                     Financial Panel
                   </span>
                </div>
              </Link>
            </div>

            {/* settings */}
            <div>
              <Link
                to="/settings"
                className={`menu-item group ${isActive("/financials") ? "active" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                   <span className={`menu-icon ${isActive("/financials") ? "active" : ""}`}>
                      <img src={DollarIcon} alt="Financials" className="w-5 h-5" />
                   </span>
                   <span className={`text-base font-medium ${(isExpanded || isMobileOpen || isHovered) ? "block" : "hidden"}`}>
                     Settings
                   </span>
                </div>
              </Link>
            </div>

          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;