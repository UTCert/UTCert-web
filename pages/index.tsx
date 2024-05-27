import Brand from "@/components/Brand";
import Cta from "@/components/Cta";
import Navbar from "@/components/Navbar";
import Footer from "@/containers/Footer/footer.component";
import Header from "@/containers/Header/header.component";
import WhatUTCert from "@/containers/WhatUTCert/what_utcert.component";
import styles from "../styles/Overview.module.css";
import Features from "@/containers/Features/features.component";
import AboutUs from "@/components/AboutUs";
import HowToUse from "@/containers/HowToUse/how_to_use.component";

function Overview() {
    return (
        <>
            <div className={styles.overview}>
                <div className={styles.gradient__bg}>
                    <Navbar />
                    <Header />
                </div>
                <Brand />
                <WhatUTCert />
                <Features />
                <HowToUse />
                <Cta />
                <AboutUs />
                <Footer />
            </div>
        </>
    );
}

export default Overview;
