import { useLocation, Navigate } from 'react-router-dom';
import ThankYou from '../components/booking/ThankYou';

const ThankYouPage = () => {
  const location = useLocation();
  
  // If there's no booking data, redirect to booking page
  if (!location.state?.booking) {
    return <Navigate to="/book-appointment" replace />;
  }

  return <ThankYou booking={location.state.booking} />;
};

export default ThankYouPage; 