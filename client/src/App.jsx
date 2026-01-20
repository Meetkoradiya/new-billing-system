import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, ShoppingCart, RefreshCcw, Box, Menu, X } from 'lucide-react';
import './index.css';
import PartyMaster from './pages/PartyMaster';
import ItemMaster from './pages/ItemMaster';
import SalesBill from './pages/SalesBill';
import Dashboard from './pages/Dashboard';
import PurchaseBill from './pages/PurchaseBill';
import PurchaseList from './pages/PurchaseList';
import Returns from './pages/Returns';
import StockReport from './pages/StockReport';
import PaymentReport from './pages/PaymentReport';
import PaymentEntry from './pages/PaymentEntry';
import LoginPage from './pages/LoginPage';
// PrimeReact
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';

const SidebarContent = ({ closeSidebar }) => (
  <div className="flex flex-column h-full">
    <div className="flex align-items-center justify-content-center h-5rem border-bottom-1 surface-border">
      <span className="text-xl font-bold text-primary">Purusath Agro</span>
    </div>
    <div className="flex-grow-1 overflow-y-auto">
      <div className="flex flex-column py-2">
        <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
        <SidebarLink to="/stock" icon={Box} label="Stock Report" onClick={closeSidebar} />
        <SidebarLink to="/parties" icon={Users} label="Farmers / Parties" onClick={closeSidebar} />
        <SidebarLink to="/items" icon={Package} label="Items" onClick={closeSidebar} />
        <SidebarLink to="/sales" icon={FileText} label="Farmer Sales" onClick={closeSidebar} />
        <SidebarLink to="/purchase" icon={ShoppingCart} label="Company Purchase" onClick={closeSidebar} />
        <SidebarLink to="/purchase-history" icon={ShoppingCart} label="Purchase History" onClick={closeSidebar} />
        <SidebarLink to="/payment-entry" icon={RefreshCcw} label="Receipt / Payment" onClick={closeSidebar} />
        <SidebarLink to="/payments" icon={FileText} label="Payment Report" onClick={closeSidebar} />
        <SidebarLink to="/returns" icon={RefreshCcw} label="Returns" onClick={closeSidebar} />
      </div>
    </div>
    <div className="p-3 border-top-1 surface-border">
      <div className="text-sm text-center text-500">v1.0.0</div>
    </div>
  </div>
);

const SidebarLink = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} onClick={onClick} className={`p-ripple no-underline flex align-items-center p-3 text-color hover:surface-100 transition-colors transition-duration-150 cursor-pointer ${isActive ? 'surface-100 border-left-3 border-primary' : ''}`} style={{ borderLeft: isActive ? '4px solid var(--primary-color)' : '4px solid transparent' }}>
      <Icon size={20} className="mr-2" color={isActive ? 'var(--primary-color)' : '#666'} />
      <span className="font-medium" style={{ color: isActive ? 'var(--primary-color)' : '#495057' }}>{label}</span>
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
  const [sidebarVisible, setSidebarVisible] = useState(false);

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
              {/* Desktop Sidebar (Hidden on Mobile) */}
              <div className="hidden lg:flex surface-card shadow-2 h-full flex-shrink-0 flex-column" style={{ width: '280px', zIndex: 1000 }}>
                <SidebarContent />
              </div>

              {/* Mobile Sidebar (Drawer) */}
              <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)} showCloseIcon={false} className="w-18rem lg:hidden">
                <SidebarContent closeSidebar={() => setSidebarVisible(false)} />
              </Sidebar>

              {/* Main Content */}
              <div className="flex flex-column flex-grow-1 h-full overflow-hidden">
                {/* Top Bar */}
                <div className="surface-card shadow-1 h-5rem flex align-items-center justify-content-between px-4" style={{ zIndex: 999 }}>
                  <div className="flex align-items-center">
                    <Button icon="pi pi-bars" className="lg:hidden mr-3 p-button-text p-button-secondary" onClick={() => setSidebarVisible(true)} />
                    <span className="text-xl font-medium text-900 hidden sm:block">Welcome, Admin</span>
                    <span className="text-xl font-bold text-primary sm:hidden">Purusath Agro</span>
                  </div>
                  <Button label="Logout" icon="pi pi-power-off" className="p-button-outlined p-button-danger p-button-sm" onClick={handleLogout} />
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
                    <Route path="/payment-entry" element={<PaymentEntry />} />
                    <Route path="/payments" element={<PaymentReport />} />
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
