export enum Role {

}

export interface User {
    id: string;
    stakeId: string;
    name: string;
    receiveAddress: string;
    avatarUri?: string; 
    role: Role;
    isVerified: boolean;
}
