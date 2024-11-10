import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import { Certificate, } from '@/models/certificate';
interface CertDetailProps {
  open: boolean;
  onClose: () => void;
  selectedCertificate: Certificate;
}



function CertDetail(props: CertDetailProps) {
  const { open, onClose, selectedCertificate } = props;
  if (!selectedCertificate) {
    return null;
  }

  const certificateDetails = [
    {
      label: 'CERTIFICATE CODE:',
      value: selectedCertificate.code,
      style: { borderBottom: '1px solid #000', paddingBottom: '5px' }
    },
    {
      label: 'RECEIVED IDENTITY:',
      value: selectedCertificate.receiverIdentityNumber,
      style: { marginTop: '0px' }
    },
    { label: 'RECEIVED NAME:', value: selectedCertificate.receiverName }
  ];

  return (
    <Dialog maxWidth="lg" open={open} onClose={onClose}>
      <DialogContent
        style={{
          display: 'grid',
          gridTemplateColumns: '6fr 4fr',
          alignItems: 'center'
        }}
      >
        <div>
          <img
           src={`https://gateway.pinata.cloud/ipfs/${selectedCertificate.ipfsLink}`}
            alt="Certificate"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 2fr',
            marginLeft: '30px',
            fontSize: '15px',
            gap: '5px',
            backgroundColor: 'Background'
          }}
        >
          {certificateDetails.map(({ label, value, style }) => (
            <React.Fragment key={label}>
              <p style={{ fontWeight: 'bold', ...style }}>{label}</p>
              <p style={style}>{value}</p>
            </React.Fragment>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CertDetail;
