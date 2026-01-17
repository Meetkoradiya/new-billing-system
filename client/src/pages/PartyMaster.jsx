import React, { useEffect, useState } from 'react';
import { getAccounts, createAccount } from '../services/api';
import { Plus, Search } from 'lucide-react';

const PartyMaster = () => {
    const [accounts, setAccounts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        group_id: 1, // Default to Sundry Debtors
        address: '',
        city: '',
        mobile: ''
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await getAccounts();
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createAccount(formData);
            setShowForm(false);
            setFormData({ name: '', group_id: 1, address: '', city: '', mobile: '' });
            fetchAccounts();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error creating account');
        }
    };

    return (
        <div>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Farmers / Parties</h2>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={16} style={{ marginBottom: -3, marginRight: 5 }} />
                    {showForm ? 'Cancel' : 'Add New Farmer'}
                </button>
            </div>

            {showForm && (
                <div className="card">
                    <h3>New Farmer / Account</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                        <div>
                            <label className="form-label">Farmer Name / Party Name</label>
                            <input
                                className="form-input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">City / Village</label>
                            <input
                                className="form-input"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="form-label">Type</label>
                            <select
                                className="form-input"
                                value={formData.group_id}
                                onChange={e => setFormData({ ...formData, group_id: e.target.value })}
                            >
                                <option value="1">Farmer (Debtor)</option>
                                <option value="2">Supplier (Creditor)</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Mobile</label>
                            <input
                                className="form-input"
                                value={formData.mobile}
                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Address</label>
                            <input
                                className="form-input"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                            <button type="submit" className="btn btn-primary">Save Account</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ padding: 0 }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>City / Village</th>
                            <th>Mobile</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(acc => (
                            <tr key={acc.id}>
                                <td>{acc.id}</td>
                                <td>{acc.name}</td>
                                <td>
                                    {acc.group_id === 1 ?
                                        <span className="badge badge-success">Farmer</span> :
                                        <span className="badge badge-info">Supplier</span>
                                    }
                                </td>
                                <td>{acc.city}</td>
                                <td>{acc.mobile}</td>
                            </tr>
                        ))}
                        {accounts.length === 0 && (
                            <tr><td colSpan="5" className="text-center">No accounts found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PartyMaster;
