import './App.css'
import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import BookAppointment from './pages/BookAppointment'
import Home from './pages/Home'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
      </Routes>
    </>
  )
}

export default App
