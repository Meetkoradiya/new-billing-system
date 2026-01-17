import React, { useEffect, useState } from 'react';
import { getItems, createItem } from '../services/api';
import { Plus } from 'lucide-react';

const ItemMaster = () => {
    const [items, setItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        unit: 'Nos',
        purchase_rate: 0,
        sales_rate: 0,
        gst_percent: 0
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await getItems();
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createItem(formData);
            setShowForm(false);
            setFormData({ name: '', code: '', unit: 'Nos', purchase_rate: 0, sales_rate: 0, gst_percent: 0 });
            fetchItems();
        } catch (error) {
            alert('Error creating item');
        }
    };

    return (
        <div>
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Item Master</h2>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={16} style={{ marginBottom: -3, marginRight: 5 }} />
                    {showForm ? 'Cancel' : 'Add New Item'}
                </button>
            </div>

            {showForm && (
                <div className="card">
                    <h3>New Product</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Item Name</label>
                            <input
                                className="form-input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Code / SKU</label>
                            <input
                                className="form-input"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="form-label">Unit</label>
                            <select
                                className="form-input"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option value="Nos">Nos</option>
                                <option value="Kg">Kg</option>
                                <option value="Ltr">Ltr</option>
                                <option value="Box">Box</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Purchase Rate</label>
                            <input
                                type="number"
                                className="form-input text-right"
                                value={formData.purchase_rate}
                                onChange={e => setFormData({ ...formData, purchase_rate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="form-label">Sales Rate</label>
                            <input
                                type="number"
                                className="form-input text-right"
                                value={formData.sales_rate}
                                onChange={e => setFormData({ ...formData, sales_rate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="form-label">GST %</label>
                            <select
                                className="form-input"
                                value={formData.gst_percent}
                                onChange={e => setFormData({ ...formData, gst_percent: e.target.value })}
                            >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: 'span 3', textAlign: 'right' }}>
                            <button type="submit" className="btn btn-primary">Save Item</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card" style={{ padding: 0 }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Item Name</th>
                            <th>Unit</th>
                            <th className="text-right">Pur. Rate</th>
                            <th className="text-right">Sale Rate</th>
                            <th className="text-right">GST %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>{item.code}</td>
                                <td>{item.name}</td>
                                <td>{item.unit}</td>
                                <td className="text-right">{item.purchase_rate}</td>
                                <td className="text-right">{item.sales_rate}</td>
                                <td className="text-right">{item.gst_percent}%</td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr><td colSpan="6" className="text-center">No items found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ItemMaster;
