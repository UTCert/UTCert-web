import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import React from 'react';

interface MDialogProps {
    title?: string;
    open: boolean; 
    onClose: () => void;
    children: React.ReactNode;
}

const MDialog: React.FC<MDialogProps> = ({ open, title, onClose, children }) => {
    return (
      <>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
          {title && <DialogTitle>{title}</DialogTitle>}
          <DialogContent>{children}</DialogContent>
        </Dialog>
      </>
    );
};

export default MDialog;
