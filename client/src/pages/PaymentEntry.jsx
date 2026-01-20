import React, { useState, useEffect, useRef } from 'react';
import { getAccounts, createReceipt, createPayment } from '../services/api';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';

const PaymentEntry = () => {
    const [parties, setParties] = useState([]);
    const [selectedParty, setSelectedParty] = useState(null);
    const [date, setDate] = useState(new Date());
    const [amount, setAmount] = useState(null);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    // Tab State: 0 = Receipt (In), 1 = Payment (Out)
    const [activeIndex, setActiveIndex] = useState(0);

    const toast = useRef(null);

    useEffect(() => {
        loadParties();
    }, []);

    const loadParties = async () => {
        try {
            const res = await getAccounts();
            setParties(res.data);
        } catch (error) {
            console.error('Error loading parties:', error);
        }
    };

    const handleSubmit = async () => {
        if (!selectedParty || !amount) {
            toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Please Select Party and Amount' });
            return;
        }

        setLoading(true);

        const payload = {
            account_id: selectedParty.id,
            date: date.toISOString().split('T')[0],
            amount: parseFloat(amount),
            payment_mode: paymentMode,
            remarks
        };

        try {
            if (activeIndex === 0) {
                // Receipt (Money In)
                await createReceipt(payload);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Receipt Entry Saved!' });
            } else {
                // Payment (Money Out)
                await createPayment(payload);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Payment Entry Saved!' });
            }

            // Reset Form and reload party balance
            setAmount(null);
            setRemarks('');
            loadParties(); // to update balance
            setSelectedParty(null);
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Transaction Failed' });
        } finally {
            setLoading(false);
        }
    };

    const modes = [
        { label: 'Cash', value: 'Cash' },
        { label: 'Bank / Online', value: 'Bank' },
        { label: 'Cheque', value: 'Cheque' }
    ];

    return (
        <div className="flex justify-content-center p-4 fadein animation-duration-500">
            <Toast ref={toast} />
            <div className="w-full lg:w-6">
                <Card title="Payment & Receipt Entry" className="shadow-2 border-round">
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header="Money In (Receipt)" leftIcon="pi pi-arrow-down-left text-green-500 font-bold">
                            <div className="p-3 border-round-bottom surface-50">
                                <div className="text-center mb-4">
                                    <span className="text-xl font-bold text-green-600 block">Received from Customer</span>
                                    <span className="text-sm text-600">Use this when a customer pays you money.</span>
                                </div>
                                <EntryForm
                                    parties={parties.filter(p => p.group_id === 1)} // Farmers mostly
                                    selectedParty={selectedParty}
                                    setSelectedParty={setSelectedParty}
                                    date={date}
                                    setDate={setDate}
                                    amount={amount}
                                    setAmount={setAmount}
                                    paymentMode={paymentMode}
                                    setPaymentMode={setPaymentMode}
                                    remarks={remarks}
                                    setRemarks={setRemarks}
                                    loading={loading}
                                    handleSubmit={handleSubmit}
                                    modes={modes}
                                    btnLabel="Save Receipt"
                                    btnSeverity="success"
                                />
                            </div>
                        </TabPanel>
                        <TabPanel header="Money Out (Payment)" leftIcon="pi pi-arrow-up-right text-red-500 font-bold">
                            <div className="p-3 border-round-bottom surface-50">
                                <div className="text-center mb-4">
                                    <span className="text-xl font-bold text-red-600 block">Payment to Supplier</span>
                                    <span className="text-sm text-600">Use this when you pay money to a company.</span>
                                </div>
                                <EntryForm
                                    parties={parties.filter(p => p.group_id === 2)} // Suppliers mostly
                                    selectedParty={selectedParty}
                                    setSelectedParty={setSelectedParty}
                                    date={date}
                                    setDate={setDate}
                                    amount={amount}
                                    setAmount={setAmount}
                                    paymentMode={paymentMode}
                                    setPaymentMode={setPaymentMode}
                                    remarks={remarks}
                                    setRemarks={setRemarks}
                                    loading={loading}
                                    handleSubmit={handleSubmit}
                                    modes={modes}
                                    btnLabel="Make Payment"
                                    btnSeverity="danger"
                                />
                            </div>
                        </TabPanel>
                    </TabView>
                </Card>
            </div>
        </div>
    );
};

const EntryForm = ({ parties, selectedParty, setSelectedParty, date, setDate, amount, setAmount, paymentMode, setPaymentMode, remarks, setRemarks, loading, handleSubmit, modes, btnLabel, btnSeverity }) => {
    return (
        <div className="flex flex-column gap-3 p-fluid">
            <div className="grid">
                <div className="col-12 md:col-6">
                    <label className="font-bold mb-2 block">Date</label>
                    <Calendar value={date} onChange={(e) => setDate(e.value)} showIcon dateFormat="dd/mm/yy" />
                </div>
                <div className="col-12 md:col-6">
                    <label className="font-bold mb-2 block">Select Party</label>
                    <Dropdown
                        value={selectedParty}
                        options={parties}
                        onChange={(e) => setSelectedParty(e.value)}
                        optionLabel="name"
                        placeholder="Select Party"
                        filter
                        className="w-full"
                        itemTemplate={(option) => {
                            const isFarmer = option.group_id === 1;
                            const isPositive = option.balance > 0;
                            const label = isPositive ? (isFarmer ? 'Dr' : 'Cr') : (isFarmer ? 'Cr' : 'Dr');
                            // Red for Outstanding (Positive), Green for Advance (Negative)
                            return (
                                <div className="flex align-items-center justify-content-between">
                                    <span>{option.name}</span>
                                    <span className={`text-sm font-bold ${isPositive ? 'text-red-500' : 'text-green-500'}`}>
                                        {Math.abs(option.balance || 0).toFixed(2)} {label}
                                    </span>
                                </div>
                            );
                        }}
                    />
                </div>
            </div>

            {selectedParty && (
                <div className="surface-0 p-3 border-round flex justify-content-between align-items-center border-1 surface-border">
                    <span className="text-600 font-medium">Current Balance:</span>
                    <span className={`text-xl font-bold ${selectedParty.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ₹ {Math.abs(selectedParty.balance || 0).toFixed(2)} {
                            selectedParty.balance > 0
                                ? (selectedParty.group_id === 1 ? 'Dr (Receivable)' : 'Cr (Payable)')
                                : (selectedParty.group_id === 1 ? 'Cr (Advance)' : 'Dr (Advance)')
                        }
                    </span>
                </div>
            )}

            <div>
                <label className="font-bold mb-2 block">Amount</label>
                <div className="p-inputgroup">
                    <span className="p-inputgroup-addon">₹</span>
                    <InputNumber value={amount} onValueChange={(e) => setAmount(e.value)} placeholder="Enter Amount" min={0} mode="decimal" minFractionDigits={2} autoFocus />
                </div>
            </div>

            <div>
                <label className="font-bold mb-2 block">Payment Mode</label>
                <Dropdown value={paymentMode} options={modes} onChange={(e) => setPaymentMode(e.value)} placeholder="Select Mode" />
            </div>

            <div>
                <label className="font-bold mb-2 block">Remarks</label>
                <InputText value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Narrartion..." />
            </div>

            <Button label={btnLabel} icon="pi pi-check" loading={loading} onClick={handleSubmit} severity={btnSeverity} size="large" className="mt-3" />
        </div>
    );
}

export default PaymentEntry;
