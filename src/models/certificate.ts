import { ContactStatus } from "./contact";
import { User } from "./user";

export interface Certificate {
  id: string;
  code: number;
  name: string; 
  issuerName: string;
  receiverName: string; 

  imageLink: string;
  receiverIdentityNumber: string;
  receiverDoB: string;
  graduationYear: number;
  classification: string;
  modeOfStudy: string;
  ipfsLink: string;
  receiverAddressWallet: string;
  signedDate: string;
  receivedDate: string; 
  contactStatus: ContactStatus;

  status: CertificateStatus;
  signingType: SigningType
  sentDate: string;

  // multiple signature
  signHash: string; 
  mulSignJson: string; 

  // attachment
  attachmentJson: string; 
  attachmentIpfs: string; 
  attachmentName: string; 
  
  // mapping to user
  issuer: User; 
  receiver: User;

  note: string; 
}

export enum CertificateStatus {
  Draft = 1,
  Signed = 2,
  Sent = 3,
  Banned = 4, 
  Pending = 5, 
}

export enum SigningType {
  SingleSigning = 1,
  MultipleSigning = 2
}

export class CertificateMulSign
{
    issuerName: string; 
    issuerAddress ?: string; 
    signedDate: string; 
    isSigned: boolean; 
}