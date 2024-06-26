export type CertificateStatus = 1 | 2 | 3 | 4 | 0;
export type ContactStatus = '1' | '2';

export interface Certificate {
  certificateID: string;
  imageLink: string;
  transactionLink: string;
  receivedIdentityNumber: string;
  receivedDoB: string;
  yearOfGraduation: number;
  classification: string;
  modeOfStudy: string;
  ipfsLink: string;
  sentDate: string;
  receivedAddressWallet: string;
  certificateCode: number;
  certificateType: string;
  certificateName: string;
  receivedName: string;
  signedDate: string;
  contactStatus: ContactStatus;
  certificateStatus: CertificateStatus;
  organizationName: string;
  receivedDate: string;
}

export type CertificateName = string;
export type ReceivedName = string;
export type OrganizationName = string;

