import React, { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Please enter both username and password' });
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
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Login Successful' });
                setTimeout(() => navigate('/'), 500);
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Login failed';
            toast.current.show({ severity: 'error', summary: 'Error', detail: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-content-center align-items-center h-screen w-screen overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
            }}>

            <Toast ref={toast} />

            <div className="surface-card p-6 shadow-8 border-round-2xl w-full sm:w-26rem animation-duration-500 fadein"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>

                <div className="text-center mb-5">
                    <div className="text-primary text-4xl font-bold mb-2">Purusath Agro</div>
                    <div className="text-600 font-medium">Billing System</div>
                </div>

                <form onSubmit={handleLogin} className="p-fluid">
                    <div className="field mb-4">
                        <span className="p-float-label">
                            <InputText
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full text-lg p-3"
                                autoFocus
                            />
                            <label htmlFor="username">Username</label>
                        </span>
                    </div>

                    <div className="field mb-6">
                        <span className="p-float-label">
                            <Password
                                inputId="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                toggleMask
                                feedback={false}
                                inputClassName="w-full text-lg p-3"
                            />
                            <label htmlFor="password">Password</label>
                        </span>
                    </div>

                    <Button label="Sign In" icon="pi pi-sign-in" loading={loading} className="w-full p-3 text-xl font-bold border-round-xl shadow-4 text-white" />

                    <div className="text-center mt-4 pt-3 border-top-1 surface-border">
                        <span className="text-600 font-medium text-sm">Need help? </span>
                        <a href="#" className="text-primary hover:underline font-bold text-sm">Contact Administrator</a>
                    </div>
                </form>
            </div>

            <div className="absolute bottom-0 w-full text-center pb-4 text-white-alpha-70 font-medium">
                &copy; 2026 Purusath Agro Center
            </div>
        </div>
    );
};

export default LoginPage;
