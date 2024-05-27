import Navbar from "@/components/Navbar";
import styles from "../styles/Overview.module.css";
import FAQ from "@/containers/FAQ/faq.page";

function FAQPage() {
    return (
        <>
            <div className={styles.overview}>
                <div className={styles.gradient__bg}>
                    <Navbar />
                </div>
               <FAQ/>
            </div>
        </>
    );
}

export default FAQPage;
