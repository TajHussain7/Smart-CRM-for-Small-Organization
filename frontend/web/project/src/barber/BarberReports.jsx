import { useState, useEffect } from 'react'
import { getBarberReports } from '../api/barber.js'

export default function BarberReports() {
  const [report, setReport] = useState(null)

  useEffect(() => {
    let mounted = true
    getBarberReports()
      .then(res => {
        if (!mounted) return
        setReport(res)
      })
      .catch(err => {
        console.error('Failed to load barber reports:', err)
      })
    return () => { mounted = false }
  }, [])

  const todayRevenue = report?.todayRevenue || 0
  const todayTransactions = report?.todayTransactions || 0
  const avgTicket = todayTransactions ? Math.round(todayRevenue / todayTransactions) : 0
  const trend = report?.sevenDayRevenueTrend || []
  const topServices = report?.topServices || []
  const totalClients = report?.totalClients || 0
  const loyaltyCount = report?.loyaltyMembersCount || 0

  const maxRevenue = Math.max(...trend.map(t => t.revenue), 1000)

  function exportCsv() {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Today Revenue,Rs. ${todayRevenue}\n` +
      `Today Appointments,${todayTransactions}\n` +
      `Total Clients,${totalClients}\n` +
      `Loyalty Clients,${loyaltyCount}\n\n` +
      'Date,Daily Revenue (PKR),Transactions\n' +
      trend.map(t => `${t.date},${t.revenue},${t.transactions}`).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `barber_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <div className="g-metrics">
        {[
          ["Today's Revenue", `Rs. ${todayRevenue.toLocaleString()}`, `${todayTransactions} transactions`],
          ['Appointments Today', todayTransactions.toString(), 'Daily bookings'],
          ['Avg Ticket Value', `Rs. ${avgTicket.toLocaleString()}`, 'Per transaction'],
          ['Total Clients', totalClients.toString(), `${loyaltyCount} Loyalty members`],
        ].map(([label, value, note]) => (
          <section key={label}>
            <div>
              <span className="g-eyebrow">{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </div>
          </section>
        ))}
      </div>

      <div className="b-form">
        <section className="g-panel">
          <div className="g-panel-head">
            <h2>Revenue Trend</h2>
            <span>Last 7 Days (PKR)</span>
          </div>
          {trend.length > 0 ? (
            <div className="br-bars" role="img" aria-label="7 day revenue trend">
              {trend.map((item, i) => (
                <div key={item.date || i}>
                  <span
                    style={{
                      height: `${Math.max(10, Math.min(120, (item.revenue / maxRevenue) * 120))}px`,
                      background: '#064bcb',
                    }}
                    title={`${item.date}: Rs. ${item.revenue}`}
                  />
                  <small>{item.date.slice(5)}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="g-empty" style={{ padding: '24px 0' }}>
              No payments recorded in the last 7 days.
            </p>
          )}
        </section>

        <section className="g-panel">
          <h2>Popular Services</h2>
          {topServices.length > 0 ? (
            topServices.map(item => (
              <div className="g-growth" key={item.name}>
                <div>
                  <span>{item.name} (Rs. {((item.priceInPaisas || 0) / 100).toLocaleString()})</span>
                  <strong>{item.bookingsCount || 0} Bookings</strong>
                </div>
                <div className="g-track">
                  <span
                    style={{
                      width: `${Math.min(100, (item.bookingsCount || 1) * 10)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="g-empty">No service booking data yet.</p>
          )}
        </section>
      </div>

      <div className="br-export" style={{ marginTop: 24 }}>
        <button className="g-button" onClick={exportCsv}>
          ↓ Export CSV Report
        </button>
        <button className="g-button secondary" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </div>
    </div>
  )
}
