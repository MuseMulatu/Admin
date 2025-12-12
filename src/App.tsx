import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Home from "./pages/Dashboard/Home"; // Updated Home
import Drivers from "./pages/Drivers/Drivers"; // New
import Rides from "./pages/Rides/Rides"; // New
import Pricing from "./pages/Settings/Pricing"; 
// Import other pages as you build them

export default function App() {
  return (
    <Routes>
      {/* Auth Layout */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Main App Layout */}
   <Route element={<AppLayout />}>
  <Route index element={<Home />} />

  {/* Main */}
  <Route path="drivers" element={<Drivers />} />
  <Route path="drivers/:id" element={<Drivers />} />

  <Route path="rides" element={<Rides />} />
  <Route path="rides/:id" element={<Rides />} />

  {/* Secondary */}
  <Route path="riders" element={<Rides />} />
  <Route path="financials" element={<Rides />} />
  <Route path="settings" element={<Pricing />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}