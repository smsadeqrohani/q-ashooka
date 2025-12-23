import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Home } from "./Home";
import { SignInPage } from "./SignInPage";
import { Dashboard } from "./Dashboard";
import { AdminSetup } from "./AdminSetup";

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/admin-setup" element={<AdminSetup />} />
      </Routes>
      <Toaster />
    </div>
  );
}
