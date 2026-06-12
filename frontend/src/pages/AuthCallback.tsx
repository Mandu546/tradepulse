import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingPage from './LoadingPage';
export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  useEffect(() => {
    refreshAuth().then(() => { navigate('/accounts', { replace: true }); });
  }, []);
  return <LoadingPage />;
}
