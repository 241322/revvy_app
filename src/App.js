import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import ComparisonPage from "./pages/ComparisonPage";
import TimelinePage from "./pages/TimelinePage";
import styles from "./styles/App.module.css";
import logo from "./assets/revvy-logo.png"; 
import houseIcon from "./assets/house.svg";
import comparisonIcon from "./assets/comparison.svg";
import calendarIcon from "./assets/calendar-days.svg"; 

// Define page order
const pageOrder = {
  "/": 0,
  "/comparison": 1,
  "/timeline": 2
};

function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");
  const [direction, setDirection] = useState("up");

  useEffect(() => {
    if (location !== displayLocation) {
      const currentIndex = pageOrder[displayLocation.pathname] || 0;
      const nextIndex = pageOrder[location.pathname] || 0;
      
      // Determine direction based on page order
      if (nextIndex > currentIndex) {
        setDirection("up"); // Going forward (down in nav)
      } else {
        setDirection("down"); // Going backward (up in nav)
      }
      
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`${styles.routeWrapper} ${styles[transitionStage]} ${styles[direction]}`}
      onAnimationEnd={() => {
        if (transitionStage === "fadeOut") {
          setTransitionStage("fadeIn");
          setDisplayLocation(location);
        }
      }}
    >
      <Routes location={displayLocation}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/comparison" element={<ComparisonPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className={styles.appContainer}>
        <nav className={styles.sidebar}>
          <div className={styles.logoContainer}>
            <img src={logo} alt="Revvy Logo" className={styles.logo} />
          </div>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link to="/" className={styles.navLink}>
                <img src={houseIcon} alt="Home" className={styles.icon} />
                <span className={styles.text}>Home</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/comparison" className={styles.navLink}>
                <img src={comparisonIcon} alt="Comparison" className={styles.icon} />
                <span className={styles.text}>Comparison</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/timeline" className={styles.navLink}>
                <img src={calendarIcon} alt="Timeline" className={styles.icon} />
                <span className={styles.text}>Timeline</span>
              </Link>
            </li>
          </ul>
        </nav>
        <div className={styles.content}>
          <AnimatedRoutes />
        </div>
      </div>
    </Router>
  );
}

export default App;
