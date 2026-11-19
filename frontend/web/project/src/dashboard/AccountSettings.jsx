import { useState } from 'react'
import { useAccount, saveAccount, clearAccount } from '../account-store'
import { logout } from '../api/auth.js'
import { clearAuthSession } from '../auth-store.js'

export default function AccountSettings({ onLogout }) {
  const account = useAccount()
  const [draft, setDraft] = useState(account)
  const [notice, setNotice] = useState('')

  function handleLogout() {
    clearAccount()
    clearAuthSession()
    if (onLogout) {
      onLogout()
    } else {
      logout()
    }
  }

  return (
    <section className="g-panel">
      <h2>Profile & Settings</h2>
      <p className="g-muted">Administrator account profile and workspace configuration.</p>
      <form
        className="g-form"
        onSubmit={e => {
          e.preventDefault()
          setNotice(saveAccount(draft) || 'Profile saved successfully.')
        }}
      >
        {draft.photo && (
          <img
            src={draft.photo}
            alt="Profile"
            style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
        <label>
          Change Profile Photo
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={e => {
              const file = e.target.files[0]
              if (!file) return
              if (
                !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
                file.size > 5 * 1024 * 1024
              ) {
                setNotice('Choose a PNG, JPEG or WebP image under 5 MB.')
                return
              }
              const reader = new FileReader()
              reader.onload = () => setDraft({ ...draft, photo: reader.result })
              reader.onerror = () => setNotice('Unable to read image.')
              reader.readAsDataURL(file)
            }}
          />
        </label>
        {draft.photo && (
          <button type="button" onClick={() => setDraft({ ...draft, photo: '' })}>
            Remove photo
          </button>
        )}
        <div className="g-form-grid">
          {[
            ['name', 'Full Name'],
            ['email', 'Email'],
            ['phone', 'Phone'],
            ['address', 'Address'],
            ['bio', 'Personal Details'],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                required={key === 'name'}
                type={key === 'email' ? 'email' : 'text'}
                value={draft[key] || ''}
                onChange={e => setDraft({ ...draft, [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <button className="g-button" type="submit">Save Changes</button>
        {notice && <p role="status" style={{ marginTop: 8 }}>{notice}</p>}
      </form>
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
        <button className="g-button secondary" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </section>
  )
}
