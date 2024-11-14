import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import React, { useContext, createContext } from 'react';

interface MDialogProps {
    title?: string;
    open: boolean; 
    onClose: () => void;
    children: React.ReactNode;
}

const DialogContext = createContext<{ onClose: () => void } | undefined>(undefined);

export const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogContext must be used within MDialog");
  }
  return context;
};

const MDialog: React.FC<MDialogProps> = ({ open, title, onClose, children }) => {
    return (
      <DialogContext.Provider value={{ onClose }}>
        <Dialog open={open} onClose={onClose}>
          {title && (
            <DialogTitle
              sx={{
                padding: '16px 24px',
                fontWeight: 'bold',
                fontSize: '1.25rem',
                borderBottom: '1px solid #ddd'
              }}
            >
              {title}
            </DialogTitle>
          )}
          <DialogContent>{children}</DialogContent>
        </Dialog>
      </DialogContext.Provider>
    );
};

export default MDialog;
