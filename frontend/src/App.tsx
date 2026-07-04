import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Search } from "./pages/Search";
import { Kitchen } from "./pages/Kitchen";
import { RestaurantDetail } from "./pages/RestaurantDetail";
import { Reserve } from "./pages/Reserve";
import { OrderFlow } from "./pages/OrderFlow";
import { Payment } from "./pages/Payment";
import { Register } from "./pages/Register";
import { Admin } from "./pages/Admin";
import { useStore } from "./useStore";

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { token, user } = useStore();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/search" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes wrapped in Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/search" replace />} />
          <Route path="search" element={<Search />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="restaurant/:id" element={<RestaurantDetail />} />
          <Route path="restaurant/:id/reserve" element={<Reserve />} />
          <Route path="restaurant/:id/order" element={<OrderFlow />} />
          <Route path="payment" element={<Payment />} />
          <Route path="admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}