import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Leaf, User, Lock, ArrowRight, Sprout } from 'lucide-react';

const LoginPage = ({ setAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.current.show({ severity: 'warn', summary: 'Missing Credentials', detail: 'Please enter both username and password' });
            return;
        }

        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${apiUrl}/auth/login`, {
                username,
                password
            });

            if (res.data.success) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setAuth(true);
                toast.current.show({ severity: 'success', summary: 'Welcome Back', detail: 'Login Successful', life: 1000 });
                setTimeout(() => navigate('/'), 800);
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Invalid username or password';
            toast.current.show({ severity: 'error', summary: 'Login Failed', detail: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-surface-ground">
            <Toast ref={toast} />

            {/* Left Panel - Visual Branding (60% width on large screens) */}
            <div className="hidden lg:flex flex-column justify-content-between lg:w-7 relative p-8 overflow-hidden text-white animate-fade-in">

                {/* Background Image & Gradient */}
                <div className="absolute top-0 left-0 w-full h-full z-0">
                    <img
                        src="https://images.unsplash.com/photo-1625246333195-581962441a13?q=80&w=2070"
                        alt="Agro Field"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 left-0 w-full h-full"
                        style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(59, 130, 246, 0.8) 100%)' }}>
                    </div>
                </div>

                {/* Top Brand */}
                <div className="relative z-1 flex align-items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-md p-2 border-round-xl border-1 border-white/30 flex align-items-center justify-content-center">
                        <Sprout size={28} className="text-white" />
                    </div>
                    <span className="font-heading font-bold text-2xl tracking-tight text-shadow-sm">Purusath Agro</span>
                </div>

                {/* Middle Content */}
                <div className="relative z-1 max-w-2xl mt-auto mb-auto">
                    <div className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-3">Enterprise Billing Solution</div>
                    <h1 className="text-6xl font-extrabold mb-4 line-height-2 text-shadow-sm font-heading">
                        Cultivating Success <br />
                        <span className="text-blue-300">Through Technology</span>
                    </h1>
                    <p className="text-xl text-blue-50 line-height-3 opacity-90">
                        Manage your entire agricultural business with our comprehensive billing and inventory management system. Designed for efficiency, built for growth.
                    </p>
                </div>

                {/* Bottom Footer */}
                <div className="relative z-1 flex align-items-center gap-6 text-sm text-blue-100/60 font-medium">
                    <span>© 2026 Purusath Agro</span>
                    <a href="#" className="text-white hover:text-blue-200 no-underline transition-colors">Privacy Policy</a>
                    <a href="#" className="text-white hover:text-blue-200 no-underline transition-colors">Terms & Conditions</a>
                    <a href="#" className="text-white hover:text-blue-200 no-underline transition-colors">Support</a>
                </div>
            </div>

            {/* Right Panel - Login Form (40% width) */}
            <div className="flex-1 flex align-items-center justify-content-center p-4 lg:p-8 relative">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-30rem h-30rem bg-primary-50 border-circle opacity-50 blur-3xl z-0"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-20rem h-20rem bg-blue-50 border-circle opacity-50 blur-3xl z-0"></div>

                <div className="w-full max-w-28rem z-1 animate-fade-in" style={{ animationDelay: '0.1s' }}>

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex align-items-center justify-content-center mb-6">
                        <div className="bg-primary p-2 border-round-xl mr-2">
                            <Sprout size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-900 font-heading">Purusath Agro</span>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 border-round-2xl shadow-4 border-1 border-gray-100">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-900 mb-2 font-heading">Welcome Back</h2>
                            <p className="text-600 m-0">Please enter your credentials to access your dashboard.</p>
                        </div>

                        <form onSubmit={handleLogin} className="flex flex-column gap-4">
                            <div className="flex flex-column gap-2">
                                <label htmlFor="username" className="text-900 font-medium text-sm">Username / Email</label>
                                <span className="p-input-icon-left w-full">
                                    <User size={18} className="text-500 z-2 mt-2 -ml-2" />
                                    <InputText
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full"
                                        placeholder="admin@example.com"
                                        autoFocus
                                    />
                                </span>
                            </div>

                            <div className="flex flex-column gap-2">
                                <div className="flex justify-content-between align-items-center">
                                    <label htmlFor="password" class="text-900 font-medium text-sm">Password</label>
                                    <a href="#" className="text-primary hover:text-primary-dark text-sm font-medium no-underline transition-colors">Forgot password?</a>
                                </div>
                                <span className="p-input-icon-left w-full">
                                    <Lock size={18} className="text-500 z-2 mt-2 -ml-2" />
                                    <InputText
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full"
                                        placeholder="••••••••"
                                    />
                                </span>
                            </div>

                            <div className="flex align-items-center gap-2 my-2">
                                <Checkbox inputId="remember" checked={checked} onChange={e => setChecked(e.checked)} />
                                <label htmlFor="remember" className="text-700 text-sm cursor-pointer select-none">Keep me logged in for 30 days</label>
                            </div>

                            <Button
                                type="submit"
                                label={loading ? 'Signing In...' : 'Sign In'}
                                icon={loading ? 'pi pi-spinner pi-spin' : <ArrowRight size={18} />}
                                className="w-full p-3 text-lg font-bold shadow-2 hover:shadow-4 border-round-lg mt-2"
                                disabled={loading}
                            />
                        </form>

                        <div className="mt-6 text-center text-sm text-600">
                            Don't have an account? <span className="text-primary font-bold cursor-pointer hover:underline">Contact Support</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
