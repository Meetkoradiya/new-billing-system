import React, { useEffect, useState } from 'react';
import { getItems, createItem, getAccounts, updateItemStock, deleteItem } from '../services/api'; // getAccounts added

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast'; // Added Toast

const ItemMaster = () => {
    const [items, setItems] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        category: '',
        code: '',
        unit: 'Nos',
        purchase_rate: 0,
        gst_percent: 0,
        stock: 0
    });

    // Stock Update State
    const [showStockDialog, setShowStockDialog] = useState(false);
    const [stockUpdateData, setStockUpdateData] = useState({ id: null, name: '', qty: 0 });
    const toast = React.useRef(null);

    useEffect(() => {
        fetchItems();
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await getAccounts();
            // Filter only Suppliers (group_id = 2)
            const supplierList = response.data.filter(acc => acc.group_id === 2);
            setCompanies(supplierList);
        } catch (error) {
            console.error('Error fetching companies:', error);
        }
    };

    const fetchItems = async () => {
        try {
            const response = await getItems();
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            await createItem(formData);
            setShowForm(false);
            setFormData({ name: '', company: '', category: '', code: '', unit: 'Nos', purchase_rate: 0, gst_percent: 0, stock: 0 });
            fetchItems();
        } catch (error) {
            alert('Error creating item');
        }
    };

    const handleStockUpdate = async () => {
        try {
            await updateItemStock(stockUpdateData.id, stockUpdateData.qty);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Stock Updated Successfully' });
            setShowStockDialog(false);
            setStockUpdateData({ id: null, name: '', qty: 0 });
            fetchItems();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to update stock' });
        }
    };

    const openStockDialog = (rowData) => {
        setStockUpdateData({ id: rowData.id, name: rowData.name, qty: 0 });
        setShowStockDialog(true);
    };

    const dialogFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setShowForm(false)} className="p-button-text" />
            <Button label="Save" icon="pi pi-check" onClick={handleSubmit} autoFocus />
        </div>
    );

    const stockDialogFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setShowStockDialog(false)} className="p-button-text" />
            <Button label="Update Stock" icon="pi pi-check" onClick={handleStockUpdate} autoFocus />
        </div>
    );

    const handleDelete = async (rowData) => {
        if (!window.confirm(`Are you sure you want to delete ${rowData.name}?`)) return;
        try {
            await deleteItem(rowData.id);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Item Deleted' });
            fetchItems();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete item';
            toast.current.show({ severity: 'error', summary: 'Error', detail: msg });
        }
    };

    const actionTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-plus" rounded outlined severity="success" tooltip="Add Stock" onClick={() => openStockDialog(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" tooltip="Delete Item" onClick={() => handleDelete(rowData)} />
            </div>
        );
    };

    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-xl font-bold m-0">Item Master</h2>
                <Button label="Add New Item" icon="pi pi-plus" onClick={() => setShowForm(true)} />
            </div>

            <DataTable value={items} paginator rows={10} stripedRows showGridlines tableStyle={{ minWidth: '50rem' }}>
                <Column field="code" header="Code" sortable></Column>
                <Column field="name" header="Item Name" sortable></Column>
                <Column field="company" header="Company" sortable></Column>
                <Column field="category" header="Category" sortable></Column>
                <Column field="unit" header="Unit" sortable></Column>
                <Column field="purchase_rate" header="Pur. Rate" sortable className="text-right"></Column>
                <Column field="stock" header="Stock" sortable className="text-right"></Column>
                <Column field="gst_percent" header="GST %" sortable className="text-right" body={(rowData) => `${rowData.gst_percent}%`}></Column>
                <Column body={actionTemplate} header="Add Stock" style={{ width: '10%' }}></Column>
            </DataTable>

            <Dialog header="Add New Product" visible={showForm} style={{ width: '50vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setShowForm(false)} footer={dialogFooter}>
                <div className="grid p-fluid">
                    <div className="col-12 md:col-6">
                        <label htmlFor="itemName" className="block mb-2 font-medium">Item Name</label>
                        <InputText id="itemName" name="itemName" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="itemCompany" className="block mb-2 font-medium">Company / Brand</label>
                        <Dropdown
                            inputId="itemCompany"
                            name="itemCompany"
                            value={formData.company}
                            options={companies}
                            optionLabel="name"
                            optionValue="name"
                            onChange={(e) => setFormData({ ...formData, company: e.value })}
                            placeholder="Select Company"
                            editable
                            filter
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label htmlFor="itemCategory" className="block mb-2 font-medium">Category</label>
                        <Dropdown
                            inputId="itemCategory"
                            name="itemCategory"
                            value={formData.category}
                            options={['Pesticide', 'Seeds']}
                            onChange={(e) => setFormData({ ...formData, category: e.value })}
                            placeholder="Select Category"
                        />
                    </div>
                    <div className="col-12 md:col-4">
                        <label htmlFor="itemCode" className="block mb-2 font-medium">Code / SKU</label>
                        <InputText id="itemCode" name="itemCode" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                    </div>
                    <div className="col-12 md:col-4">
                        <label htmlFor="itemUnit" className="block mb-2 font-medium">Unit</label>
                        <Dropdown
                            inputId="itemUnit"
                            name="itemUnit"
                            value={formData.unit}
                            options={['Nos', 'Kg', 'Ltr', 'Box', 'Bag']}
                            onChange={(e) => setFormData({ ...formData, unit: e.value })}
                            placeholder="Select Unit"
                        />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="itemPurchaseRate" className="block mb-2 font-medium">Purchase Rate</label>
                        <InputNumber inputId="itemPurchaseRate" name="itemPurchaseRate" value={formData.purchase_rate} onValueChange={(e) => setFormData({ ...formData, purchase_rate: e.value })} mode="decimal" minFractionDigits={2} />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="itemStock" className="block mb-2 font-medium">Opening Stock</label>
                        <InputNumber inputId="itemStock" name="itemStock" value={formData.stock} onValueChange={(e) => setFormData({ ...formData, stock: e.value })} mode="decimal" minFractionDigits={2} />
                    </div>
                    <div className="col-12 md:col-6">
                        <label htmlFor="itemGst" className="block mb-2 font-medium">GST %</label>
                        <Dropdown
                            inputId="itemGst"
                            name="itemGst"
                            value={formData.gst_percent}
                            options={[0, 5, 12, 18, 28]}
                            onChange={(e) => setFormData({ ...formData, gst_percent: e.value })}
                            placeholder="GST %"
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog header={`Add Stock: ${stockUpdateData.name}`} visible={showStockDialog} style={{ width: '30vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setShowStockDialog(false)} footer={stockDialogFooter}>
                <div className="grid p-fluid">
                    <div className="col-12">
                        <label htmlFor="stockQty" className="block mb-2 font-medium">Quantity to Add</label>
                        <InputNumber inputId="stockQty" name="stockQty" value={stockUpdateData.qty} onValueChange={(e) => setStockUpdateData({ ...stockUpdateData, qty: e.value })} mode="decimal" showButtons min={0} autoFocus />
                    </div>
                </div>
            </Dialog>
        </div >
    );
};

export default ItemMaster;
