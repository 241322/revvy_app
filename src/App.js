import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ComparisonPage from "./pages/ComparisonPage";
import TimelinePage from "./pages/TimelinePage";
import styles from "./styles/App.module.css";
import logo from "./assets/revvy-logo.png"; // Import the logo

function App() {
  return (
    <Router>
      <div className={styles.appContainer}>
        <nav className={styles.sidebar}>
          {/* Logo at the top, separate from nav links */}
          <div className={styles.logoContainer}>
            <img src={logo} alt="Revvy Logo" className={styles.logo} />
          </div>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link to="/" className={styles.navLink}>
                <span className={styles.icon}>🏠</span>
                <span className={styles.text}>Home</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/comparison" className={styles.navLink}>
                <span className={styles.icon}>↔️</span>
                <span className={styles.text}>Comparison</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/timeline" className={styles.navLink}>
                <span className={styles.icon}>📅</span>
                <span className={styles.text}>Timeline</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className={styles.content}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
