import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, ShoppingCart, RefreshCcw, Box } from 'lucide-react';
import './index.css';
import PartyMaster from './pages/PartyMaster';
import ItemMaster from './pages/ItemMaster';
import SalesBill from './pages/SalesBill';
import Dashboard from './pages/Dashboard';
import PurchaseBill from './pages/PurchaseBill';
import PurchaseList from './pages/PurchaseList';
import Returns from './pages/Returns';
import StockReport from './pages/StockReport';
import LoginPage from './pages/LoginPage';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`p-ripple no-underline flex align-items-center p-3 text-color hover:surface-100 transition-colors transition-duration-150 cursor-pointer ${isActive ? 'surface-100 border-left-3 border-primary' : ''}`} style={{ borderLeft: isActive ? '4px solid var(--primary-color)' : '4px solid transparent' }}>
      <Icon size={20} className="mr-2" color={isActive ? 'var(--primary-color)' : '#666'} />
      <span className="font-medium" style={{ color: isActive ? 'var(--primary-color)' : '#495057' }}>{label}</span>
      {/* <Ripple /> */}
    </Link>
  );
};

const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage setAuth={setIsAuthenticated} />
        } />

        <Route path="/*" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <div className="flex h-screen surface-ground">
              {/* Sidebar */}
              <div className="surface-card shadow-2 h-full flex-shrink-0 flex flex-column" style={{ width: '280px', zIndex: 1000 }}>
                <div className="flex align-items-center justify-content-center h-5rem border-bottom-1 surface-border">
                  <span className="text-xl font-bold text-primary">Purasthe Agro</span>
                </div>
                <div className="flex-grow-1 overflow-y-auto">
                  <div className="flex flex-column py-2">
                    <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarLink to="/stock" icon={Box} label="Stock Report" />
                    <SidebarLink to="/parties" icon={Users} label="Farmers / Parties" />
                    <SidebarLink to="/items" icon={Package} label="Items" />
                    <SidebarLink to="/sales" icon={FileText} label="Sales Bill" />
                    <SidebarLink to="/purchase" icon={ShoppingCart} label="Purchase Bill" />
                    <SidebarLink to="/purchase-history" icon={ShoppingCart} label="Purchase History" />
                    <SidebarLink to="/returns" icon={RefreshCcw} label="Returns" />
                  </div>
                </div>
                <div className="p-3 border-top-1 surface-border">
                  <div className="text-sm text-center text-500">v1.0.0</div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex flex-column flex-grow-1 h-full overflow-hidden">
                {/* Top Bar */}
                <div className="surface-card shadow-1 h-5rem flex align-items-center justify-content-between px-4" style={{ zIndex: 999 }}>
                  <span className="text-xl font-medium text-900">Welcome, Admin</span>
                  <button className="p-button p-component p-button-outlined p-button-danger" onClick={handleLogout}>
                    <span className="p-button-label p-c">Logout</span>
                  </button>
                </div>

                {/* Page Content */}
                <div className="p-4 flex-grow-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/stock" element={<StockReport />} />
                    <Route path="/parties" element={<PartyMaster />} />
                    <Route path="/items" element={<ItemMaster />} />
                    <Route path="/sales" element={<SalesBill />} />
                    <Route path="/purchase" element={<PurchaseBill />} />
                    <Route path="/purchase-history" element={<PurchaseList />} />
                    <Route path="/returns" element={<Returns />} />
                  </Routes>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
