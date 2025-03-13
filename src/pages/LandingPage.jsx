import React from "react";
import styles from "../styles/LandingPage.module.css";

const LandingPage = () => {
return (
    <div className={styles.container}>
    <h1 className={styles.heading}>REVVY</h1>
    <p className={styles.subtext}>
        Search for your vehicle using Make, Model, Trim, or VIN.
    </p>
    <div className={styles.searchContainer}>
        <input type="text" placeholder="Make, Model, Trim or VIN..." className={styles.input} />
        <button className={styles.button}>Search</button>
    </div>
    <div className={styles.latestSearched}>
        <h2>Latest Searched</h2>
        <p>Recently searched vehicles will appear here.</p>
    </div>
    </div>
);
};

export default LandingPage;