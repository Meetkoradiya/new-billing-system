import React, { useState, useEffect } from 'react';
import { getAccounts, getItems, createPurchase } from '../services/api';
import { Plus, Trash, Save, ShoppingCart } from 'lucide-react';

const PurchaseBill = () => {
    const [parties, setParties] = useState([]);
    const [productList, setProductList] = useState([]);

    const [billNo, setBillNo] = useState('');
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedParty, setSelectedParty] = useState('');
    const [remarks, setRemarks] = useState('');

    const [rows, setRows] = useState([
        { item_id: '', qty: 1, rate: 0, amount: 0, unit: '' }
    ]);

    useEffect(() => {
        loadMasters();
    }, []);

    const loadMasters = async () => {
        try {
            const accRes = await getAccounts();
            const itemRes = await getItems();
            setParties(accRes.data);
            setProductList(itemRes.data);
            setBillNo(`PB-${Math.floor(Math.random() * 10000)}`);
        } catch (error) {
            console.error('Error loading masters', error);
        }
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;

        if (field === 'item_id') {
            const item = productList.find(p => p.id === parseInt(value));
            if (item) {
                newRows[index].rate = item.purchase_rate; // Use Purchase Rate
                newRows[index].unit = item.unit;
            }
        }

        if (field === 'qty' || field === 'rate' || field === 'item_id') {
            const qty = parseFloat(newRows[index].qty) || 0;
            const rate = parseFloat(newRows[index].rate) || 0;
            newRows[index].amount = qty * rate;
        }

        setRows(newRows);
    };

    const addRow = () => {
        setRows([...rows, { item_id: '', qty: 1, rate: 0, amount: 0, unit: '' }]);
    };

    const removeRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    const calculateTotal = () => {
        return rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    };

    const handleSave = async () => {
        if (!selectedParty) return alert('Select Supplier / Farmer');
        if (rows.length === 0 || !rows[0].item_id) return alert('Add at least one item');

        const payload = {
            bill_no: billNo,
            bill_date: billDate,
            account_id: selectedParty,
            remarks,
            items: rows.filter(r => r.item_id)
        };

        try {
            await createPurchase(payload);
            alert('Purchase Bill Saved Successfully!');
            setBillNo(`PB-${Math.floor(Math.random() * 10000)}`);
            setRows([{ item_id: '', qty: 1, rate: 0, amount: 0, unit: '' }]);
            setRemarks('');
            setSelectedParty('');
        } catch (error) {
            console.error(error);
            alert('Failed to save bill');
        }
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2><ShoppingCart size={24} style={{ marginBottom: -5, marginRight: 10 }} /> Purchase Entry</h2>
                <div>
                    <span style={{ marginRight: 15, fontWeight: 'bold' }}>Bill No: {billNo}</span>
                    <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} className="form-input" style={{ width: 150, display: 'inline-block' }} />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Supplier / Company Name</label>
                <select
                    className="form-input"
                    value={selectedParty}
                    onChange={e => setSelectedParty(e.target.value)}
                    style={{ width: '50%' }}
                >
                    <option value="">-- Select Company / Supplier --</option>
                    {parties.filter(p => p.group_id === 2).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            <table className="data-table" style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th style={{ width: '40%' }}>Item Name</th>
                        <th style={{ width: '10%' }}>Unit</th>
                        <th style={{ width: '15%' }} className="text-right">Qty</th>
                        <th style={{ width: '15%' }} className="text-right">Rate</th>
                        <th style={{ width: '15%' }} className="text-right">Amount</th>
                        <th style={{ width: '5%' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td>
                                <select
                                    className="form-input"
                                    value={row.item_id}
                                    onChange={e => handleRowChange(index, 'item_id', e.target.value)}
                                >
                                    <option value="">Select Item</option>
                                    {productList.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                            </td>
                            <td>{row.unit}</td>
                            <td>
                                <input
                                    type="number"
                                    className="form-input text-right"
                                    value={row.qty}
                                    onChange={e => handleRowChange(index, 'qty', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-input text-right"
                                    value={row.rate}
                                    onChange={e => handleRowChange(index, 'rate', e.target.value)}
                                />
                            </td>
                            <td className="text-right">
                                {row.amount.toFixed(2)}
                            </td>
                            <td className="text-center">
                                <Trash size={16} color="red" style={{ cursor: 'pointer' }} onClick={() => removeRow(index)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: 10 }}>
                <button className="btn btn-primary" onClick={addRow}><Plus size={14} /> Add Item</button>
            </div>

            <div style={{ marginTop: 20, borderTop: '1px solid #ddd', paddingTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right', width: 250 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, borderTop: '2px solid #ccc', paddingTop: 5 }}>
                        <b>Grand Total:</b>
                        <b>{calculateTotal().toFixed(2)}</b>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 15, padding: 10 }} onClick={handleSave}>
                        <Save size={16} style={{ marginRight: 5 }} /> Save Purchase
                    </button>
                </div>
            </div>

        </div>
    );
};

export default PurchaseBill;
