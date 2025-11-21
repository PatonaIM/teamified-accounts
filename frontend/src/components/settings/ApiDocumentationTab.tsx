import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert, useTheme } from '@mui/material';
import { getAccessToken } from '../../services/authService';

declare global {
  interface Window {
    SwaggerUIBundle: any;
    SwaggerUIStandalonePreset: any;
  }
}

const ApiDocumentationTab: React.FC = () => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const swaggerInstanceRef = useRef<any>(null);

  useEffect(() => {
    const loadSwaggerUI = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
        const token = getAccessToken();

        // Load Swagger UI CSS
        if (!document.querySelector('link[href*="swagger-ui.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css';
          document.head.appendChild(link);
        }

        // Load Swagger UI scripts
        await Promise.all([
          loadScript('https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js'),
          loadScript('https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js'),
        ]);

        // Fetch the Swagger spec
        const response = await fetch(`${apiUrl}/docs-json`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch API documentation');
        }

        const spec = await response.json();

        // Initialize Swagger UI
        if (containerRef.current && window.SwaggerUIBundle) {
          swaggerInstanceRef.current = window.SwaggerUIBundle({
            spec,
            dom_id: `#${containerRef.current.id}`,
            deepLinking: true,
            presets: [
              window.SwaggerUIBundle.presets.apis,
              window.SwaggerUIStandalonePreset,
            ],
            plugins: [window.SwaggerUIBundle.plugins.DownloadUrl],
            layout: 'StandaloneLayout',
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'list',
            filter: true,
            requestInterceptor: (req: any) => {
              req.headers.Authorization = `Bearer ${token}`;
              return req;
            },
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading Swagger UI:', err);
        setError(err instanceof Error ? err.message : 'Failed to load API documentation');
        setLoading(false);
      }
    };

    loadSwaggerUI();

    return () => {
      // Cleanup
      if (swaggerInstanceRef.current) {
        swaggerInstanceRef.current = null;
      }
    };
  }, []);

  // Apply theme-aware styles when theme changes
  useEffect(() => {
    if (!containerRef.current) return;

    const style = document.createElement('style');
    style.id = 'swagger-theme-override';
    
    const existingStyle = document.getElementById('swagger-theme-override');
    if (existingStyle) {
      existingStyle.remove();
    }

    style.textContent = `
      #${containerRef.current.id} .swagger-ui {
        font-family: ${theme.typography.fontFamily};
      }
      
      #${containerRef.current.id} .swagger-ui .info .title {
        color: ${theme.palette.text.primary};
      }
      
      #${containerRef.current.id} .swagger-ui .info .base-url {
        color: ${theme.palette.text.secondary};
      }
      
      #${containerRef.current.id} .swagger-ui .scheme-container {
        background-color: ${theme.palette.background.paper};
        box-shadow: none;
        border: 1px solid ${theme.palette.divider};
      }
      
      #${containerRef.current.id} .swagger-ui .opblock-tag {
        color: ${theme.palette.text.primary};
        border-bottom: 1px solid ${theme.palette.divider};
      }
      
      #${containerRef.current.id} .swagger-ui .opblock {
        background-color: ${theme.palette.background.paper};
        border: 1px solid ${theme.palette.divider};
        box-shadow: none;
      }
      
      #${containerRef.current.id} .swagger-ui .opblock .opblock-summary {
        border-bottom: 1px solid ${theme.palette.divider};
      }
      
      #${containerRef.current.id} .swagger-ui .model-box {
        background-color: ${theme.palette.background.paper};
        border: 1px solid ${theme.palette.divider};
      }
      
      #${containerRef.current.id} .swagger-ui .model {
        color: ${theme.palette.text.primary};
      }
      
      #${containerRef.current.id} .swagger-ui .prop-type {
        color: ${theme.palette.primary.main};
      }
      
      #${containerRef.current.id} .swagger-ui table thead tr {
        border-bottom: 1px solid ${theme.palette.divider};
      }
      
      #${containerRef.current.id} .swagger-ui table td,
      #${containerRef.current.id} .swagger-ui table th {
        border-color: ${theme.palette.divider};
      }
      
      #${containerRef.current.id} .swagger-ui .btn {
        background-color: ${theme.palette.primary.main};
        color: ${theme.palette.primary.contrastText};
      }
      
      #${containerRef.current.id} .swagger-ui input[type=text],
      #${containerRef.current.id} .swagger-ui input[type=password],
      #${containerRef.current.id} .swagger-ui textarea,
      #${containerRef.current.id} .swagger-ui select {
        background-color: ${theme.palette.background.paper};
        color: ${theme.palette.text.primary};
        border: 1px solid ${theme.palette.divider};
      }
      
      #${containerRef.current.id} .swagger-ui .highlight-code,
      #${containerRef.current.id} .swagger-ui code,
      #${containerRef.current.id} .swagger-ui pre {
        background-color: ${theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5'};
        color: ${theme.palette.text.primary};
      }
    `;

    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [theme]);

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '600px' }}>
      <div id="swagger-ui-container" ref={containerRef} />
    </Box>
  );
};

export default ApiDocumentationTab;
