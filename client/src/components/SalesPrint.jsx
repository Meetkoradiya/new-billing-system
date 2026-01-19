import React, { forwardRef } from 'react';

// A4 Print Component for Sales
const SalesPrint = forwardRef(({ data }, ref) => {
    if (!data) return null;

    const { bill_no, bill_date, party_name, items, sub_total, grand_total, remarks } = data;
    const farmerName = party_name || "Karsanbhai Patel";
    const village = "Mota Varachha";
    const mobile = "9XXXXXXXXX";
    const discount = 0.00;
    const netTotal = grand_total;
    const paidAmount = grand_total;
    const balance = 0.00;

    return (
        <div ref={ref} className="print-container" style={{ padding: '40px', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: '#1f2937', backgroundColor: '#fff', width: '100%', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box' }}>

            {/* Main Border Container */}
            <div style={{ border: '2px solid #374151', padding: '0', borderRadius: '4px', overflow: 'hidden' }}>

                {/* Header Section */}
                <div style={{ padding: '24px', textAlign: 'center', borderBottom: '2px solid #374151', backgroundColor: '#f9fafb' }}>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', textTransform: 'uppercase', color: '#111827', letterSpacing: '1px' }}>Purusarth AGRO CENTER</h1>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sellers of Pesticides, Seeds & Pump Spare Parts</p>
                    <p style={{ margin: '0 0 2px 0', fontSize: '13px' }}>Opp. Kirti Pan, Ranjit Sagar Road, Jamnagar</p>
                    <p style={{ margin: '0 0 2px 0', fontSize: '13px' }}>Narotam Koradiya</p>
                    <p style={{ margin: '0', fontSize: '13px', fontWeight: 'bold' }}>Mo: 99252 59667</p>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'flex', borderBottom: '2px solid #374151' }}>
                    <div style={{ flex: '1', padding: '16px', borderRight: '1px solid #e5e7eb' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Billed To:</h3>
                        <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold' }}>{farmerName}</p>
                        <p style={{ margin: '0 0 2px 0', fontSize: '13px' }}>{village}</p>
                        <p style={{ margin: '0', fontSize: '13px' }}>Mo: {mobile}</p>
                    </div>
                    <div style={{ flex: '0 0 180px', padding: '16px', backgroundColor: '#f9fafb' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Invoice No.</span>
                            <span style={{ display: 'block', fontSize: '15px', fontWeight: 'bold' }}>{bill_no}</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Date</span>
                            <span style={{ display: 'block', fontSize: '14px', fontWeight: '500' }}>{new Date(bill_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f3f4f6', color: '#374151', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: '50px' }}>No.</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Item Description</th>
                            <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', width: '80px' }}>Qty</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', width: '100px' }}>Rate</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', width: '120px' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items && items.map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '10px 16px', color: '#6b7280' }}>{index + 1}</td>
                                <td style={{ padding: '10px 16px', fontWeight: '500' }}>{item.item_name || item.name}</td>
                                <td style={{ padding: '10px 16px', textAlign: 'center' }}>{item.qty} {item.unit}</td>
                                <td style={{ padding: '10px 16px', textAlign: 'right' }}>{parseFloat(item.rate).toFixed(2)}</td>
                                <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '600' }}>{parseFloat(item.amount).toFixed(2)}</td>
                            </tr>
                        ))}
                        {/* Minimum Rows Filler */}
                        {[...Array(Math.max(0, 10 - (items ? items.length : 0)))].map((_, i) => (
                            <tr key={`empty-${i}`} style={{ height: '38px', borderBottom: i === Math.max(0, 10 - (items ? items.length : 0)) - 1 ? 'none' : '1px solid #f9fafb' }}>
                                <td colSpan="5"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer Section */}
                <div style={{ display: 'flex', borderTop: '2px solid #374151' }}>
                    {/* Left Side: Summary & Slogan */}
                    <div style={{ flex: '1', padding: '16px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Amount in Words:</p>
                            <p style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: 'bold', fontStyle: 'italic' }}>{numberToWords(Math.round(netTotal))} Rupees Only</p>

                            <div style={{ fontSize: '12px', marginTop: '10px' }}>
                                <p style={{ margin: '2px 0' }}>Payment Mode: <strong>{data.payment_mode || 'Cash'}</strong></p>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#059669', fontSize: '14px' }}>💚 ખેતી એ દેશની શાન છે 💚</p>
                            <p style={{ margin: '0', fontSize: '11px', color: '#6b7280' }}>Thank You! Visit Again</p>
                        </div>
                    </div>

                    {/* Right Side: Totals & Signature */}
                    <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                <span style={{ color: '#4b5563' }}>Sub Total</span>
                                <span style={{ fontWeight: '500' }}>{parseFloat(sub_total || 0).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                <span style={{ color: '#4b5563' }}>Discount</span>
                                <span>{discount.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #d1d5db', fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
                                <span>Grand Total</span>
                                <span>₹{parseFloat(netTotal || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ padding: '16px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <div style={{ height: '40px' }}></div> {/* Space for signature */}
                            <p style={{ margin: '0', borderTop: '1px dashed #9ca3af', width: '80%', textAlign: 'center', paddingTop: '4px', fontSize: '11px', color: '#4b5563' }}>
                                For, Purusarth AGRO CENTER
                                <br />
                                <span style={{ fontSize: '10px', color: '#9ca3af' }}>Authorized Signatory</span>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
            <p style={{ textAlign: 'center', fontSize: '10px', color: '#9ca3af', marginTop: '10px' }}>This is a computer generated invoice.</p>
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
