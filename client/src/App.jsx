import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, ShoppingCart, RefreshCcw } from 'lucide-react';
import './index.css';
import PartyMaster from './pages/PartyMaster';
import ItemMaster from './pages/ItemMaster';
import SalesBill from './pages/SalesBill';
import Dashboard from './pages/Dashboard';
import PurchaseBill from './pages/PurchaseBill';
import Returns from './pages/Returns';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
      <Icon className="nav-icon" />
      <span>{label}</span>
    </Link>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            Purasthe Agro
          </div>
          <div className="nav-links">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/parties" icon={Users} label="Farmers / Parties" />
            <SidebarLink to="/items" icon={Package} label="Items" />
            <SidebarLink to="/sales" icon={FileText} label="Sales Bill" />
            <SidebarLink to="/purchase" icon={ShoppingCart} label="Purchase Bill" />
            <SidebarLink to="/returns" icon={RefreshCcw} label="Returns" />
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="top-bar">
            <span>Welcome, Admin</span>
            <button className="btn btn-primary">Logout</button>
          </div>
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/parties" element={<PartyMaster />} />
              <Route path="/items" element={<ItemMaster />} />
              <Route path="/sales" element={<SalesBill />} />
              <Route path="/purchase" element={<PurchaseBill />} />
              <Route path="/returns" element={<Returns />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
