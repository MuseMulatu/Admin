import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Home from "./pages/Dashboard/Home"; 
import Drivers from "./pages/Drivers/Drivers"; 
import Pricing from "./pages/Settings/Pricing"; 
import Rides from "./pages/Rides/Rides"; 
import Riders from "./pages/Riders/Riders"; 
import Financials from "./pages/Financials/Financials"; 
import AdminLogs from "./pages/AuditLogs/AdminLogs";
import AdminSelector from "./components/auth/AdminSelector"; 
import Tickets from './pages/Support/Tickets'

export default function App() {
  return (
    <>
      <AdminSelector /> 
      
      <Routes>
        {/* Auth Layout */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Main App Layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          
          {/* Core Business Pages */}
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/rides" element={<Rides />} />
          <Route path="/logs" element={<AdminLogs />} /> 
          
          {/* Placeholders */}
          <Route path="/riders" element={<Riders />} /> 
          <Route path="/financials" element={<Financials />} />
          <Route path="/settings" element={<Pricing />} />
          <Route path="/tickets" element={ < Tickets />}
        />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}