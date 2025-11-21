import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        
        if (!userData) {
          navigate('/login');
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error('[Dashboard] Failed to load user:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = async () => {
    await authService.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard - Demo SSO App</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginTop: '30px', background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
        <h2>Welcome, {user?.firstName || user?.email}!</h2>
        
        <div style={{ marginTop: '20px' }}>
          <h3>User Information</h3>
          <table style={{ width: '100%', marginTop: '10px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Email:</td>
                <td style={{ padding: '8px' }}>{user?.email}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Name:</td>
                <td style={{ padding: '8px' }}>{user?.firstName} {user?.lastName}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>User ID:</td>
                <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '12px' }}>{user?.id}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Roles & Permissions</h3>
          <div style={{ marginTop: '10px' }}>
            {user?.userRoles && user.userRoles.length > 0 ? (
              user.userRoles.map((role: any, index: number) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    margin: '4px',
                    background: '#007bff',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  {role.roleType} ({role.scope})
                </span>
              ))
            ) : (
              <p style={{ color: '#666' }}>No roles assigned</p>
            )}
          </div>
        </div>

        <div style={{ marginTop: '30px', padding: '15px', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>✅ SSO Active</h4>
          <p style={{ margin: 0, color: '#155724' }}>
            You're logged in via Supabase SSO. Open the Teamified Portal or other apps - you'll be automatically logged in!
          </p>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Test SSO</h3>
        <p>Try opening these in new tabs (if deployed):</p>
        <ul>
          <li>Teamified Portal</li>
          <li>Other demo apps with SSO enabled</li>
        </ul>
        <p style={{ color: '#666', fontSize: '14px' }}>
          You should be automatically logged in to all apps without re-entering credentials!
        </p>
      </div>
    </div>
  );
};
