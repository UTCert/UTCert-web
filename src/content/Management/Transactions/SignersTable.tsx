import { CertificateMulSign } from '@/models/certificate';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useEffect, useState } from 'react';

const SignersTable = ({ open, onClose, certificate }) => {
  const [lstSigner, setLstSigner] = useState<CertificateMulSign[]>([]);

  useEffect(() => {
    const signersData: CertificateMulSign[] = JSON.parse(
      certificate.mulSignJson
    );
    console.log(signersData);
    setLstSigner(signersData);
  }, [certificate]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Signers Table</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center">Signer Name</TableCell>
                <TableCell align="center">Signed Date</TableCell>
                <TableCell align="center">Signed State</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lstSigner.map((signer, index) => (
                <TableRow key={index}>
                  <TableCell align="center">{signer.issuerName}</TableCell>
                  <TableCell align="center">
                    {signer.signedDate != null
                      ? new Date(signer.signedDate).toLocaleDateString(
                          'en-GB'
                        )
                      : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    {signer.isSigned ? (
                      <Chip label="Signed" color="success" />
                    ) : (
                      <Chip
                        label="Not Signed"
                        style={{ backgroundColor: '#ffcccb', color: '#d32f2f' }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignersTable;
