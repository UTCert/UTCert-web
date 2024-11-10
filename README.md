# UTCert Web Application

The UTCert project enables schools and training centers to issue secure, verifiable certificates as NFTs on the Cardano blockchain. Eligible students receive their certificates in digital wallets, which they can share with employers via QR codes for easy verification.
## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [License](#license)


## Features

- **NFT-Based Certificate Issuance**: Schools can issue tamper-proof certificates as NFTs, secured on the Cardano blockchain.
- **Digital Wallet Integration**: Students store and manage certificates in digital wallets, ensuring easy access and secure storage.
- **QR Code Verification**: Students can generate QR codes for their certificates, allowing employers to quickly validate credentials.

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (version 17.0 or above) - for compatibility with dependencies such as `@types/node` and `typescript`.
- **npm** or **yarn** - package managers to install dependencies.

### Steps

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/utcert-web.git
    cd utcert-web
    ```

2. **Install dependencies**:

    If you are using npm:
    ```bash
    npm install
    ```

    If you are using yarn:
    ```bash
    yarn install
    ```

3. **Set up environment variables**:

    - Create a `.env` file in the root directory with any required environment variables (e.g., API keys, endpoints).
    - Example of a `.env` file:
      ```plaintext
      NEXT_PUBLIC_API_URL=https://api.example.com
      NEXT_PUBLIC_MAPBOX_API_KEY=your_mapbox_api_key
      ```

4. **Run the development server**:

    If you are using npm:
    ```bash
    npm run dev
    ```

    If you are using yarn:
    ```bash
    yarn dev
    ```

5. **Build for production** (optional):

    - To build the application for production, run:
      ```bash
      npm run build
      ```

6. **Run the production server** (optional):

    - After building, start the production server:
      ```bash
      npm run start
      ```

7. **Open the application**:

    - Open your browser and navigate to `http://localhost:3000` to access the UTCert Web Application.

## Project Structure

```
.
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   ├── other pages...
├── public/
│   ├── assets/
│   ├── favicon/
│   ├── robots.txt
├── src/
│   ├── components/
│   ├── constants/
│   ├── contexts/
│   ├── hooks/
│   ├── layouts/
│   ├── lib/
│   ├── models/
│   ├── theme/
│   ├── utils/
├── styles/
├── .eslintignore
├── .eslintrc.json
├── .gitignore
├── .prettierignore
├── .prettierrc
├── LICENSE
├── next-env.d.ts
├── next.config.js
├── package.json
├── README.md
├── tsconfig.json
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

For any questions or support, please contact [utcert.support@gmail.com](mailto:utcert.support@gmail.com).
