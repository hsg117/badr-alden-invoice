import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import InvoiceView from './pages/InvoiceView'
import Support from './pages/Support'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/invoice/:id" element={<InvoiceView />} />
        <Route path="/support" element={<Support />} />
      </Routes>
    </HashRouter>
  )
}

export default App
