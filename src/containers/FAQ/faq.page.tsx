import { CaretRightOutlined } from '@ant-design/icons';
import type { CollapseProps } from 'antd';
import { Collapse, theme } from 'antd';
import React from 'react';
import styles from '../../../styles/FAQ.module.css';
import { colors } from '@mui/material';

const getItems: (panelStyle: CollapseProps) => CollapseProps['items'] = (
  panelStyle
) => [
    {
      key: '1',
      label: (
        <h3 className={styles.utcert_faq_label}>
          What is UTCert?
        </h3>
      ),
      children: (
        <p className={styles.utcert_faq_children}>
          UTCert is a website where universities/training centers issue certificates to eligible students in the form of NFTs. This is a promising technology for the future where everything becomes transparent and clear.
        </p>
      ),
      style: panelStyle
    },
    {
      key: '2',
      label: (
        <h3 className={styles.utcert_faq_label}>
          What is blockchain and why is it important in cryptocurrency?
        </h3>
      ),
      children: (
        <p className={styles.utcert_faq_children}>
          To use UTCert, you need to register for an Eternl wallet and switch to the Pre-Production Testnet environment. The system is currently under development on the Testnet environment but still ensures transparency and public access.
        </p>
      ),
      style: panelStyle
    },
    {
      key: '3',
      label: (
        <h3 className={styles.utcert_faq_label}>
          Do you need to own a digital wallet to store student certificates?
        </h3>
      ),
      children: (
        <p className={styles.utcert_faq_children}>
          Users need to own an Eternl digital wallet to store certificates. For other electronic wallets, we do not support connectivity or storage.
        </p>
      ),
      style: panelStyle
    },
    {
      key: '4',
      label: (
        <h3 className={styles.utcert_faq_label}>
          Can other wallets like Metamask, Nami, etc., be used to store certificates?
        </h3>
      ),
      children: (
        <p className={styles.utcert_faq_children}>
          Currently, UTCert only supports storing certificates on the Eternl wallet. If users store certificates on other electronic wallet platforms, we will consider them invalid.
        </p>
      ),
      style: panelStyle
    },
    {
      key: '5',
      label: (
        <h3 className={styles.utcert_faq_label}>
          How to use UTCert?
        </h3>
      ),
      children: (
        <p className={styles.utcert_faq_children}>
          First, you need to create an Eternl wallet and log into UTCert, then you will enter basic information such as name, profile picture, etc. When you want to receive certificates from the issuing institution, you will need to connect with them through your electronic wallet address.
        </p>
      ),
      style: panelStyle
    },
    {
      key: '6',
      label: (
        <h3 className={styles.utcert_faq_label}>
          How can the issuing institution provide certificates to you?
        </h3>
      ),
      children: (
        <p className={styles.utcert_faq_children}>
          After successfully creating an account and logging into UTCert, you need to provide your wallet address to the issuing institution so they can send the certificate to you. The time you receive the certificate in your wallet depends on the issuing institution, and make sure your account is connected to the issuer's account.
        </p>
      ),
      style: panelStyle
    },
    {
      key: '7',
      label: (
        <h3 className={styles.utcert_faq_label}>
          How can employers view your certificates?
        </h3>
      ),
      children: (
        <p className={styles.utcert_faq_children}>
          Students can choose which certificates they want to share with others to generate a QR code. With this QR code, employers can easily verify the certificate.
        </p>
      ),
      style: panelStyle
    },
    {
      key: '8',
      label: (
        <h3 className={styles.utcert_faq_label}>
          How to determine if a certificate is genuine or fake?
        </h3>
      ),
      children: (
        <p className={styles.utcert_faq_children}>
          Each certificate will have its own unique ID and will have a PolicyID provided by the issuing institution, allowing us to verify whether the certificate is genuine or not. Regarding PolicyID, issuing institutions will make it publicly available for us to easily check whether the certificate is genuine or fake.
        </p>
      ),
      style: panelStyle
    },
    {
      key: '9',
      label: (
        <h3 className={styles.utcert_faq_label}>
          What is the security and reliability of UTCert?
        </h3>
      ),
      children: (
        <p className={styles.utcert_faq_children}>
          UTCert is a system built on the Cardano Blockchain platform, so it is completely secure and transparent, with high reliability.
        </p>
      ),
      style: panelStyle
    },
    {
      key: '10',
      label: (
        <h3 className={styles.utcert_faq_label}>
          How to contact the support team?
        </h3>
      ),
      children: (
        <p className={styles.utcert_faq_children}>
          To contact the support team, please send an email to utcert.contact@gmail.com.
        </p>
      ),
      style: panelStyle
    }
  ];

const FAQ = () => {
  const { token } = theme.useToken();

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none'
  };

  const caretStyle: React.CSSProperties = {
    color: 'white'
  };

  return (
    <>
      <div className={styles.utcert_faq_container}>
        <div className={styles.utcert_faq_text}>
          <h1>Frequently Asked Questions</h1>
        </div>
        <div className={styles.utcert_faq_collapse}>
          <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} style={caretStyle} />
            )}
            style={{ background: styles.utcert_faq_collapse_question }}
            items={getItems(panelStyle)}
          />
        </div>
      </div>
    </>
  );
};

export default FAQ;
