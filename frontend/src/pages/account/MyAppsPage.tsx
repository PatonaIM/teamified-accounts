import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyAppsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/account/profile', { replace: true });
  }, [navigate]);

  return null;
}
