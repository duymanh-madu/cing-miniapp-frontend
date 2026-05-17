import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '32px',
        fontWeight: 'bold'
      }}
    >
      Cing Hu Tang Mini App 🚀
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)