import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// CSS centralizado en App.css (importado dentro de App.jsx)
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
