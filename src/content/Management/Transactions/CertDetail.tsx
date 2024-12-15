import React from 'react';
import { Dialog, DialogContent } from '@mui/material';
import { Certificate, CertificateStatus, } from '@/models/certificate';
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
      isShow: true,
      style: { borderBottom: '1px solid #000', paddingBottom: '5px' }
    },
    {
      label: 'RECEIVED IDENTITY:',
      value: selectedCertificate.receiverIdentityNumber,
      isShow: true,
      style: { marginTop: '0px' }
    },
    {
      label: 'RECEIVED NAME:',
      value: selectedCertificate.receiverName,
      isShow: true
    },
    {
      label: 'BANNED NOTE:',
      value: selectedCertificate.note,
      isShow: selectedCertificate.status == CertificateStatus.Banned && selectedCertificate.note,
      style: { color: 'red' }
    }
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
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            marginLeft: '30px',
            fontSize: '15px',
            backgroundColor: 'Background'
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: 'red',
              fontWeight: 'bold',
              fontSize: '18px'
            }}
          >
            {selectedCertificate.status == CertificateStatus.Banned
              ? 'This certificate is illegal'
              : ''}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 2fr',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {certificateDetails.filter(x => x.isShow).map(({ label, value, style }) => (
              <React.Fragment key={label}>
                <p style={{ fontWeight: 'bold', ...style }}>{label}</p>
                <p style={style}>{value}</p>
              </React.Fragment>
            ))}
          </div>

          <div
            style={{
              textAlign: 'center',
              color: 'red',
              fontWeight: 'bold',
              fontSize: '18px'
            }}
          >
            {selectedCertificate.status == CertificateStatus.Banned
              ? 'This certificate is illegal'
              : ''}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CertDetail;
