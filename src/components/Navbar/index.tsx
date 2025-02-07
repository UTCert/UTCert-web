import React, { useState } from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import styles from 'styles/Navbar.module.css';
import logo from '@/public/logo.png';
import Hero from '@/content/Overview/Hero';
import { Dialog, DialogTitle, List, ListItem } from '@mui/material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

function SimpleDialog(props) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle></DialogTitle>
      <List style={{ width: '500px', height: '300px' }}>
        <ListItem>
          <Hero />
        </ListItem>
      </List>
    </Dialog>
  );
}

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    const section = router.query.section as string;
    if (section) {
      const element = document.getElementById(section);
      if (element) {
        requestAnimationFrame(() => element.scrollIntoView({ behavior: "smooth" }));
        router.replace("/", undefined, { shallow: true });
      }
    }
  }, [router.query.section]);

  const handleNavigation = (id: string) => {
    if (window.location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push({ pathname: "/", query: { section: id } });
    }
  };

  return (
    <div className={styles.utcert__navbar}>
      <div className={styles.utcert__navbarLinks}>
        <div className={styles.utcert__navbarLinks_logo}>
          <NextLink href="/">
            <img src={logo.src} alt="logo" />
          </NextLink>
        </div>
        <div className={styles.utcert__navbarLinks_container}>
          <p onClick={() => handleNavigation('home')}>Home</p>
          <p onClick={() => handleNavigation('wutcert')}>What is UTCert?</p>
          <p onClick={() => handleNavigation('features')}>Features</p>
          <p onClick={() => handleNavigation('howtouse')}>How to use?</p>
          <p onClick={() => handleNavigation('possibility')}>Possibility</p>
          <p onClick={() => handleNavigation('aboutus')}>About Us</p>
          <p>
            <NextLink href="/faq">FAQ</NextLink>
          </p>
        </div>
      </div>
      <div className={styles.utcert__navbarSign}>
        <p onClick={handleClickOpen}>Sign in</p>
        <a href="https://eternl.io/app/mainnet/welcome">Sign up</a>
      </div>
      <div className={styles.utcert__navbarMenu}>
        {toggleMenu ? (
          <RiCloseLine
            color="#fff"
            size={27}
            onClick={() => setToggleMenu(false)}
          />
        ) : (
          <RiMenu3Line
            color="#fff"
            size={27}
            onClick={() => setToggleMenu(true)}
          />
        )}
        {toggleMenu && (
          <div
            className={`${styles.utcert__navbarMenu_container} ${styles.scaleUpCenter}`}
          >
            <div className={styles.utcert__navbarMenu_containerLinks}>
              <p>
                <a href="#home">Home</a>
              </p>
              <p>
                <a href="#wutcert">What is UTCert?</a>
              </p>
              <p>
                <a href="#features">Features</a>
              </p>
              <p>
                <a href="#howtouse">How to use?</a>
              </p>
              <p>
                <a href="#possibility">Possibility</a>
              </p>
              <p>
                <a href="#aboutus">About Us</a>
              </p>
              <p>
                <NextLink href="/homepage/faq">FAQ</NextLink>
              </p>
            </div>
            <div className={styles.utcert__navbarMenu_containerLinksSign}>
              <p onClick={handleClickOpen}>Sign in</p>
              <a href="https://eternl.io/app/mainnet/welcome">Sign up</a>
            </div>
          </div>
        )}
      </div>
      <SimpleDialog open={open} onClose={handleClose} />
    </div>
  );
};

export default Navbar;
