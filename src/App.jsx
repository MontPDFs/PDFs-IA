import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Prompts from './pages/Prompts'
import Generator from './pages/Generator'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crear" element={<Generator />} />
        <Route path="/prompts" element={<Prompts />} />
      </Routes>
    </BrowserRouter>
  )
}
