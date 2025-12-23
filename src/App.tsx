import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Home } from "./Home";
import { SignInPage } from "./SignInPage";
import { Dashboard } from "./Dashboard";
import { AdminSetup } from "./AdminSetup";
import { ProductDetail } from "./ProductDetail";
import { Cart } from "./Cart";
import { Checkout } from "./Checkout";
import { UserProfile } from "./UserProfile";
import { OrderDetail } from "./OrderDetail";

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/admin-setup" element={<AdminSetup />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/order/:id" element={<OrderDetail />} />
      </Routes>
      <Toaster />
    </div>
  );
}
