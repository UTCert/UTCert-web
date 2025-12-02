/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_API_CREATE_URL: string;
    NEXT_PUBLIC_PINATA_CLOUD_API: string;
  }
}
