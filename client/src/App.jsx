import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, ShoppingCart, RefreshCcw, Box, Menu, X, Receipt, Building2, History } from 'lucide-react'; // Added Receipt icon & Building2
import './index.css';
import PartyMaster from './pages/PartyMaster';
import FarmerMaster from './pages/FarmerMaster';
import CompanyMaster from './pages/CompanyMaster';
import ItemMaster from './pages/ItemMaster';
import SalesBill from './pages/SalesBill';
import SalesList from './pages/SalesList';
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
import { Avatar } from 'primereact/avatar';
import { Ripple } from 'primereact/ripple';

const SidebarLink = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`p-ripple no-underline flex align-items-center p-3 my-1 border-radius-sm text-color transition-colors transition-duration-200 cursor-pointer ${isActive ? 'bg-blue-50 text-primary font-semibold' : 'hover:surface-100 text-600'}`}
    >
      <Icon size={20} className={`mr-3 ${isActive ? 'text-primary' : 'text-500'}`} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-sm">{label}</span>
      <Ripple />
    </Link>
  );
};

const SidebarContent = ({ closeSidebar }) => (
  <div className="flex flex-column h-full bg-transparent select-none">
    <div className="flex align-items-center gap-3 px-4 h-5rem border-bottom-1 border-100">
      <div className="flex align-items-center justify-content-center bg-primary text-white border-round" style={{ width: '36px', height: '36px' }}>
        <span className="font-bold text-xl">P</span>
      </div>
      <div className="flex flex-column">
        <span className="text-xl font-bold text-900 font-heading">Purusath Agro</span>
        <span className="text-xs text-500">Billing System</span>
      </div>
    </div>

    <div className="flex-grow-1 overflow-y-auto px-3 py-4">
      <div className="flex flex-column gap-1">
        <div className="text-xs font-bold text-400 uppercase tracking-widest mb-2 px-3 mt-1">Main</div>
        <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
        <SidebarLink to="/stock" icon={Box} label="Stock Report" onClick={closeSidebar} />

        <div className="text-xs font-bold text-400 uppercase tracking-widest mb-2 px-3 mt-4">Operations</div>
        <SidebarLink to="/sales" icon={FileText} label="New Sale" onClick={closeSidebar} />
        <SidebarLink to="/sales-history" icon={History} label="Sales History" onClick={closeSidebar} />
        <SidebarLink to="/farmers" icon={Users} label="Farmer List" onClick={closeSidebar} />

        <SidebarLink to="/purchase" icon={ShoppingCart} label="Company Purchase" onClick={closeSidebar} />
        <SidebarLink to="/companies" icon={Building2} label="Company List" onClick={closeSidebar} />

        <SidebarLink to="/payment-entry" icon={Receipt} label="Receipt / Payment" onClick={closeSidebar} />
        <SidebarLink to="/returns" icon={RefreshCcw} label="Returns" onClick={closeSidebar} />

        <div className="text-xs font-bold text-400 uppercase tracking-widest mb-2 px-3 mt-4">Inventory</div>
        <SidebarLink to="/items" icon={Package} label="Products & Items" onClick={closeSidebar} />

        <div className="text-xs font-bold text-400 uppercase tracking-widest mb-2 px-3 mt-4">Reports</div>
        <SidebarLink to="/purchase-history" icon={ShoppingCart} label="Purchase History" onClick={closeSidebar} />
        <SidebarLink to="/payments" icon={FileText} label="Payment Report" onClick={closeSidebar} />
      </div>
    </div>

    <div className="p-3 border-top-1 border-100 mx-3 mb-2">
      <div className="surface-100 p-3 border-round border-1 border-200 flex align-items-center gap-3">
        <Avatar label="A" shape="circle" className="bg-primary text-white" />
        <div className="flex flex-column overflow-hidden">
          <span className="text-sm font-bold text-900 text-overflow-ellipsis white-space-nowrap">Admin User</span>
          <span className="text-xs text-500">v1.2.0</span>
        </div>
      </div>
    </div>
  </div>
);

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
            <div className="flex h-screen overflow-hidden bg-slate-50 relative">

              {/* Decorative Background Blobs */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-30rem h-30rem bg-blue-400 opacity-20 border-circle blur-3xl -ml-20 -mt-20"></div>
                <div className="absolute bottom-0 right-0 w-40rem h-40rem bg-purple-400 opacity-20 border-circle blur-3xl -mr-20 -mb-20"></div>
              </div>

              {/* Desktop Sidebar (Floating) */}
              <div className="hidden lg:block flex-shrink-0 z-2 relative">
                <div className="floating-sidebar w-18rem flex flex-column">
                  <SidebarContent />
                </div>
              </div>

              {/* Mobile Sidebar (Drawer) */}
              <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)} showCloseIcon={false} className="w-18rem lg:hidden p-0 border-none shadow-none">
                <div className="h-full bg-white">
                  <SidebarContent closeSidebar={() => setSidebarVisible(false)} />
                </div>
              </Sidebar>

              {/* Main Content Area */}
              <div className="flex flex-column flex-grow-1 h-full overflow-hidden relative z-1">

                {/* Top Navbar (Floating) */}
                <div className="min-h-4rem flex align-items-center justify-content-between px-4 lg:px-6 navbar-glass z-5 mx-3 mt-3 mb-2 shadow-sm">
                  <div className="flex align-items-center gap-3">
                    <Button icon="pi pi-bars" className="lg:hidden p-button-text p-button-secondary p-0 w-2rem h-2rem" onClick={() => setSidebarVisible(true)} />
                    <span className="text-xl font-bold text-800 hidden sm:block font-heading tracking-tight">Dashboard Overview</span>
                    <span className="text-xl font-bold text-primary sm:hidden">Purusath</span>
                  </div>


                  <div className="flex align-items-center gap-3">
                    <div className="hidden md:flex align-items-center text-sm text-500 bg-surface-100 px-3 py-1 border-round-2xl">
                      <span className="w-2rem h-2rem bg-green-100 text-green-700 border-circle flex align-items-center justify-content-center mr-2">
                        <i className="pi pi-check text-xs" />
                      </span>
                      System Active
                    </div>
                    <Button label="Logout" icon="pi pi-power-off" className="p-button-text p-button-danger p-button-sm font-medium" onClick={handleLogout} />
                  </div>
                </div>

                {/* Scrollable Page Content */}
                <div className="flex-grow-1 overflow-y-auto bg-surface-ground">
                  <main className="p-4 lg:p-6 w-full max-w-8xl mx-auto animate-fade-in">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/stock" element={<StockReport />} />
                      <Route path="/farmers" element={<FarmerMaster />} />
                      <Route path="/companies" element={<CompanyMaster />} />
                      <Route path="/parties" element={<PartyMaster />} />
                      <Route path="/items" element={<ItemMaster />} />
                      <Route path="/sales" element={<SalesBill />} />
                      <Route path="/sales-history" element={<SalesList />} />
                      <Route path="/purchase" element={<PurchaseBill />} />
                      <Route path="/purchase-history" element={<PurchaseList />} />
                      <Route path="/payment-entry" element={<PaymentEntry />} />
                      <Route path="/payments" element={<PaymentReport />} />
                      <Route path="/returns" element={<Returns />} />
                    </Routes>
                  </main>
                  <div className="h-4rem flex align-items-center justify-content-center text-500 text-sm">
                    © 2026 Purusath Agro. Created by <span className="font-bold text-primary ml-1">@Meet Koradiya</span>
                  </div>
                  <div className="h-2rem"></div> {/* Spacer */}
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
