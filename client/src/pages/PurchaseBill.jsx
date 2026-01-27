import React, { useState, useEffect, useRef } from 'react';
import { getAccounts, getItems, createPurchase, createItem } from '../services/api';
import { useReactToPrint } from 'react-to-print';
import PurchasePrint from '../components/PurchasePrint';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// PrimeReact Imports
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';

const PurchaseBill = () => {
    // Master Data
    const [parties, setParties] = useState([]);
    const [productList, setProductList] = useState([]);

    // Form Data
    const [billNo, setBillNo] = useState('');
    const [billDate, setBillDate] = useState(new Date());
    const [selectedParty, setSelectedParty] = useState(null);
    const [remarks, setRemarks] = useState('');

    // Quick Add Item
    const [showItemDialog, setShowItemDialog] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        company: '',
        category: 'Pesticide',
        code: '',
        unit: 'Nos',
        purchase_rate: 0,
        gst_percent: 0,
        stock: 0
    });

    // Print Data
    const [printData, setPrintData] = useState(null);
    const printRef = useRef();
    const toast = useRef(null);

    // Grid Data
    const [rows, setRows] = useState([
        { id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }
    ]);

    useEffect(() => {
        loadMasters();
    }, []);

    const [errorMsg, setErrorMsg] = useState(null);

    const loadMasters = async () => {
        setErrorMsg(null);
        try {
            const accRes = await getAccounts();
            if (accRes.data) {
                setParties(accRes.data);
            }
        } catch (error) {
            console.error('Error loading parties:', error);
            setErrorMsg(`Failed to load parties: ${error.message}`);
        }

        try {
            const itemRes = await getItems();
            if (itemRes.data) {
                setProductList(itemRes.data);
            }
        } catch (error) {
            console.error('Error loading items:', error);
            // Don't block UI if just items fail, but maybe warn
        }

        if (!billNo) setBillNo(`PB-${Math.floor(Math.random() * 10000)}`);
    };

    const handleRowChange = (index, field, value) => {
        setRows(prevRows => {
            return prevRows.map((row, i) => {
                if (i !== index) return row;

                const updatedRow = { ...row, [field]: value };

                // Logic for item selection
                if (field === 'item_id') {
                    const item = productList.find(p => p.id === value);
                    if (item) {
                        updatedRow.rate = item.purchase_rate;
                        updatedRow.unit = item.unit;
                        updatedRow.name = item.name;
                    }
                }

                // Calc Amount
                if (field === 'qty' || field === 'rate' || field === 'item_id') {
                    const qty = parseFloat(updatedRow.qty) || 0;
                    const rate = parseFloat(updatedRow.rate) || 0;
                    updatedRow.amount = qty * rate;
                }

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
        setRows(prevRows => {
            if (prevRows.length === 1) {
                // Don't allow empty list, just reset the last row
                return [{ id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }];
            }
            return prevRows.filter(r => r.id !== rowData.id);
        });
    };

    const calculateTotal = () => {
        return rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    };

    const handlePrintTrigger = useReactToPrint({
        content: () => printRef.current,
    });

    const handleDownloadPdf = async () => {
        if (!printData) return toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Save the bill first' });

        try {
            const element = printRef.current;
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`PurchaseBill_${billNo}.pdf`);
        } catch (error) {
            console.error('PDF Download Error:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to download PDF' });
        }
    };

    const handleSave = async () => {
        if (!selectedParty) {
            toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Select Supplier / Company' });
            return;
        }
        const validRows = rows.filter(r => r.item_id);
        if (validRows.length === 0) {
            toast.current.show({ severity: 'warn', summary: 'Missing Info', detail: 'Add at least one valid item' });
            return;
        }

        try {
            const total = calculateTotal();
            const payload = {
                bill_no: billNo,
                bill_date: billDate.toISOString().split('T')[0],
                account_id: selectedParty.id,
                remarks,
                items: validRows.map(r => ({
                    item_id: r.item_id,
                    qty: r.qty,
                    rate: r.rate,
                    amount: r.amount
                }))
            };

            await createPurchase(payload);

            // Prepare Print Data
            const printPayload = {
                bill_no: billNo,
                bill_date: billDate,
                party_name: selectedParty.name,
                items: rows.filter(r => r.item_id).map(r => ({
                    ...r,
                    item_name: r.name
                })),
                grand_total: total,
                remarks
            };
            setPrintData(printPayload);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Purchase Bill Saved!' });

            // Wait for state to update then print
            setTimeout(() => {
                const proceed = window.confirm("Bill Saved! Do you want to print?");
                if (proceed) {
                    handlePrintTrigger();
                }
                // Reset
                setBillNo(`PB-${Math.floor(Math.random() * 10000)}`);
                setRows([{ id: 1, item_id: '', qty: 1, rate: 0, amount: 0, unit: '', name: '' }]);
                setSelectedParty(null);
            }, 500);

        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to save bill' });
        }
    };

    // Quick Item Save
    const handleSaveItem = async () => {
        try {
            await createItem(newItem);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Product Added Successfully' });
            setShowItemDialog(false);
            setNewItem({ name: '', company: '', category: 'Pesticide', code: '', unit: 'Nos', purchase_rate: 0, gst_percent: 0, stock: 0 });
            loadMasters(); // Refresh list
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to create item' });
        }
    };

    // Table Templates
    const itemTemplate = (rowData, { rowIndex }) => {
        return (
            <div className="flex gap-2">
                <Dropdown
                    id={`pb_item_${rowIndex}`}
                    inputId={`pb_item_input_${rowIndex}`}
                    name={`pb_item_${rowIndex}`}
                    aria-label="Select Item"
                    value={rowData.item_id}
                    options={productList}
                    optionLabel="name"
                    optionValue="id"
                    onChange={(e) => handleRowChange(rowIndex, 'item_id', e.value)}
                    placeholder="Select Item"
                    filter
                    className="w-full"
                />
            </div>
        );
    };

    const qtyTemplate = (rowData, { rowIndex }) => {
        return (
            <InputNumber
                id={`pb_qty_${rowIndex}`}
                inputId={`pb_qty_input_${rowIndex}`}
                name={`pb_qty_${rowIndex}`}
                aria-label="Quantity"
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
                id={`pb_rate_${rowIndex}`}
                inputId={`pb_rate_input_${rowIndex}`}
                name={`pb_rate_${rowIndex}`}
                aria-label="Rate"
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
        return parseFloat(rowData.amount).toFixed(2);
    };

    const actionTemplate = (rowData) => {
        return <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => removeRow(rowData)} />;
    };

    const dialogFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setShowItemDialog(false)} className="p-button-text" />
            <Button label="Save Product" icon="pi pi-check" onClick={handleSaveItem} autoFocus />
        </div>
    );

    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-2xl font-bold m-0">Purchase Entry</h2>
                <Button icon="pi pi-refresh" rounded text aria-label="Refresh" onClick={loadMasters} tooltip="Reload Data" />
            </div>

            {errorMsg && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{errorMsg}</p>
                </div>
            )}

            <div className="grid p-fluid">
                <div className="col-12 md:col-4">
                    <label htmlFor="pb_billNo" className="block mb-2 font-bold">Purchase Bill No</label>
                    <InputText id="pb_billNo" name="pb_billNo" value={billNo} onChange={(e) => setBillNo(e.target.value)} />
                </div>
                <div className="col-12 md:col-4">
                    <label htmlFor="pb_billDate" className="block mb-2 font-bold">Bill Date</label>
                    <Calendar inputId="pb_billDate" name="pb_billDate" value={billDate} onChange={(e) => setBillDate(e.value)} showIcon />
                </div>
                <div className="col-12 md:col-4">
                    <label htmlFor="pb_party" className="block mb-2 font-bold">
                        Company / Supplier
                        <span className="text-secondary font-normal ml-2 text-sm">
                            (Available: {parties.filter(p => p.group_id == 2).length})
                        </span>
                    </label>
                    <Dropdown
                        inputId="pb_party"
                        name="pb_party"
                        value={selectedParty}
                        options={parties.filter(p => p.group_id == 2)}
                        optionLabel="name"
                        onChange={(e) => setSelectedParty(e.value)}
                        placeholder="Select Company (Supplier)"
                        filter
                        className="w-full"
                        itemTemplate={(option) => (
                            <div className="flex align-items-center justify-content-between">
                                <span>{option.name}</span>
                                <span className={`text-sm font-bold ${option.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {Math.abs(option.balance || 0).toFixed(2)} {option.balance > 0 ? 'Cr' : 'Dr'}
                                </span>
                            </div>
                        )}
                    />
                    {selectedParty && (
                        <div className="mt-2 text-right">
                            <span className="text-sm bg-gray-100 p-1 border-round">
                                Current Bal: <span className={`font-bold ${selectedParty.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    ₹{Math.abs(selectedParty.balance || 0).toFixed(2)} {selectedParty.balance > 0 ? 'Cr (Payable)' : 'Dr (Advance)'}
                                </span>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <DataTable value={rows} className="mt-4" stripedRows>
                <Column header="Item Name" body={itemTemplate} style={{ width: '40%' }}></Column>
                <Column field="unit" header="Unit" style={{ width: '10%' }}></Column>
                <Column header="Qty" body={qtyTemplate} style={{ width: '15%' }}></Column>
                <Column header="Rate" body={rateTemplate} style={{ width: '15%' }}></Column>
                <Column field="amount" header="Amount" body={amountTemplate} className="text-right font-bold" style={{ width: '15%' }}></Column>
                <Column body={actionTemplate} style={{ width: '5%' }}></Column>
            </DataTable>

            <div className="flex align-items-center mt-3 gap-2">
                <Button label="Add Item" icon="pi pi-plus" onClick={addRow} severity="secondary" />
                <Button label="New Product" icon="pi pi-box" onClick={() => setShowItemDialog(true)} severity="info" outlined />
            </div>

            <div className="flex justify-content-end mt-4">
                <Card className="w-12 md:w-4 surface-50">
                    <div className="flex justify-content-between pt-3 border-top-1 border-300">
                        <span className="text-xl font-bold">Grand Total:</span>
                        <span className="text-xl font-bold text-primary">{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <Button label="Save Purchase" icon="pi pi-save" onClick={handleSave} severity="success" className="flex-1" />
                        <Button label="Download PDF" icon="pi pi-download" onClick={handleDownloadPdf} severity="secondary" className="flex-1" disabled={!printData} />
                    </div>
                </Card>
            </div>

            {/* Quick Add Dialog */}
            <Dialog header="Add New Product" visible={showItemDialog} style={{ width: '40vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setShowItemDialog(false)} footer={dialogFooter} onShow={() => {
                if (selectedParty && !newItem.company) {
                    setNewItem(prev => ({ ...prev, company: selectedParty.name }));
                }
            }}>
                <div className="col-12">
                    <label htmlFor="pd_name" className="block mb-2 font-medium">Item Name</label>
                    <InputText id="pd_name" name="pd_name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} autoFocus />
                </div>
                <div className="col-12">
                    <label htmlFor="pd_company" className="block mb-2 font-medium">Company / Brand</label>
                    <Dropdown
                        inputId="pd_company"
                        name="pd_company"
                        value={newItem.company}
                        options={parties.filter(p => p.group_id === 2)}
                        optionLabel="name"
                        optionValue="name"
                        onChange={(e) => setNewItem({ ...newItem, company: e.value })}
                        placeholder="Select Company"
                        editable
                        filter
                        className="w-full"
                    />
                </div>
                <div className="col-6">
                    <label htmlFor="pd_category" className="block mb-2 font-medium">Category</label>
                    <Dropdown inputId="pd_category" name="pd_category" value={newItem.category} options={['Pesticide', 'Seeds']} onChange={(e) => setNewItem({ ...newItem, category: e.value })} placeholder="Select Category" />
                </div>
                <div className="col-6">
                    <label htmlFor="pd_unit" className="block mb-2 font-medium">Unit</label>
                    <Dropdown inputId="pd_unit" name="pd_unit" value={newItem.unit} options={['Nos', 'Kg', 'Ltr', 'Box', 'Bag']} onChange={(e) => setNewItem({ ...newItem, unit: e.value })} placeholder="Select Unit" />
                </div>
                <div className="col-12">
                    <label htmlFor="pd_purchase_rate" className="block mb-2 font-medium">Purchase Rate</label>
                    <InputNumber inputId="pd_purchase_rate" name="pd_purchase_rate" value={newItem.purchase_rate} onValueChange={(e) => setNewItem({ ...newItem, purchase_rate: e.value })} mode="decimal" minFractionDigits={2} />
                </div>
                <div className="col-12">
                    <label htmlFor="pd_stock" className="block mb-2 font-medium">Opening Stock</label>
                    <InputNumber inputId="pd_stock" name="pd_stock" value={newItem.stock} onValueChange={(e) => setNewItem({ ...newItem, stock: e.value })} mode="decimal" minFractionDigits={2} />
                </div>
            </Dialog>

            {/* Debug Info: Remove in production */}
            <div className="mt-8 p-4 bg-gray-100 border-round text-xs font-mono text-gray-500">
                <p>Debug Info:</p>
                <p>Total Parties Loaded: {parties.length}</p>
                <p>Suppliers (Group 2): {parties.filter(p => p.group_id == 2).length}</p>
                <details>
                    <summary>Show Raw Data (First 1)</summary>
                    <pre>{JSON.stringify(parties.slice(0, 2), null, 2)}</pre>
                </details>
            </div>

            {/* 
                We place this fixed at 0,0 with negative z-index so it is "visible" to html2canvas 
                but hidden from the user. "visibility: hidden" causes blank screenshots.
            */}
            <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -1000, opacity: 0 }}>
                <PurchasePrint ref={printRef} data={printData} />
            </div>
        </div>
    );
};

export default PurchaseBill;
