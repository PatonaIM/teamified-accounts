import React, { useState } from 'react';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../config/supabase';

export const LoginButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured) {
    return (
      <div style={{ padding: '20px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
        <h3>⚠️  Supabase Not Configured</h3>
        <p>Please set up your Supabase credentials:</p>
        <ol>
          <li>Create a <code>.env</code> file in the root directory</li>
          <li>Copy the contents from <code>.env.example</code></li>
          <li>Add your Supabase URL and Anon Key</li>
        </ol>
      </div>
    );
  }

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>Demo SSO App</h1>
      <p>Login with your Teamified Portal account</p>
      
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>
      )}

      <div style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
        <p>✅ Single Sign-On enabled</p>
        <p>If you're already logged into the Portal, you'll be signed in automatically!</p>
      </div>
    </div>
  );
};
