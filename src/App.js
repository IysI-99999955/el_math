// src/App.js
import React from 'react';
import { QuizProvider } from './contexts/QuizContext';
import MainContent from './components/MainContent';
import './styles/App.css';

// 에러 바운더리 컴포넌트 (앱 전체의 안정성을 위해 유지)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <h1>앱에서 오류가 발생했습니다</h1>
          <p>페이지를 새로고침해주세요.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            새로고침
          </button>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary>에러 상세 정보 (개발자용)</summary>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '5px',
              fontSize: '12px',
              overflow: 'auto',
              maxWidth: '600px'
            }}>
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QuizProvider>
        <div className="app-container">
          <MainContent />
        </div>
      </QuizProvider>
    </ErrorBoundary>
  );
}

export default App;