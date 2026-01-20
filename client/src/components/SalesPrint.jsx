import React, { forwardRef } from 'react';
import '../index.css'; // Ensure styles are available

const SalesPrint = forwardRef(({ data }, ref) => {
    if (!data) return null;

    const { bill_no, bill_date, party_name, items, sub_total, grand_total, remarks } = data;

    // Helper to convert number to words (Indian numbering system simplified)
    const numberToWords = (num) => {
        // Basic implementation or placeholder
        return num ? `${num} Only` : '';
    };

    return (
        <div ref={ref} className="p-4" style={{ fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: '#fff' }}>
            {/* Header */}
            <div className="flex justify-content-between align-items-center mb-4 border-bottom-1 pb-3">
                <div>
                    <h1 className="m-0 text-3xl font-bold text-primary">AGRO TALLY</h1>
                    <p className="m-0 text-sm text-600">Smart Billing Solution</p>
                    <p className="m-0 text-sm">123, Market Yard, City Name - 360001</p>
                    <p className="m-0 text-sm">Mo: 98765 43210</p>
                </div>
                <div className="text-right">
                    <h2 className="m-0 text-xl font-bold">TAX INVOICE</h2>
                    <p className="m-0 font-bold">Bill No: {bill_no}</p>
                    <p className="m-0">Date: {new Date(bill_date).toLocaleDateString('en-IN')}</p>
                </div>
            </div>

            {/* Parties */}
            <div className="flex justify-content-between mb-4">
                <div className="border-1 p-3 border-round w-6 mr-2">
                    <p className="font-bold mb-1">Billed To (Party/Farmer):</p>
                    <h3 className="m-0 text-lg">{party_name}</h3>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-4" style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr className="bg-blue-50">
                        <th className="border-1 p-2 text-left">#</th>
                        <th className="border-1 p-2 text-left">Item Name</th>
                        <th className="border-1 p-2 text-right">Qty</th>
                        <th className="border-1 p-2 text-right">Rate</th>
                        <th className="border-1 p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td className="border-1 p-2">{index + 1}</td>
                            <td className="border-1 p-2">{item.item_name}</td>
                            <td className="border-1 p-2 text-right">{item.qty} {item.unit}</td>
                            <td className="border-1 p-2 text-right">{parseFloat(item.rate).toFixed(2)}</td>
                            <td className="border-1 p-2 text-right font-bold">{parseFloat(item.amount).toFixed(2)}</td>
                        </tr>
                    ))}
                    {/* Fill empty rows if needed for layout height */}
                    {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
                        <tr key={`empty-${i}`}>
                            <td className="border-1 p-2">&nbsp;</td>
                            <td className="border-1 p-2"></td>
                            <td className="border-1 p-2"></td>
                            <td className="border-1 p-2"></td>
                            <td className="border-1 p-2"></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-content-end mb-4">
                <div className="w-5">
                    <div className="flex justify-content-between mb-1">
                        <span>Sub Total:</span>
                        <span className="font-bold">{parseFloat(sub_total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-content-between mb-1 border-bottom-1 pb-1">
                        <span>Tax (0%):</span>
                        <span>0.00</span>
                    </div>
                    <div className="flex justify-content-between text-xl font-bold mt-2">
                        <span>Grand Total:</span>
                        <span>₹ {parseFloat(grand_total).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-top-1 text-center text-sm text-600">
                <p>{remarks ? `Remarks: ${remarks}` : 'Thank you for your business!'}</p>
                <p className="mt-4">Authorized Signature</p>
            </div>
        </div>
    );
});

export default SalesPrint;
