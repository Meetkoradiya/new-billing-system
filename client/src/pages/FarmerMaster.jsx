import React, { useEffect, useState, useRef } from 'react';
import { getAccounts, createAccount, deleteAccount } from '../services/api'; // We can reuse getAccounts and filter client-side or add a query param later
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

const FarmerMaster = () => {
    const [farmers, setFarmers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        group_id: 1, // 1 = Farmer
        address: '',
        city: '',
        mobile: ''
    });
    const toast = useRef(null);

    useEffect(() => {
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        try {
            setLoading(true);
            const response = await getAccounts();
            // Filter strictly for farmers (group_id === 1)
            const farmerList = response.data.filter(acc => acc.group_id === 1);
            setFarmers(farmerList);
        } catch (error) {
            console.error('Error fetching farmers:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch farmers' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Name is required' });
            return;
        }

        try {
            await createAccount(formData);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Farmer Added Successfully' });
            setShowForm(false);
            setFormData({ name: '', group_id: 1, address: '', city: '', mobile: '' });
            fetchFarmers();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error creating farmer';
            toast.current.show({ severity: 'error', summary: 'Error', detail: msg });
        }
    };

    const dialogFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setShowForm(false)} className="p-button-text" />
            <Button label="Save Farmer" icon="pi pi-check" onClick={handleSubmit} autoFocus />
        </div>
    );

    const handleDelete = async (rowData) => {
        if (window.confirm(`Are you sure you want to delete ${rowData.name}?`)) {
            try {
                await deleteAccount(rowData.id);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Farmer Deleted' });
                fetchFarmers();
            } catch (error) {
                console.error(error);
                const msg = error.response?.data?.message || 'Delete failed';
                toast.current.show({ severity: 'error', summary: 'Error', detail: msg });
            }
        }
    };

    const actionBodyTemplate = (rowData) => {
        return <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Delete" onClick={() => handleDelete(rowData)} />;
    };

    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className="text-xl font-bold m-0 font-heading">Farmer Management</h2>
                <Button label="Add New Farmer" icon="pi pi-user-plus" severity="success" onClick={() => setShowForm(true)} />
            </div>

            <DataTable value={farmers} loading={loading} paginator rows={10} stripedRows showGridlines tableStyle={{ minWidth: '50rem' }}>
                <Column field="name" header="Farmer Name" sortable></Column>
                <Column field="city" header="Village / City" sortable></Column>
                <Column field="mobile" header="Mobile Number" sortable></Column>
                <Column field="address" header="Address"></Column>
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '4rem' }}></Column>
            </DataTable>

            <Dialog header="Add New Farmer" visible={showForm} style={{ width: '450px' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setShowForm(false)} footer={dialogFooter}>
                <div className="flex flex-column gap-3">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="farmerName" className="font-bold">Farmer Name</label>
                        <InputText id="farmerName" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus placeholder="Enter farmer name" />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="farmerCity" className="font-bold">Village / City</label>
                        <InputText id="farmerCity" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Enter village or city" />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="farmerMobile" className="font-bold">Mobile Number</label>
                        <InputText id="farmerMobile" keyfilter="int" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="Enter 10-digit mobile" />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="farmerAddress" className="font-bold">Address (Optional)</label>
                        <InputText id="farmerAddress" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default FarmerMaster;
