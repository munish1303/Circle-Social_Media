import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100dvh', padding: 24, gap: 16,
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Something went wrong</h2>
          <pre style={{
            background: '#f5f5f5', padding: 16, borderRadius: 8,
            fontSize: 12, maxWidth: '100%', overflow: 'auto',
            color: '#ed4956', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
          }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#0095f6', color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: 8, fontSize: 14,
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
