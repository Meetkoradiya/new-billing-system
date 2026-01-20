import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getAccounts, getItems, createSale, createItem } from '../services/api';
import { useReactToPrint } from 'react-to-print';
import SalesPrint from '../components/SalesPrint';

// PrimeReact Imports
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';

const SalesBill = () => {
    // Master Data
    const [parties, setParties] = useState([]);
    const [productList, setProductList] = useState([]);

    // Form Data
    const [billNo, setBillNo] = useState('');
    const [billDate, setBillDate] = useState(new Date());
    const [selectedParty, setSelectedParty] = useState(null);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [remarks, setRemarks] = useState('');

    // Print Data
    const [printData, setPrintData] = useState(null);
    const printRef = useRef();
    const toast = useRef(null);

    // Quick Add Item State
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', company: '', unit: 'Nos', sales_rate: 0, purchase_rate: 0, stock: 0 });

    // Grid Data
    const [rows, setRows] = useState([
        { id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }
    ]);

    // Derived options for dropdown
    const itemOptions = useMemo(() => productList.map(p => ({
        ...p,
        label: p.company ? `${p.name} (${p.company})` : p.name
    })), [productList]);

    useEffect(() => {
        loadMasters();
    }, []);

    const loadMasters = async () => {
        try {
            const accRes = await getAccounts();
            if (Array.isArray(accRes.data)) {
                setParties(accRes.data);
            } else {
                console.warn("Accounts API response format invalid:", accRes.data);
            }
        } catch (error) {
            console.error('Error loading parties', error);
        }

        try {
            const itemRes = await getItems();
            if (Array.isArray(itemRes.data)) {
                setProductList(itemRes.data);
            } else {
                setProductList([]);
            }
        } catch (error) {
            console.error('Error loading items', error);
        }

        if (!billNo) setBillNo(`SB-${Date.now()}`);
    };

    const handleRowChange = (index, field, value) => {
        setRows(prevRows => {
            return prevRows.map((row, i) => {
                if (i !== index) return row;

                // Create a shallow copy specifically for the row being modified
                const updatedRow = { ...row };

                if (field === 'item_id') {
                    let selectedItem = null;

                    if (value && typeof value === 'object') {
                        selectedItem = value;
                    } else if (typeof value === 'string') {
                        // Try to match string to an option
                        const lowerVal = value.trim().toLowerCase();
                        if (lowerVal) {
                            selectedItem = itemOptions.find(p =>
                                p.label.toLowerCase() === lowerVal ||
                                (p.name && p.name.toLowerCase() === lowerVal) ||
                                (p.code && p.code.toLowerCase() === lowerVal)
                            );
                        }
                    }

                    if (selectedItem) {
                        // Item Selected from List (Object)
                        updatedRow.item_id = selectedItem.id;
                        updatedRow.name = selectedItem.name;
                        updatedRow.company = selectedItem.company;
                        updatedRow.unit = selectedItem.unit;
                        updatedRow.rate = selectedItem.sales_rate || selectedItem.purchase_rate || 0;
                    } else {
                        // Custom Typed Value (String), or cleared
                        updatedRow.item_id = '';
                        updatedRow.name = value || '';
                        updatedRow.company = '';
                        // Keep existing rate/qty if user is just typing name
                    }
                } else {
                    updatedRow[field] = value;
                }

                // Calc Amount
                const qty = parseFloat(updatedRow.qty) || 0;
                const rate = parseFloat(updatedRow.rate) || 0;
                updatedRow.amount = qty * rate;

                return updatedRow;
            });
        });
    };

    const addRow = () => {
        setRows(prevRows => {
            const newId = prevRows.length > 0 ? Math.max(...prevRows.map(r => r.id)) + 1 : 1;
            return [...prevRows, { id: newId, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }];
        });
    };

    const removeRow = (rowData) => {
        setRows(prev => {
            if (prev.length === 1) {
                return [{ id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }];
            }
            return prev.filter(r => r.id !== rowData.id);
        });
    };

    const calculateTotal = () => {
        return rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    };

    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear the form?")) {
            setRows([{ id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }]);
            setSelectedParty(null);
            setPaymentMode('Cash');
            setRemarks('');
            setBillNo(`SB-${Date.now()}`);
        }
    };

    const handlePrintTrigger = useReactToPrint({
        content: () => printRef.current,
    });

    const handleDownloadPdf = async () => {
        if (!printData) return alert('Save the bill first to download PDF');

        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).default;

            const element = printRef.current;
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${billNo}.pdf`);
        } catch (error) {
            console.error('PDF Download Error:', error);
            alert(`Failed to download PDF: ${error.message}`);
        }
    };

    const handleSave = async () => {
        if (!selectedParty) {
            toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Select Farmer / Party' });
            return;
        }

        const rowsToProcess = rows.filter(r => r.name);
        if (rowsToProcess.length === 0) {
            toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Add at least one item' });
            return;
        }

        try {
            // Track newly created items to prevent duplicates within the same bill
            const createdItemsMap = new Map(); // Name -> ID

            const processedItems = [];

            for (const row of rowsToProcess) {
                let finalItemId = row.item_id;

                if (!finalItemId) {
                    // Check if we already created this item in this loop
                    if (createdItemsMap.has(row.name)) {
                        finalItemId = createdItemsMap.get(row.name);
                    } else {
                        // Create new item
                        try {
                            const newItemPayload = {
                                name: row.name,
                                company: '',
                                code: 'AUTO-' + Math.floor(Math.random() * 10000),
                                sales_rate: row.rate,
                                purchase_rate: row.rate,
                                unit: 'Nos',
                                stock: 0
                            };
                            const res = await createItem(newItemPayload);
                            const newId = res.data?.id || res.id;

                            // Store in map
                            createdItemsMap.set(row.name, newId);
                            finalItemId = newId;
                        } catch (err) {
                            console.error("Failed to auto-create item", row.name, err);
                            throw new Error(`Failed to create item: ${row.name}`);
                        }
                    }
                }

                processedItems.push({
                    item_id: finalItemId,
                    qty: row.qty,
                    rate: row.rate,
                    amount: row.amount
                });
            }

            const total = calculateTotal();
            const payload = {
                bill_no: billNo,
                bill_date: billDate.toISOString().split('T')[0],
                account_id: selectedParty.id,
                payment_mode: paymentMode,
                remarks,
                items: processedItems
            };

            await createSale(payload);

            const printItems = rowsToProcess.map((r, i) => {
                return {
                    ...r,
                    item_name: r.company ? `${r.name} (${r.company})` : r.name
                };
            });

            const printPayload = {
                bill_no: billNo,
                bill_date: billDate,
                party_name: selectedParty.name,
                party_mobile: selectedParty.mobile,
                party_city: selectedParty.city,
                party_address: selectedParty.address,
                payment_mode: paymentMode,
                items: printItems,
                sub_total: total,
                grand_total: total,
                remarks
            };
            setPrintData(printPayload);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Sales Bill Saved!' });

            setTimeout(() => {
                const proceed = window.confirm("Bill Saved! Do you want to print?");
                if (proceed) {
                    handlePrintTrigger();
                }
                setBillNo(`SB-${Date.now()}`);
                setRows([{ id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }]);
                setSelectedParty(null);
                setPaymentMode('Cash');
                loadMasters();
            }, 500);

        } catch (error) {
            console.error(error);
            const msg = error.message || error.response?.data?.message || 'Failed to save bill';
            toast.current.show({ severity: 'error', summary: 'Error', detail: msg });
        }
    };

    const handleQuickAdd = async () => {
        if (!newItem.name) return;
        try {
            const payload = {
                ...newItem,
                code: 'QA-' + Math.floor(Math.random() * 1000),
                gst_percent: 0,
                stock: newItem.stock || 0
            };
            const response = await createItem(payload);
            const newId = response.data?.id || response.id;

            if (!newId) console.warn("New ID not found in response", response);

            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Item Added Successfully' });
            setShowQuickAdd(false);

            const addedItem = { ...payload, id: newId };
            setProductList(prev => [...prev, addedItem]);

            let targetIndex = rows.findIndex(r => !r.item_id);
            let updatedRows = [...rows];

            if (targetIndex === -1) {
                targetIndex = updatedRows.length;
                updatedRows.push({ id: updatedRows.length + 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' });
            }

            const row = updatedRows[targetIndex];
            row.item_id = newId;
            row.name = addedItem.name;
            row.company = addedItem.company;
            row.unit = addedItem.unit;
            row.rate = parseFloat(addedItem.sales_rate) || 0;
            row.amount = (parseFloat(row.qty) || 0) * row.rate;
            setRows(updatedRows);

            setNewItem({ name: '', company: '', unit: 'Nos', sales_rate: 0, purchase_rate: 0, stock: 0 });
            loadMasters();
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to add item' });
        }
    };

    // Table Templates
    const itemTemplate = (rowData, { rowIndex }) => {
        return (
            <Dropdown
                id={`item_${rowIndex}`}
                inputId={`item_input_${rowIndex}`}
                name={`item_${rowIndex}`}
                value={itemOptions.find(p => p.id === rowData.item_id) || rowData.name}
                options={itemOptions}
                optionLabel="label"
                itemTemplate={(option) => (
                    <div className="flex align-items-center gap-2">
                        <span className="font-semibold text-primary">[{option.code}]</span>
                        <span>{option.name}</span>
                        {option.company && <span className="text-500 text-sm">({option.company})</span>}
                        <span className="text-sm text-green-600 ml-auto font-medium">Stock: {option.stock || 0}</span>
                    </div>
                )}
                onChange={(e) => handleRowChange(rowIndex, 'item_id', e.value)}
                placeholder="Item Name (Search)"
                filter
                filterBy="name,code,company,label"
                editable
                className="w-full"
                appendTo={document.body}
                emptyMessage="Item not found. Type to add new."
                emptyFilterMessage="No results found"
                tooltip="Select valid item or type new name"
            />
        );
    };

    const qtyTemplate = (rowData, { rowIndex }) => {
        return (
            <InputNumber
                id={`qty_${rowIndex}`}
                inputId={`qty_input_${rowIndex}`}
                name={`qty_${rowIndex}`}
                value={rowData.qty}
                onValueChange={(e) => handleRowChange(rowIndex, 'qty', e.value)}
                min={0}
                mode="decimal"
                minFractionDigits={0}
                className="w-full"
                inputClassName="text-right"
            />
        );
    };

    const rateTemplate = (rowData, { rowIndex }) => {
        return (
            <InputNumber
                id={`rate_${rowIndex}`}
                inputId={`rate_input_${rowIndex}`}
                name={`rate_${rowIndex}`}
                value={rowData.rate}
                onValueChange={(e) => handleRowChange(rowIndex, 'rate', e.value)}
                min={0}
                mode="decimal"
                minFractionDigits={2}
                className="w-full"
                inputClassName="text-right"
            />
        );
    };

    const amountTemplate = (rowData) => {
        return <div className="font-bold text-gray-900">{parseFloat(rowData.amount).toFixed(2)}</div>;
    };

    const actionTemplate = (rowData) => (
        <Button icon="pi pi-trash" rounded text severity="danger" size="small" onClick={() => removeRow(rowData)} tooltip="Remove Row" />
    );

    return (
        <div className="flex flex-column gap-3 max-w-full fadein animation-duration-500">
            <Toast ref={toast} />

            {/* Top Bar */}
            <div className="flex justify-content-between align-items-center surface-card p-3 border-round shadow-1">
                <div className="flex align-items-center gap-3">
                    <div className="bg-indigo-100 p-2 border-round">
                        <i className="pi pi-receipt text-2xl text-primary"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold m-0 text-900">New Sales Invoice</h1>
                        <span className="text-500 text-sm">Create bill for farmer/customer</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="Reset" icon="pi pi-refresh" outlined severity="secondary" size="small" onClick={loadMasters} />
                    <Button label="Clear" icon="pi pi-eraser" outlined severity="danger" size="small" onClick={handleClear} />
                </div>
            </div>

            <div className="grid">
                {/* Left Column: Customer & Details */}
                <div className="col-12 lg:col-8">
                    <div className="flex flex-column gap-3 h-full">
                        {/* Customer Card */}
                        <div className="surface-card p-4 border-round shadow-1 h-full">
                            <h2 className="text-lg font-bold mb-4 text-900 border-bottom-1 border-200 pb-2">Customer Details</h2>
                            <div className="grid p-fluid">
                                <div className="col-12 md:col-6">
                                    <label className="font-medium mb-2 block text-700" htmlFor="farmer_select">
                                        <i className="pi pi-user mr-2 text-primary"></i>Select Farmer / Customer
                                    </label>
                                    <Dropdown
                                        inputId="farmer_select"
                                        name="farmer_select"
                                        value={selectedParty}
                                        options={parties.filter(p => p.group_id === 1)}
                                        optionLabel="name"
                                        onChange={(e) => setSelectedParty(e.value)}
                                        placeholder="Search Farmer..."
                                        filter
                                        showClear
                                        className="w-full"
                                        itemTemplate={(option) => (
                                            <div className="flex align-items-center gap-2">
                                                <i className="pi pi-user text-primary"></i>
                                                <span className="font-medium">{option.name}</span>
                                                <span className="text-500 text-sm ml-auto">{option.mobile || ''}</span>
                                            </div>
                                        )}
                                    />
                                    {selectedParty && (
                                        <div className="mt-3 flex gap-3 text-sm">
                                            <span className="bg-green-50 text-green-700 px-2 py-1 border-round font-medium">
                                                <i className="pi pi-phone mr-1 text-xs"></i> {selectedParty.mobile || 'No Mobile'}
                                            </span>
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 border-round font-medium">
                                                <i className="pi pi-map-marker mr-1 text-xs"></i> {selectedParty.city || 'No City'}
                                            </span>
                                            <span className={`px-2 py-1 border-round font-medium ${selectedParty.balance > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                <i className="pi pi-wallet mr-1 text-xs"></i> Bal: ₹{parseFloat(selectedParty.balance || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="col-12 md:col-3">
                                    <label className="font-medium mb-2 block text-700" htmlFor="bill_no_input">Bill No</label>
                                    <InputText id="bill_no_input" name="bill_no_input" value={billNo} disabled className="bg-gray-100 font-bold text-900" />
                                </div>
                                <div className="col-12 md:col-3">
                                    <label className="font-medium mb-2 block text-700" htmlFor="bill_date_input">Date</label>
                                    <Calendar inputId="bill_date_input" name="bill_date_input" value={billDate} onChange={(e) => setBillDate(e.value)} showIcon dateFormat="dd/mm/yy" className="w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment & Summary Preview */}
                <div className="col-12 lg:col-4">
                    <div className="surface-card p-4 border-round shadow-1 h-full flex flex-column justify-content-between">
                        <div>
                            <h2 className="text-lg font-bold mb-4 text-900 border-bottom-1 border-200 pb-2">Payment Details</h2>
                            <div className="flex flex-column gap-3">
                                <div>
                                    <span className="font-medium mb-2 block text-700">Payment Mode</span>
                                    <div className="flex p-selectbutton-row gap-2">
                                        <Button
                                            label="CASH"
                                            icon="pi pi-money-bill"
                                            className={`flex-1 ${paymentMode === 'Cash' ? 'bg-green-500 border-green-500' : 'p-button-outlined p-button-secondary'}`}
                                            onClick={() => setPaymentMode('Cash')}
                                        />
                                        <Button
                                            label="DEBIT"
                                            icon="pi pi-id-card"
                                            className={`flex-1 ${paymentMode === 'Debit' ? 'bg-orange-500 border-orange-500' : 'p-button-outlined p-button-secondary'}`}
                                            onClick={() => setPaymentMode('Debit')}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="font-medium mb-2 block text-700" htmlFor="remarks_input">Remarks</label>
                                    <InputText id="remarks_input" name="remarks_input" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Note..." className="w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Grid - Full Width */}
            <div className="surface-card p-4 border-round shadow-1">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h2 className="text-lg font-bold m-0 text-900">Items List</h2>
                    <Button label="Add Item" icon="pi pi-plus" size="small" onClick={addRow} />
                </div>

                <DataTable value={rows} dataKey="id" size="small" showGridlines stripedRows className="p-datatable-sm vertical-align-middle">
                    <Column header="#" body={(d, { rowIndex }) => <span className="text-500">{rowIndex + 1}</span>} style={{ width: '3rem', textAlign: 'center' }} />
                    <Column header="Product Name" body={itemTemplate} style={{ minWidth: '300px' }} />
                    <Column header="Unit" field="unit" style={{ width: '100px' }} />
                    <Column header="Qty" body={qtyTemplate} style={{ width: '120px' }} />
                    <Column header="Rate" body={rateTemplate} style={{ width: '150px' }} />
                    <Column header="Amount" body={amountTemplate} className="text-right bg-gray-50" style={{ width: '150px' }} />
                    <Column body={actionTemplate} style={{ width: '50px', textAlign: 'center' }} />
                </DataTable>
            </div>

            {/* Bottom Floating Bar for Totals */}
            <div className="fixed bottom-0 left-0 right-0 surface-card p-3 shadow-8 border-top-1 border-200 z-5 flex flex-column md:flex-row justify-content-between align-items-center gap-3">
                <div className="flex gap-4 align-items-center">
                    <div className="text-right">
                        <span className="block text-500 text-xs uppercase font-semibold">Total Qty</span>
                        <span className="font-bold text-lg">{rows.reduce((sum, r) => sum + (parseFloat(r.qty) || 0), 0)}</span>
                    </div>
                    <div className="text-right pl-4 border-left-1 border-300">
                        <span className="block text-500 text-xs uppercase font-semibold">Total Amount</span>
                        <span className="text-2xl font-bold text-primary">₹ {calculateTotal().toFixed(2)}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="Save & Print" icon="pi pi-print" size="large" onClick={handleSave} className="px-4 border-round-3xl" />
                    <Button icon="pi pi-file-pdf" rounded outlined severity="secondary" onClick={handleDownloadPdf} tooltip="Download PDF" disabled={!printData} />
                </div>
            </div>

            {/* Print Component (Hidden) */}
            <div style={{ display: 'none' }}>
                <SalesPrint ref={printRef} data={printData} />
            </div>

            {/* Quick Add Dialog */}
            <Dialog header="Quick Add New Item" visible={showQuickAdd} onHide={() => setShowQuickAdd(false)} style={{ width: '400px' }} className="p-fluid">
                <div className="field">
                    <label htmlFor="qa_name">Item Name</label>
                    <InputText id="qa_name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} autoFocus />
                </div>
                <div className="field">
                    <label htmlFor="qa_company">Company</label>
                    <InputText id="qa_company" value={newItem.company} onChange={(e) => setNewItem({ ...newItem, company: e.target.value })} />
                </div>
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="qa_unit">Unit</label>
                        <Dropdown id="qa_unit" value={newItem.unit} options={['Nos', 'Kg', 'Box', 'Ltr']} onChange={(e) => setNewItem({ ...newItem, unit: e.value })} />
                    </div>
                    <div className="field col">
                        <label htmlFor="qa_rate">Rate</label>
                        <InputNumber id="qa_rate" value={newItem.sales_rate} onValueChange={(e) => setNewItem({ ...newItem, sales_rate: e.value })} mode="decimal" />
                    </div>
                </div>
                <Button label="Add Item" icon="pi pi-check" onClick={handleQuickAdd} />
            </Dialog>

            {/* Spacer for Bottom Bar */}
            <div className="h-6rem w-full"></div>
        </div>
    );
};

export default SalesBill;
