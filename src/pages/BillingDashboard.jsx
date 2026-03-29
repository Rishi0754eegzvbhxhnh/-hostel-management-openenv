import React, { useState } from 'react';

// ── MOCK DATA (replace with API calls to /api/billing/*) ─────────────────────
const STUDENT = { name: 'Arjun Sharma', room: 'B-204', rollNo: 'CS21B042' };

const CHARGES = [
  { id: 1, category: 'Room Rent',    amount: 8500, due: '2024-07-01', paid: true,  method: 'UPI',    date: '2024-06-30', icon: '🏠' },
  { id: 2, category: 'Mess Charges', amount: 3200, due: '2024-07-05', paid: true,  method: 'Online', date: '2024-07-04', icon: '🍽️' },
  { id: 3, category: 'Electricity',  amount: 420,  due: '2024-07-10', paid: true,  method: 'UPI',    date: '2024-07-08', icon: '⚡' },
  { id: 4, category: 'Laundry',      amount: 280,  due: '2024-07-10', paid: false, method: null,     date: null,         icon: '👕' },
  { id: 5, category: 'Wi-Fi',        amount: 199,  due: '2024-07-15', paid: false, method: null,     date: null,         icon: '📶' },
  { id: 6, category: 'Gym Access',   amount: 350,  due: '2024-07-15', paid: false, method: null,     date: null,         icon: '💪' },
];

const ANOMALIES = [
  { id: 1, type: 'warning', msg: 'Mess charges are ₹320 higher than your last 3-month average.', action: 'Review' },
  { id: 2, type: 'info',    msg: 'Early payment discount of ₹50 available if paid before July 10.', action: 'Pay Now' },
];

const HISTORY = [
  { month: 'June 2024',  total: 12190, status: 'Paid' },
  { month: 'May 2024',   total: 11800, status: 'Paid' },
  { month: 'April 2024', total: 12450, status: 'Paid' },
  { month: 'March 2024', total: 11600, status: 'Paid' },
];

// ─────────────────────────────────────────────────────────────────────────────
function PaymentModal({ amount, onClose, onSuccess }) {
  const [method, setMethod]     = useState('upi');
  const [upiId, setUpiId]       = useState('');
  const [processing, setProc]   = useState(false);

  const handlePay = () => {
    if (method === 'upi' && !upiId.trim()) return;
    setProc(true);
    // TODO: POST /api/billing/pay { amount, method, upiId }
    setTimeout(() => { setProc(false); onSuccess(); }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Pay ₹{amount}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex gap-2 mb-4">
          {[['upi', '📱 UPI'], ['card', '💳 Card'], ['netbanking', '🏦 Net Banking']].map(([id, label]) => (
            <button key={id} onClick={() => setMethod(id)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all
                ${method === id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {method === 'upi' && (
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 block mb-1">UPI ID</label>
            <input
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="yourname@upi"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
            />
          </div>
        )}

        {method === 'card' && (
          <div className="space-y-2 mb-4">
            <input className="w-full border rounded-xl px-3 py-2.5 text-sm" placeholder="Card number" />
            <div className="flex gap-2">
              <input className="flex-1 border rounded-xl px-3 py-2.5 text-sm" placeholder="MM/YY" />
              <input className="flex-1 border rounded-xl px-3 py-2.5 text-sm" placeholder="CVV" />
            </div>
          </div>
        )}

        {method === 'netbanking' && (
          <select className="w-full border rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none">
            <option>Select Bank</option>
            <option>SBI</option>
            <option>HDFC</option>
            <option>ICICI</option>
            <option>Axis</option>
          </select>
        )}

        <button onClick={handlePay}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={processing}>
          {processing ? '⏳ Processing...' : `Pay ₹${amount} Securely`}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">🔒 256-bit SSL encrypted</p>
      </div>
    </div>
  );
}

export default function BillingDashboard() {
  const [showModal, setShowModal]   = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [dismissed, setDismissed]   = useState([]);
  const [activeTab, setActiveTab]   = useState('current');

  const paid        = CHARGES.filter(c => c.paid);
  const unpaid      = CHARGES.filter(c => !c.paid);
  const totalPaid   = paid.reduce((s, c) => s + c.amount, 0);
  const totalDue    = unpaid.reduce((s, c) => s + c.amount, 0);
  const visibleAnom = ANOMALIES.filter(a => !dismissed.includes(a.id));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {showModal && (
        <PaymentModal
          amount={totalDue}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); setPaySuccess(true); }}
        />
      )}

      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">💳 Billing Dashboard</h1>
            <p className="text-gray-500 text-sm">{STUDENT.name} · Room {STUDENT.room} · {STUDENT.rollNo}</p>
          </div>
          {totalDue > 0 && (
            <button onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
              Pay All Due (₹{totalDue})
            </button>
          )}
        </div>

        {/* Pay Success Banner */}
        {paySuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-green-700 text-sm">
            ✅ Payment successful! Receipt sent to your registered email.
          </div>
        )}

        {/* AI Anomaly Alerts */}
        {visibleAnom.length > 0 && (
          <div className="space-y-2 mb-5">
            {visibleAnom.map(a => (
              <div key={a.id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border text-sm
                  ${a.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                <span>{a.type === 'warning' ? '⚠️' : '💡'} {a.msg}</span>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  <button className="font-semibold underline text-xs">{a.action}</button>
                  <button onClick={() => setDismissed(d => [...d, a.id])} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Due',    value: `₹${totalDue}`,   color: totalDue > 0 ? 'text-red-600' : 'text-green-600', bg: 'bg-white' },
            { label: 'Paid This Month', value: `₹${totalPaid}`,  color: 'text-green-600', bg: 'bg-white' },
            { label: 'Pending Items',   value: unpaid.length,      color: 'text-amber-600', bg: 'bg-white' },
            { label: 'Due Date',        value: 'Jul 15',            color: 'text-blue-600',  bg: 'bg-white' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl border shadow-sm p-4`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[['current', 'Current Month'], ['history', 'Payment History']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${activeTab === id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'current' ? (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">July 2024 — Itemized Charges</h2>
            </div>

            {/* Unpaid */}
            {unpaid.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-red-50">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Pending Payment</p>
                </div>
                {unpaid.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3.5 border-b hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{c.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.category}</p>
                        <p className="text-xs text-gray-400">Due: {c.due}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">₹{c.amount}</span>
                      <button
                        onClick={() => setShowModal(true)}
                        className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Pay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paid */}
            <div>
              <div className="px-4 py-2 bg-green-50">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Paid</p>
              </div>
              {paid.map(c => (
                <div key={c.id} className="flex items-center justify-between px-4 py-3.5 border-b hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{c.category}</p>
                      <p className="text-xs text-gray-400">Paid on {c.date} via {c.method}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">₹{c.amount}</span>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-medium">✓ Paid</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center px-4 py-4 bg-gray-50">
              <span className="font-semibold text-gray-700">Monthly Total</span>
              <span className="text-lg font-bold text-gray-900">₹{totalPaid + totalDue}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-800">Payment History</h2>
            </div>
            {HISTORY.map((h, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-4 border-b hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{h.month}</p>
                  <p className="text-xs text-gray-400">All charges settled</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">₹{h.total.toLocaleString()}</span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full font-medium">{h.status}</span>
                  <button className="text-xs text-blue-500 hover:underline">Receipt</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
