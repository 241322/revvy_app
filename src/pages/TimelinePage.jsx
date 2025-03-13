import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import styles from "../styles/TimelinePage.module.css";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement);

let searchedCar = "Volkswagen Touareg";

const TimelinePage = () => {
const [searchTerm, setSearchTerm] = useState("");

const data = {
    labels: ["2002", "2003", "2010", "2018"],
    datasets: [
    {
        label: searchedCar + " Generation ",
        data: [0, 1, 2, 3],
        backgroundColor: "rgb(255, 0, 0)",
        borderColor: "#ff0000",
        borderRadius: "5px",
        borderWidth: 6, // Make the line THICKER
        tension: 0.4, // Adjusts line smoothness
        pointRadius: 8, // Larger points
        pointHoverRadius: 10, // Even bigger points on hover
        pointBorderWidth: 2, // Thicker border around points
        pointBackgroundColor: '#ffffff', // White point color
        pointBorderColor: '#ffffff' // White border
    },
    ],
};

const options = {
    responsive: true,
    maintainAspectRatio: false,


    animations: {
        tension: {
        duration: 1500,
        easing: 'easeInOutElastic',
        from: 0.5,
        to: 0
        }
    },

    hover: {
        mode: 'nearest',
        animationDuration: 400 // Hover animation speed (in ms)
    },

    elements: {
        point: {
          radius: 5, // Default size
          hoverRadius: 10, // Size when hovered
          hoverBorderWidth: 3 // Border size on hover
        }
    },
    scales: {
        y: { display: true },
        x: { display: true },
        },
        x: {
        ticks: {
            color: '#ffffff', // White text for X-axis labels
            font: {
            size: 16,
            weight: 'bold'
            }
        }
        },
        y: {
        ticks: {
            color: '#ffffff', // White text for Y-axis labels
            font: {
            size: 16,
            weight: 'bold'
            }
        }
        },
    plugins: {
        legend: {
        labels: {
            color: '#ffffff', // White text for legend
            font: {
            size: 14,
            weight: 'bold'
            }
        }
        }
    }
};

return (
    <div className={styles.chartContainer}>
    <h1 className={styles.heading}>Vehicle Timeline</h1>
    <input
        type="text"
        placeholder="Search Timeline..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchBar}
    />
    <div className={styles.chartWrapper}>
        <Line data={data} options={options} />
    </div>
    </div>
);
};

export default TimelinePage;
