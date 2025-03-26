import React, { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import styles from "../styles/TimelinePage.module.css";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement);

const TimelinePage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [yearChartData, setYearChartData] = useState(null);
    const [msrpChartData, setMsrpChartData] = useState(null);

    const fetchDataFromVin = async () => {
    if (!searchTerm) return alert("Please enter a VIN number");

    const vinOptions = {
        method: "GET",
        url: `https://car-api2.p.rapidapi.com/api/vin/${searchTerm}`,
        headers: {
        "x-rapidapi-key": "b0cfcdeaacmshfbeaeb3c7c2f25ap129777jsn7bd8637ddc5f",
        "x-rapidapi-host": "car-api2.p.rapidapi.com"
        }
    };

    try {
        const vinResponse = await axios.request(vinOptions);
        const vinData = vinResponse.data;
        const make = vinData.make;
        const model = vinData.model;

        if (!make || !model) {
        alert("Could not extract make and model from VIN data.");
        return;
        }

        const modelOptions = {
        method: "GET",
        url: `https://car-api2.p.rapidapi.com/api/trims?make=${make}&model=${model}`,
        headers: {
            "x-rapidapi-key": "b0cfcdeaacmshfbeaeb3c7c2f25ap129777jsn7bd8637ddc5f",
            "x-rapidapi-host": "car-api2.p.rapidapi.com"
        }
        };

        const modelResponse = await axios.request(modelOptions);
        const trims = modelResponse.data.data || [];

        const yearCounts = {};
        const msrpByYear = {};
        const trimLabels = {};

        trims.forEach(trim => {
        if (trim.year) {
            yearCounts[trim.year] = (yearCounts[trim.year] || 0) + 1;

            if (!trimLabels[trim.year]) {
            trimLabels[trim.year] = [];
            }
            trimLabels[trim.year].push(trim.name);

            if (!msrpByYear[trim.year]) {
            msrpByYear[trim.year] = [];
            }
            if (trim.msrp) {
            msrpByYear[trim.year].push(trim.msrp);
            }
        }
        });

        const sortedYears = Object.keys(yearCounts).sort();
        const dataPoints = sortedYears.map(year => yearCounts[year]);
        const msrpAverages = sortedYears.map(year => {
        const prices = msrpByYear[year] || [];
        if (prices.length === 0) return null;
        const avg = prices.reduce((sum, val) => sum + val, 0) / prices.length;
        return parseFloat(avg.toFixed(0));
        });

        setYearChartData({
        labels: sortedYears,
        datasets: [
            {
            label: `${make} ${model} Model Year Count`,
            data: dataPoints,
            backgroundColor: "rgb(255, 0, 0)",
            borderColor: "#ff0000",
            borderWidth: 6,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBorderWidth: 2,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#ffffff'
            }
        ]
        });

        setMsrpChartData({
        labels: sortedYears,
        datasets: [
            {
            label: `${make} ${model} Avg MSRP`,
            data: msrpAverages,
            backgroundColor: "rgba(0, 153, 255, 0.3)",
            borderColor: "#0099ff",
            borderWidth: 6,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBorderWidth: 2,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#ffffff'
            }
        ]
        });

    } catch (error) {
        console.error("Error fetching model timeline data:", error);
    }
    };

    const yearChartOptions = {
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
        animationDuration: 400
    },
    elements: {
        point: {
        radius: 4,
        hoverRadius: 6,
        hoverBorderWidth: 2
        }
    },
    scales: {
        x: {
        title: {
            display: true,
            text: 'Model Year',
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
        },
        ticks: {
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
        },
        grid: { color: 'rgba(255,255,255,0.1)' }
        },
        y: {
        title: {
            display: true,
            text: 'Number of Trim Levels Released',
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
        },
        ticks: {
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
        },
        grid: { color: 'rgba(255,255,255,0.1)' }
        }
    },
    plugins: {
        legend: {
        labels: {
            color: '#ffffff',
            font: { size: 20, weight: 'bold' }
        }
        },
        tooltip: {
        callbacks: {
            title: (tooltipItems) => `Year: ${tooltipItems[0].label}`,
            label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw}`
        }
        }
    }
    };

    const msrpChartOptions = {
    ...yearChartOptions,
    scales: {
        ...yearChartOptions.scales,
        y: {
        ...yearChartOptions.scales.y,
        title: {
            display: true,
            text: 'Average MSRP in USD ($)',
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
        }
        }
    }
    };

    return (
    <div className={styles.chartContainer}>
        <h1 className={styles.heading}>Vehicle Timeline</h1>
        <input
        type="text"
        placeholder="Enter VIN number..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchDataFromVin()}
        className={styles.searchBar}
        />
        <div className={styles.chartWrapper} style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {yearChartData && (
            <div style={{ flex: 1, minWidth: '800px', height: '450px' }}>
            <Line data={yearChartData} options={yearChartOptions} />
            </div>
        )}
        {msrpChartData && (
            <div style={{ flex: 1, minWidth: '800px', height: '450px' }}>
            <Line data={msrpChartData} options={msrpChartOptions} />
            </div>
        )}
        {!yearChartData && !msrpChartData && (
            <p style={{ color: '#aaa' }}>Enter a VIN number to view model year timeline.</p>
        )}
        </div>
    </div>
    );
};

export default TimelinePage;
