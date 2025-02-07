import Navbar from "@/components/Navbar";
import styles from "../styles/Overview.module.css";

const FAQ = () => {
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

export default FAQ;
