'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import {
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export type ModalType = 'warn' | 'error' | 'info';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  type: ModalType;
  title: string;
  content: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  showButtons?: boolean;
  disableBackdropClick?: boolean;
}

const getIcon = (type: ModalType) => {
  switch (type) {
    case 'warn':
      return <WarningIcon color="warning" />;
    case 'error':
      return <ErrorIcon color="error" />;
    case 'info':
      return <InfoIcon color="info" />;
    default:
      return null;
  }
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  type,
  title,
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true,
  showButtons = true,
  disableBackdropClick = false,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleClose = (event: {}, reason: string) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getIcon(type)}
          <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {!disableBackdropClick && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        {typeof content === 'string' ? (
          <Typography>{content}</Typography>
        ) : (
          content
        )}
      </DialogContent>
      { showButtons && (
        <DialogActions className='!px-6 !py-4'>
          {showCancel && (
            <Button onClick={handleCancel} color="inherit">
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={type === 'error' ? 'error' : type === 'warn' ? 'warning' : 'primary'}
          >
            {confirmText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

