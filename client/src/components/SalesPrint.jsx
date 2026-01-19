import React, { forwardRef } from 'react';

// A4 Print Component for Sales
const SalesPrint = forwardRef(({ data }, ref) => {
    if (!data) return null;

    const { bill_no, bill_date, party_name, items, sub_total, grand_total, remarks } = data;

    // Default to template values if data is missing for preview
    const farmerName = party_name || "Karsanbhai Patel";
    const village = "Mota Varachha"; // This would come from DB in a real scenario
    const mobile = "9XXXXXXXXX"; // This would come from DB in a real scenario
    const discount = 0.00; // Hardcoded as per current logic, can be dynamic later
    const netTotal = grand_total;
    const paidAmount = grand_total; // Assuming full payment for cash
    const balance = 0.00;

    return (
        <div ref={ref} className="print-container" style={{ padding: '20px', fontFamily: 'Courier New, monospace', color: '#000', backgroundColor: '#fff', width: '100%', maxWidth: '800px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase' }}>SHREE AGRO CENTER</h1>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Seeds • Fertilizer • Pesticides</p>
                <p style={{ margin: '0', fontSize: '14px' }}>Main Road, Village : Jetpur</p>
                <p style={{ margin: '2px 0', fontSize: '14px' }}>Mo : 98765 43210</p>
                <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
            </div>

            {/* Bill Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <div style={{ width: '60%' }}>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '80px', fontWeight: 'bold' }}>Bill No</td>
                                <td>: {bill_no}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Farmer</td>
                                <td>: {farmerName}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Village</td>
                                <td>: {village}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ width: '40%' }}>
                    <table style={{ width: '100%' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '60px', fontWeight: 'bold' }}>Date</td>
                                <td>: {new Date(bill_date).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 'bold' }}>Mobile</td>
                                <td>: {mobile}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px' }}></div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '14px' }}>
                <thead>
                    <tr style={{ textAlign: 'left' }}>
                        <th style={{ padding: '5px', borderBottom: '1px dashed #000', width: '5%' }}>No</th>
                        <th style={{ padding: '5px', borderBottom: '1px dashed #000', width: '50%' }}>Item Name</th>
                        <th style={{ padding: '5px', borderBottom: '1px dashed #000', textAlign: 'center', width: '10%' }}>Qty</th>
                        <th style={{ padding: '5px', borderBottom: '1px dashed #000', textAlign: 'right', width: '15%' }}>Rate</th>
                        <th style={{ padding: '5px', borderBottom: '1px dashed #000', textAlign: 'right', width: '20%' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items && items.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '5px' }}>{index + 1}</td>
                            <td style={{ padding: '5px' }}>{item.item_name || item.name}</td>
                            <td style={{ padding: '5px', textAlign: 'center' }}>{item.qty} {item.unit}</td>
                            <td style={{ padding: '5px', textAlign: 'right' }}>{parseFloat(item.rate).toFixed(2)}</td>
                            <td style={{ padding: '5px', textAlign: 'right' }}>{parseFloat(item.amount).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px' }}></div>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px', fontSize: '14px' }}>
                <div style={{ width: '50%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span>Sub Total :</span>
                        <span>{parseFloat(sub_total || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span>Discount :</span>
                        <span>{discount.toFixed(2)}</span>
                    </div>
                    <div style={{ borderBottom: '1px dashed #000', margin: '5px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontWeight: 'bold' }}>
                        <span>Net Total :</span>
                        <span>{parseFloat(netTotal || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px' }}></div>

            {/* Payment Info */}
            <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>Payment Mode : {data.payment_mode || 'Cash'}</span>
                    <span>Paid Amount : {parseFloat(paidAmount || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2px 0' }}>
                    <span>Balance : {balance.toFixed(2)}</span>
                </div>
            </div>

            <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px' }}></div>

            <div style={{ marginBottom: '20px', fontSize: '14px', fontStyle: 'italic' }}>
                <b>Amount in Words:</b> {numberToWords(Math.round(netTotal))} Rupees Only
            </div>

            {/* Footer Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', fontSize: '14px' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginTop: '30px', borderTop: '1px solid #000', width: '150px', margin: '30px auto 0 auto' }}>Receiver's Signature</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginTop: '30px', borderTop: '1px solid #000', width: '150px', margin: '30px auto 0 auto' }}>Authorized Signatory</p>
                </div>
            </div>

            <div style={{ borderBottom: '1px dashed #000', margin: '20px 0' }}></div>

            {/* Footer Slogan */}
            <div style={{ textAlign: 'center', fontSize: '14px' }}>
                <p style={{ margin: '5px 0', fontWeight: 'bold', color: 'green' }}>💚 ખેતી એ દેશની શાન છે 💚</p>
                <p style={{ margin: '5px 0' }}>Thank You! Visit Again</p>
            </div>
        </div>
    );
});

// Simple Number to Words Converter for Indian Currency
function numberToWords(num) {
    if (num === 0) return "Zero";

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const regex = /^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/;

    const getLT20 = (n) => a[Number(n)];
    const getGT20 = (n) => b[n[0]] + ' ' + a[n[1]];

    function num2words(n) {
        if (n < 20) return getLT20(n);
        if (n < 100) return getGT20(n.toString());
        if (n < 1000) return num2words(Math.floor(n / 100)) + 'Hundred ' + num2words(n % 100);
        if (n < 100000) return num2words(Math.floor(n / 1000)) + 'Thousand ' + num2words(n % 1000);
        if (n < 10000000) return num2words(Math.floor(n / 100000)) + 'Lakh ' + num2words(n % 100000);
        return num2words(Math.floor(n / 10000000)) + 'Crore ' + num2words(n % 10000000);
    }

    return num2words(num);
}

export default SalesPrint;
