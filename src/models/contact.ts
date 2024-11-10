export interface Contact {
  id: string;
  code: number;
  contactName: string;
  createdDate: string;
  contactStatus: ContactStatus;
  issuedId: string;
  receiverId: string;
  issuer: any, 
  receiver: any, 
}

export enum ContactStatus {
  Pending = 1,
  Accepted = 2,
}
