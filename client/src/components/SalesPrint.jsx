import React, { forwardRef } from 'react';

// A4 Print Component for Sales
const SalesPrint = forwardRef(({ data }, ref) => {
    if (!data) return null;

    const { bill_no, bill_date, party_name, items, sub_total, grand_total, remarks } = data;

    return (
        <div ref={ref} className="print-container" style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: '#fff' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, fontSize: '30px', fontWeight: 'bold' }}>PURUSATH AGRO CENTER</h1>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>Main Market Yard, Shop No. 12, Amreli - 365601</p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>Mo: +91 98765 43210 | Email: contact@purusathagro.com</p>
                <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold' }}>GSTIN: 24ABCDE1234F1Z5</p>
            </div>

            {/* Bill Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', border: '1px solid #000', padding: '10px' }}>
                <div style={{ width: '60%' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}>Billed To:</p>
                    <h3 style={{ margin: '0', fontSize: '18px' }}>{party_name}</h3>
                    {/* Placeholder for standard customer fields if available in future */}
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Amreli, Gujarat</p>
                </div>
                <div style={{ width: '35%', textAlign: 'right', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
                    <p style={{ margin: '3px 0' }}><strong>Invoice No:</strong> <span style={{ color: 'red' }}>{bill_no}</span></p>
                    <p style={{ margin: '3px 0' }}><strong>Date:</strong> {new Date(bill_date).toLocaleDateString()}</p>
                    <p style={{ margin: '3px 0' }}><strong>Payment Mode:</strong> Cash/Credit</p>
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '14px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#eee', borderBottom: '1px solid #000', borderTop: '1px solid #000' }}>
                        <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #000', width: '5%' }}>Sr</th>
                        <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #000', width: '45%' }}>Product Description</th>
                        <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #000', width: '10%' }}>HSN</th>
                        <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #000', width: '10%' }}>Qty</th>
                        <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #000', width: '10%' }}>Rate</th>
                        <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #000', width: '20%' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items && items.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center' }}>{index + 1}</td>
                            <td style={{ padding: '8px', border: '1px solid #000' }}>{item.item_name || item.name}</td>
                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center' }}>-</td>
                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{item.qty} {item.unit}</td>
                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{parseFloat(item.rate).toFixed(2)}</td>
                            <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'right' }}>{parseFloat(item.amount).toFixed(2)}</td>
                        </tr>
                    ))}
                    {/* Fill empty rows to maintain layout consistency if needed */}
                </tbody>
            </table>

            {/* Summary Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                <div style={{ width: '40%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', borderBottom: '1px solid #ccc' }}>
                        <span>Sub Total:</span>
                        <span>₹{parseFloat(sub_total || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', borderBottom: '1px solid #ccc' }}>
                        <span>SGST (0%):</span>
                        <span>₹0.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', borderBottom: '1px solid #ccc' }}>
                        <span>CGST (0%):</span>
                        <span>₹0.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f9f9f9', border: '1px solid #000', marginTop: '10px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Grand Total:</span>
                        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>₹{parseFloat(grand_total || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ marginTop: '5px', fontSize: '12px', fontStyle: 'italic', textAlign: 'right' }}>
                        (Values in Rupees)
                    </div>
                </div>
            </div>

            {/* Footer Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ textDecoration: 'underline' }}>Terms & Conditions:</p>
                    <ul style={{ textAlign: 'left', fontSize: '12px', paddingLeft: '20px' }}>
                        <li>Goods once sold will not be taken back.</li>
                        <li>Subject to Amreli Jurisdiction.</li>
                    </ul>
                </div>
                <div style={{ textAlign: 'center', width: '250px' }}>
                    <p>For, Purusath Agro Center</p>
                    <br /><br /><br />
                    <p style={{ borderTop: '1px solid #000' }}>Authorised Signatory</p>
                </div>
            </div>
        </div>
    );
});

export default SalesPrint;
