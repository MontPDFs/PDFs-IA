import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Prompts from './pages/Prompts'
import Research from './pages/Research'
import Generator from './pages/Generator'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crear" element={<Generator />} />
        <Route path="/prompts" element={<Prompts />} />
        <Route path="/investigar" element={<Research />} />
      </Routes>
    </BrowserRouter>
  )
}
