import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Download } from '@mui/icons-material';

interface DownloadMarkdownButtonProps {
  filename: string;
  content: string;
  tooltip?: string;
}

export default function DownloadMarkdownButton({ 
  filename, 
  content, 
  tooltip = 'Download as Markdown file for use as context in Replit AI chats' 
}: DownloadMarkdownButtonProps) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.md') ? filename : `${filename}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Tooltip title={tooltip} arrow>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Download />}
        onClick={handleDownload}
        sx={{ 
          textTransform: 'none',
          borderRadius: 2,
        }}
      >
        Download as Markdown
      </Button>
    </Tooltip>
  );
}
