
import React, { useRef, useState, useMemo } from 'react';
import { PropertyFile, Transaction } from '../types';
import { Download, Loader2, ArrowLeft, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Props {
  file: PropertyFile;
  onBack?: () => void;
}

const AccountStatement: React.FC<Props> = ({ file, onBack }) => {
  const statementRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const format = (v?: number | null) => {
    if (v === null || v === undefined || v === 0) return '-';
    return Math.round(v).toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const parseSAPDate = (dateStr: string) => {
    if (!dateStr || dateStr === '-' || dateStr === '' || dateStr === 'NULL') return null;
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return null;
      const day = parseInt(parts[0]);
      const monthStr = parts[1];
      let year = parseInt(parts[2]);
      if (year < 100) year += 2000;
      
      const months: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      const normalizedMonth = monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase().substring(0, 3);
      const month = months[normalizedMonth];
      if (month === undefined) return null;
      
      return new Date(year, month, day);
    } catch (e) { return null; }
  };

  // Grouping logic to handle multiple receipts per installment while keeping the SAP visual structure
  const groupedTransactions = useMemo(() => {
    const paymentPlan: Transaction[] = [];
    const others: Transaction[] = [];

    file.transactions.forEach(t => {
      if (t.u_intno > 0) paymentPlan.push(t);
      else others.push(t);
    });

    // Sort to ensure sequential order matches the PDF
    paymentPlan.sort((a, b) => a.u_intno - b.u_intno || (parseSAPDate(a.receipt_date || '')?.getTime() || 0) - (parseSAPDate(b.receipt_date || '')?.getTime() || 0));
    others.sort((a, b) => a.seq - b.seq);

    return { paymentPlan, others };
  }, [file.transactions]);

  const totals = useMemo(() => {
    let planRec = 0;
    let planReceived = 0;
    let planSurcharge = 0;
    let otherRec = 0;
    let otherReceived = 0;

    groupedTransactions.paymentPlan.forEach(t => {
      planRec += (t.receivable || 0);
      planReceived += (t.amount_paid || 0);
      planSurcharge += (t.surcharge || 0);
    });

    groupedTransactions.others.forEach(t => {
      otherRec += (t.receivable || 0);
      otherReceived += (t.amount_paid || 0);
    });

    const grandRec = planRec + otherRec;
    const grandReceived = planReceived + otherReceived;
    const grandBalance = Math.max(0, grandRec - grandReceived);

    return { planRec, planReceived, planSurcharge, otherRec, otherReceived, grandRec, grandReceived, grandBalance };
  }, [groupedTransactions]);

  const downloadPDF = async () => {
    if (!statementRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(statementRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        height: statementRef.current.scrollHeight,
        windowHeight: statementRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`DIN_Account_Statement_${file.fileNo}.pdf`);
    } catch (e) {
      alert('PDF generation failed.');
    } finally {
      setIsDownloading(false);
    }
  };

  const Logo = () => (
    <div className="flex items-start gap-2">
      <div className="flex flex-col items-center">
         <svg viewBox="0 0 100 100" className="w-10 h-10">
           <path fill="#0aa98f" d="M10,80 Q30,40 90,40 L90,60 Q30,60 10,100 Z" />
           <path fill="#6e6f72" d="M10,10 L30,10 L30,60 L10,60 Z" />
         </svg>
         <span className="text-[7px] font-black tracking-widest text-slate-500 mt-1">FAISALABAD</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[18px] font-bold leading-none text-slate-800">DIN GARDENS</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 overflow-x-hidden flex flex-col items-center bg-slate-50 min-h-screen pt-10">
      {/* Action Toolbar */}
      <div className="w-full max-w-[210mm] flex justify-between items-center px-4">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-2 p-3 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-2xl transition-all shadow-sm">
            <ArrowLeft size={18} /> <span className="text-xs font-black uppercase tracking-widest">Exit Preview</span>
          </button>
        )}
        <button onClick={downloadPDF} disabled={isDownloading} className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50 active:scale-95 transition-all">
          {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
          Print Official Ledger
        </button>
      </div>

      <div className="origin-top scale-[0.4] sm:scale-[0.6] md:scale-[0.8] lg:scale-100 min-w-[210mm]">
        <div 
          ref={statementRef} 
          className="bg-white p-10 w-[210mm] shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-slate-200" 
          style={{ fontFamily: 'Arial, sans-serif', color: '#000' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <Logo />
            <div className="text-center">
              <h1 className="text-[16px] font-bold">DIN Properties (Pvt.) Ltd.</h1>
              <h2 className="text-[18px] font-bold border-b-2 border-black inline-block px-10 pb-0.5 mt-2">Customer Account Statement</h2>
            </div>
            <div className="w-[120px]"></div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-[1.2fr_1fr] gap-x-12 mb-6">
            <div className="space-y-1 text-[11px]">
              <div className="grid grid-cols-[140px_1fr]"><span className="font-bold">Reg Date:</span> <span>{file.regDate}</span></div>
              <div className="grid grid-cols-[140px_1fr]"><span className="font-bold">Currency No:</span> <span>{file.currencyNo}</span></div>
              <div className="grid grid-cols-[140px_1fr]"><span className="font-bold">Plot Size:</span> <span>{file.plotSize}</span></div>
              <div className="grid grid-cols-[140px_1fr]"><span className="font-bold">Plot Value (PKR):</span> <span className="font-bold">{format(file.plotValue)}</span></div>
              <div className="grid grid-cols-[140px_1fr]"><span className="font-bold">Balance (PKR):</span> <span className="font-bold">{format(totals.grandBalance)}</span></div>
              <div className="grid grid-cols-[140px_1fr]"><span className="font-bold">OverDue (PKR):</span> <span className="font-bold">{format(file.overdue)}</span></div>
              <div className="grid grid-cols-[140px_1fr]"><span className="font-bold">Surcharge (PKR):</span> <span className="font-bold">{format(file.surcharge)}</span></div>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="grid grid-cols-[110px_1fr]"><span className="font-bold">File No:</span> <span className="font-bold">{file.fileNo}</span></div>
              <div className="grid grid-cols-[110px_1fr]"><span className="font-bold">Owner CNIC:</span> <span>{file.ownerCNIC}</span></div>
              <div className="grid grid-cols-[110px_1fr]"><span className="font-bold">Owner Name:</span> <span className="uppercase">{file.ownerName}</span></div>
              <div className="grid grid-cols-[110px_1fr]"><span className="font-bold">S/O, D/O, W/O:</span> <span className="uppercase">{file.fatherName}</span></div>
              <div className="grid grid-cols-[110px_1fr]"><span className="font-bold">Cell No:</span> <span>{file.cellNo}</span></div>
              <div className="grid grid-cols-[110px_1fr]"><span className="font-bold leading-tight">Address:</span> <span className="uppercase leading-tight text-[10px]">{file.address}</span></div>
            </div>
          </div>

          {/* Plot Details Row */}
          <div className="grid grid-cols-5 text-[10px] font-bold mb-4 border-b border-black pb-1 uppercase">
            <div>Plot No: {file.plotNo}</div>
            <div>Block: {file.block}</div>
            <div>Park: {file.park}</div>
            <div>Corner: {file.corner}</div>
            <div>MainBoulevard: {file.mainBoulevard}</div>
          </div>

          <div className="border border-black p-1 text-[10px] mb-4 font-bold text-center italic">
            Note: Payments are due by the 10th of every month. 3.5% per month surcharge will apply on late payment.
          </div>

          {/* Statement Table */}
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="border border-black font-bold text-center bg-white">
                <th colSpan={4} className="border-r border-black py-1">Receivable</th>
                <th colSpan={4} className="border-r border-black py-1">Received</th>
                <th colSpan={2} className="py-1">Balance</th>
              </tr>
              <tr className="border border-black font-bold text-center bg-white">
                <th className="border-r border-black px-1 py-1 w-[70px]">Due Date</th>
                <th className="border-r border-black px-1 py-1 w-[40px]">Int No</th>
                <th className="border-r border-black px-1 py-1 text-left pl-2">Installment Type</th>
                <th className="border-r border-black px-1 py-1 w-[90px] text-right pr-2">receivable</th>
                <th className="border-r border-black px-1 py-1 w-[75px]">Receipt Date</th>
                <th className="border-r border-black px-1 py-1 text-left pl-2">Mode of Payment</th>
                <th className="border-r border-black px-1 py-1 w-[80px]">Instrument No</th>
                <th className="border-r border-black px-1 py-1 w-[90px] text-right pr-2">Amount</th>
                <th className="border-r border-black px-1 py-1 w-[90px] text-right pr-2">OS Balance</th>
                <th className="px-1 py-1 w-[75px] text-right pr-2">Surcharge</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={10} className="px-1 font-bold underline py-2 uppercase text-[11px]">Payment Plan</td></tr>
              {groupedTransactions.paymentPlan.map((t, idx) => {
                const today = new Date();
                today.setHours(0,0,0,0);
                const dueDate = parseSAPDate(t.duedate);
                const isOverdue = dueDate && dueDate < today && (t.balduedeb || 0) > 0;
                
                return (
                  <tr key={idx} className={`border-b border-gray-200 ${isOverdue ? 'bg-[#ffff00]' : ''}`}>
                    <td className="border-r border-gray-200 text-center py-1.5">{t.duedate}</td>
                    <td className="border-r border-gray-200 text-center">{t.u_intno}</td>
                    <td className="border-r border-gray-200 pl-2 uppercase font-medium">{t.u_intname}</td>
                    <td className="border-r border-gray-200 text-right pr-2">{format(t.receivable)}</td>
                    <td className="border-r border-gray-200 text-center">{t.receipt_date || ''}</td>
                    <td className="border-r border-gray-200 pl-2 uppercase">{t.mode || ''}</td>
                    <td className="border-r border-gray-200 text-center">{t.instrument_no || ''}</td>
                    <td className="border-r border-gray-200 text-right pr-2">{format(t.amount_paid)}</td>
                    <td className="border-r border-gray-200 text-right pr-2 font-bold">{format(t.balduedeb)}</td>
                    <td className="text-right pr-2 font-bold">{format(t.surcharge)}</td>
                  </tr>
                );
              })}

              {groupedTransactions.others.length > 0 && (
                <>
                  <tr><td colSpan={10} className="px-1 font-bold underline py-3 uppercase text-[11px]">Other</td></tr>
                  {groupedTransactions.others.map((t, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="border-r border-gray-200 text-center py-1.5">{t.duedate}</td>
                      <td className="border-r border-gray-200 text-center">-</td>
                      <td className="border-r border-gray-200 pl-2 uppercase">{t.u_intname}</td>
                      <td className="border-r border-gray-200 text-right pr-2">{format(t.receivable)}</td>
                      <td className="border-r border-gray-200 text-center">{t.receipt_date || ''}</td>
                      <td className="border-r border-gray-200 pl-2 uppercase">{t.mode || ''}</td>
                      <td className="border-r border-gray-200 text-center">{t.instrument_no || ''}</td>
                      <td className="border-r border-gray-200 text-right pr-2">{format(t.amount_paid)}</td>
                      <td className="border-r border-gray-200 text-right pr-2 font-bold">{format(t.balduedeb)}</td>
                      <td className="text-right pr-2 font-bold">{format(t.surcharge)}</td>
                    </tr>
                  ))}
                </>
              )}

              {/* Total Rows */}
              <tr className="border-t border-black bg-gray-50 font-bold">
                <td colSpan={3} className="px-4 py-2 text-right uppercase">Total Payment Plan (PKR) :</td>
                <td className="border-x border-black text-right pr-2">{format(totals.planRec)}</td>
                <td colSpan={3} className="border-r border-black"></td>
                <td className="border-r border-black text-right pr-2">{format(totals.planReceived)}</td>
                <td className="border-r border-black text-right pr-2">{format(totals.planRec - totals.planReceived)}</td>
                <td className="text-right pr-2">{format(totals.planSurcharge)}</td>
              </tr>
              
              {groupedTransactions.others.length > 0 && (
                <tr className="bg-[#ffff00] font-bold border-y border-black">
                  <td colSpan={3} className="px-4 py-2 text-right uppercase">Total Other (PKR) :</td>
                  <td className="border-x border-black text-right pr-2">{format(totals.otherRec)}</td>
                  <td colSpan={3} className="border-r border-black"></td>
                  <td className="border-r border-black text-right pr-2">{format(totals.otherReceived)}</td>
                  <td colSpan={2}></td>
                </tr>
              )}

              <tr className="border-b-[4px] border-black border-double font-bold bg-white text-[11px]">
                <td colSpan={3} className="px-4 py-3 text-right uppercase">Grand Total (PKR) :</td>
                <td className="border-x border-black text-right pr-2">{format(totals.grandRec)}</td>
                <td colSpan={3} className="border-r border-black"></td>
                <td className="border-r border-black text-right pr-2">{format(totals.grandReceived)}</td>
                <td className="border-r border-black text-right pr-2">{format(totals.grandBalance)}</td>
                <td className="text-right pr-2">-</td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="mt-20 pt-10 flex justify-between items-end text-[10px] text-slate-500">
            <div>
              <p>Page 1 of 1</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-black mb-1">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} &nbsp; 
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </p>
              <p className="font-black uppercase text-slate-900">Printed By: manager</p>
              <p className="italic">Standard SAP Generated Document</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountStatement;
