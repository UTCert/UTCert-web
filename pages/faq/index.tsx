import Navbar from "@/components/Navbar";
import styles from "../../styles/Overview.module.css";
import FAQ from "@/containers/FAQ/faq.page";
import Footer from "@/containers/Footer/footer.component";

function FAQPage() {
    return (
        <>
            <div className={styles.overview}>
                <div className={styles.gradient__bg}>
                    <Navbar />
                </div>
               <FAQ/>
               <Footer />
            </div>
        </>
    );
}

export default FAQPage;
