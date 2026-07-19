import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#1a1a1a', color: '#ff6b6b',
          padding: 20, zIndex: 9999, overflow: 'auto', fontFamily: 'monospace', fontSize: 12
        }}>
          <strong style={{fontSize:16, color:'#fff'}}>💥 Crash / Error detected</strong>
          <pre style={{marginTop:12, whiteSpace:'pre-wrap', wordBreak:'break-all'}}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{marginTop:12, padding:'8px 16px', background:'#444', color:'#fff', border:'none', borderRadius:8}}
          >
            Fermer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
