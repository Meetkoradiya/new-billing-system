import React, { useEffect, useState, useRef } from 'react';
import { getAccounts, createAccount, deleteAccount } from '../services/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

const CompanyMaster = () => {
    const [companies, setCompanies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        group_id: 2, // 2 = Company/Supplier
        address: '',
        city: '',
        mobile: '',
        gst_number: ''
    });
    const toast = useRef(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await getAccounts();
            // Filter strictly for companies (group_id === 2)
            const companyList = response.data.filter(acc => acc.group_id === 2);
            setCompanies(companyList);
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch companies' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.current.show({ severity: 'warn', summary: 'Warning', detail: 'Company Name is required' });
            return;
        }

        try {
            await createAccount(formData);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Company Added Successfully' });
            setShowForm(false);
            setFormData({ name: '', group_id: 2, address: '', city: '', mobile: '', gst_number: '' });
            fetchCompanies();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error creating company';
            toast.current.show({ severity: 'error', summary: 'Error', detail: msg });
        }
    };

    const dialogFooter = (
        <div>
            <Button label="Cancel" icon="pi pi-times" onClick={() => setShowForm(false)} className="p-button-text" />
            <Button label="Save Company" icon="pi pi-check" onClick={handleSubmit} autoFocus />
        </div>
    );

    const handleDelete = async (rowData) => {
        if (window.confirm(`Are you sure you want to delete ${rowData.name}?`)) {
            try {
                await deleteAccount(rowData.id);
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Company Deleted' });
                fetchCompanies();
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
                <h2 className="text-xl font-bold m-0 font-heading">Company / Supplier Management</h2>
                <Button label="Add New Company" icon="pi pi-building" severity="info" onClick={() => setShowForm(true)} />
            </div>

            <DataTable value={companies} loading={loading} paginator rows={10} stripedRows showGridlines tableStyle={{ minWidth: '50rem' }}>
                <Column field="name" header="Company Name" sortable></Column>
                <Column field="gst_number" header="GST Number" sortable></Column>
                <Column field="mobile" header="Contact No" sortable></Column>
                <Column field="city" header="City" sortable></Column>
                <Column field="address" header="Address"></Column>
                <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '4rem' }}></Column>
            </DataTable>

            <Dialog header="Add New Company" visible={showForm} style={{ width: '450px' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }} onHide={() => setShowForm(false)} footer={dialogFooter}>
                <div className="flex flex-column gap-3">
                    <div className="flex flex-column gap-2">
                        <label htmlFor="compName" className="font-bold">Company Name</label>
                        <InputText id="compName" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} autoFocus placeholder="Enter company name" />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="compGst" className="font-bold">GST Number</label>
                        <InputText id="compGst" value={formData.gst_number} onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })} placeholder="Enter GSTIN" />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="compMobile" className="font-bold">Contact Number</label>
                        <InputText id="compMobile" keyfilter="int" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="Phone/Mobile" />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="compCity" className="font-bold">City</label>
                        <InputText id="compCity" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" />
                    </div>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="compAddress" className="font-bold">Address</label>
                        <InputText id="compAddress" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default CompanyMaster;
