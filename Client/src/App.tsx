import './App.css'
import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import BookAppointment from './pages/BookAppointment'
import Home from './pages/Home'
import ThankYou from './pages/ThankYou'
import GlobalStyle from './GlobalStyle'

function App() {
  return (
    <>
      <GlobalStyle />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
    </>
  )
}

export default App
