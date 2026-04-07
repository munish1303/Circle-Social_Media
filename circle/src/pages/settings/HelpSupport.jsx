import { useState } from 'react'
import { ChevronDown, ChevronUp, Mail, MessageCircle } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import TopBar from '../../components/layout/TopBar'
import './SettingsPages.css'

const FAQS = [
  {
    q: 'How do I make my account private?',
    a: 'Go to Settings → Privacy → toggle on "Private Account". Only people you approve can see your posts.'
  },
  {
    q: 'How do I delete a post?',
    a: 'Tap the three dots (···) on any of your posts and select "Delete post".'
  },
  {
    q: 'Can I change my username?',
    a: 'Yes — go to Settings → Edit Profile and update your username. Usernames must be lowercase letters, numbers, underscores or dots.'
  },
  {
    q: 'How do I block someone?',
    a: 'Visit their profile, tap the three dots (···) in the top right, and select "Block".'
  },
  {
    q: 'Is my data sold to advertisers?',
    a: 'Never. Circle does not sell your data to third parties or use it for advertising. Your data is yours.'
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Settings → Delete Account. This is permanent and cannot be undone. All your posts, messages and data will be removed.'
  },
  {
    q: 'Why can\'t I see someone\'s posts?',
    a: 'Their account may be private. Send them a follow request and they\'ll need to approve it before you can see their content.'
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <p className="faq-answer">{a}</p>}
    </div>
  )
}

export default function HelpSupport() {
  const { showToast } = useUIStore()
  const [reportText, setReportText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleReport = async () => {
    if (!reportText.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    setSubmitting(false)
    setReportText('')
    showToast('Report submitted. We\'ll review it shortly.', 'success')
  }

  return (
    <>
      <TopBar title="Help & Support" />
      <div className="page-content no-nav">
        <div className="settings-section-group">
          <p className="settings-group-title">Frequently Asked Questions</p>
          {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>

        <div className="settings-section-group">
          <p className="settings-group-title">Report a Problem</p>
          <div className="help-report-box">
            <textarea
              className="help-report-input"
              placeholder="Describe the issue you're experiencing..."
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              rows={4}
            />
            <button
              className={`help-report-btn ${!reportText.trim() ? 'help-report-btn--disabled' : ''}`}
              onClick={handleReport}
              disabled={!reportText.trim() || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>

        <div className="settings-section-group">
          <p className="settings-group-title">Contact Us</p>
          <button className="settings-action-row" onClick={() => showToast('Opening email...', 'info')}>
            <div className="settings-action-icon"><Mail size={20} /></div>
            <div className="settings-action-info">
              <span className="settings-action-label">Email Support</span>
              <span className="settings-action-desc">support@circle.app</span>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}
