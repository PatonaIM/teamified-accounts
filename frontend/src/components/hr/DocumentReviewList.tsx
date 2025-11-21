import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  IconButton,
  Box,
  Typography,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Lock as LockIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Edit as NeedsChangesIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';

interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  category: string;
  status: string | null;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

interface DocumentReviewListProps {
  documents: Document[];
  selectedDocumentIds: string[];
  onDocumentClick: (document: Document) => void;
  onSelectionChange: (documentIds: string[]) => void;
}

type SortField = 'category' | 'fileName' | 'status' | 'uploadedAt';
type SortOrder = 'asc' | 'desc';

const DocumentReviewList: React.FC<DocumentReviewListProps> = ({
  documents,
  selectedDocumentIds,
  onDocumentClick,
  onSelectionChange,
}) => {
  const [sortField, setSortField] = useState<SortField>('uploadedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectionChange(documents.map((doc) => doc.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectDocument = (documentId: string) => {
    const currentIndex = selectedDocumentIds.indexOf(documentId);
    const newSelected = [...selectedDocumentIds];

    if (currentIndex === -1) {
      newSelected.push(documentId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    onSelectionChange(newSelected);
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle null status
    if (sortField === 'status') {
      aValue = aValue || 'pending';
      bValue = bValue || 'pending';
    }

    // Handle date sorting
    if (sortField === 'uploadedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Numeric comparison
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'needs_changes':
        return 'warning';
      case 'pending':
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <ApprovedIcon sx={{ fontSize: 16 }} />;
      case 'rejected':
        return <RejectedIcon sx={{ fontSize: 16 }} />;
      case 'needs_changes':
        return <NeedsChangesIcon sx={{ fontSize: 16 }} />;
      case 'pending':
      default:
        return <PendingIcon sx={{ fontSize: 16 }} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const isSelected = (documentId: string) => selectedDocumentIds.indexOf(documentId) !== -1;
  const numSelected = selectedDocumentIds.length;
  const rowCount = documents.length;

  if (documents.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No documents uploaded yet</Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} size="medium">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={handleSelectAll}
                inputProps={{ 'aria-label': 'select all documents' }}
              />
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'category'}
                direction={sortField === 'category' ? sortOrder : 'asc'}
                onClick={() => handleSort('category')}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Category
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'fileName'}
                direction={sortField === 'fileName' ? sortOrder : 'asc'}
                onClick={() => handleSort('fileName')}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  File Name
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={600}>
                Size
              </Typography>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'status'}
                direction={sortField === 'status' ? sortOrder : 'asc'}
                onClick={() => handleSort('status')}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Status
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'uploadedAt'}
                direction={sortField === 'uploadedAt' ? sortOrder : 'asc'}
                onClick={() => handleSort('uploadedAt')}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Uploaded
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">
              <Typography variant="subtitle2" fontWeight={600}>
                Actions
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedDocuments.map((document) => {
            const isItemSelected = isSelected(document.id);
            const isVerified = document.status === 'approved';

            return (
              <TableRow
                key={document.id}
                hover
                selected={isItemSelected}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isItemSelected}
                    onChange={() => handleSelectDocument(document.id)}
                    inputProps={{ 'aria-labelledby': `document-${document.id}` }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={document.category}
                    size="small"
                    sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isVerified && (
                      <Tooltip title="Verified - locked from deletion">
                        <LockIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      </Tooltip>
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {document.fileName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(document.fileSize)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(document.status)}
                    label={document.status || 'Pending'}
                    size="small"
                    color={getStatusColor(document.status)}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      '& .MuiChip-icon': {
                        ml: 1,
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Review Document">
                    <IconButton
                      size="small"
                      onClick={() => onDocumentClick(document)}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.lighter',
                        },
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DocumentReviewList;
