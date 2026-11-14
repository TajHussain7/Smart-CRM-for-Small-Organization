import { useState, useEffect } from 'react'
import { getInvoices, generateInvoices, recordPayment } from '../api/school.js'
import './alerts.css'

export default function FeeInvoiceForm() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [payNotice, setPayNotice] = useState('')

  // Generate form state
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  // Pay form state
  const [selectedInvoice, setSelectedInvoice] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('CASH')

  async function loadInvoices() {
    try {
      const data = await getInvoices()
      const list = Array.isArray(data) ? data : data.data || []
      setInvoices(list)
    } catch (err) {
      console.error('Failed to load invoices:', err)
    }
  }

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      try {
        const data = await getInvoices()
        if (!mounted) return
        const list = Array.isArray(data) ? data : data.data || []
        setInvoices(list)
      } catch (err) {
        console.error('Failed to load invoices:', err)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  async function handleGenerate(e) {
    e.preventDefault()
    setNotice('')
    setLoading(true)

    try {
      const result = await generateInvoices(Number(month), Number(year))
      const count = result?.invoicesCreated ?? (Array.isArray(result) ? result.length : 'all')
      setNotice(`Successfully generated fee invoices (${count} created/updated for ${month}/${year}).`)
      await loadInvoices()
    } catch (err) {
      setNotice(`Error generating invoices: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function handlePayment(e) {
    e.preventDefault()
    setPayNotice('')
    if (!selectedInvoice || !payAmount) {
      setPayNotice('Please select an invoice and enter amount.')
      return
    }

    try {
      await recordPayment({
        invoiceId: selectedInvoice,
        amount: Number(payAmount),
        method: payMethod,
      })
      setPayNotice('Payment recorded successfully!')
      setPayAmount('')
      setSelectedInvoice('')
      await loadInvoices()
    } catch (err) {
      setPayNotice(`Payment failed: ${err.message}`)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* 1. Generate Invoices Section */}
      <section className="g-panel">
        <h2>Generate Monthly Fee Invoices</h2>
        <p className="g-muted">
          Batch-generate tuition fee invoices for all active students for a given billing month and year.
        </p>
        <form className="invoice-form" onSubmit={handleGenerate}>
          <label>
            Billing Month
            <select value={month} onChange={e => setMonth(Number(e.target.value))}>
              {[
                [1, 'January'], [2, 'February'], [3, 'March'], [4, 'April'],
                [5, 'May'], [6, 'June'], [7, 'July'], [8, 'August'],
                [9, 'September'], [10, 'October'], [11, 'November'], [12, 'December']
              ].map(([num, name]) => (
                <option key={num} value={num}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            Billing Year
            <input
              type="number"
              min="2024"
              max="2030"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              required
            />
          </label>
          <button className="g-button" type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Invoices'}
          </button>
          {notice && <p role="status" style={{ marginTop: 8 }}>{notice}</p>}
        </form>
      </section>

      {/* 2. Record Payment Section */}
      <section className="g-panel">
        <h2>Record Student Fee Payment</h2>
        <p className="g-muted">Record incoming cash, card, or mobile wallet (JazzCash / EasyPaisa) fee payment.</p>
        <form className="invoice-form" onSubmit={handlePayment}>
          <label>
            Select Pending / Overdue Invoice
            <select
              value={selectedInvoice}
              onChange={e => {
                const invId = e.target.value
                setSelectedInvoice(invId)
                const found = invoices.find(i => i._id === invId || i.invoiceNumber === invId)
                if (found) {
                  setPayAmount(String(found.amountDue - (found.amountPaid || 0)))
                }
              }}
              required
            >
              <option value="">Choose an invoice...</option>
              {invoices
                .filter(i => i.status !== 'PAID')
                .map(i => (
                  <option key={i._id} value={i._id}>
                    {i.invoiceNumber} · {i.studentId?.name || 'Student'} · Due: Rs. {(i.amountDue - (i.amountPaid || 0)).toLocaleString()} ({i.status})
                  </option>
                ))}
            </select>
          </label>
          <label>
            Payment Amount (PKR)
            <input
              type="number"
              min="1"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              required
            />
          </label>
          <label>
            Payment Method
            <select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
              <option value="CASH">Cash</option>
              <option value="CARD">Debit / Credit Card</option>
              <option value="JAZZCASH">JazzCash</option>
              <option value="EASYPAISA">EasyPaisa</option>
            </select>
          </label>
          <button className="g-button" type="submit">Record Payment</button>
          {payNotice && <p role="status" style={{ marginTop: 8 }}>{payNotice}</p>}
        </form>
      </section>

      {/* 3. Invoices List Section */}
      {invoices.length > 0 && (
        <section className="g-panel">
          <div className="g-panel-head">
            <h2>School Invoices ({invoices.length})</h2>
          </div>
          <div className="g-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Student</th>
                  <th>Month</th>
                  <th>Amount Due</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(i => (
                  <tr key={i._id}>
                    <td><strong>{i.invoiceNumber}</strong></td>
                    <td>{i.studentId?.name || 'Student'}</td>
                    <td>{i.month}/{i.year}</td>
                    <td>Rs. {i.amountDue?.toLocaleString()}</td>
                    <td>Rs. {(i.amountPaid || 0).toLocaleString()}</td>
                    <td>
                      <span className={`g-badge ${i.status === 'PAID' ? 'good' : i.status === 'PARTIAL' ? 'warn' : 'bad'}`}>
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
