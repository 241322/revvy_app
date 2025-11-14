import React, { useState, useEffect, useRef } from "react";
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
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const searchContainerRef = useRef(null);

    // Fetch search suggestions
    const fetchSuggestions = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoadingSuggestions(true);

        // Split input to get make and model
        const parts = query.trim().split(/\s+/);
        const make = parts[0];
        const model = parts.slice(1).join(" ");

        // Only fetch suggestions if user has typed at least make and partial model
        if (!model || model.length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsLoadingSuggestions(false);
            return;
        }

        try {
            const options = {
                method: "GET",
                url: `https://car-api2.p.rapidapi.com/api/trims?make=${make}&model=${model}&verbose=yes`,
                headers: {
                    "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
                    "x-rapidapi-host": process.env.REACT_APP_RAPIDAPI_HOST
                }
            };

            const response = await axios.request(options);
            const trims = response.data.data || [];

            // Filter valid trims (2015-2020, no subscription required)
            const validTrims = trims.filter(trim => 
                trim.year >= 2015 && 
                trim.year <= 2020 && 
                !trim.name?.includes("subscription required")
            );

            // Debug: Log first trim to see structure
            if (validTrims.length > 0) {
                console.log("Found", validTrims.length, "valid trims for", make, model);
            }

            // Get unique combinations and limit to 5
            const uniqueTrims = [];
            const seen = new Set();
            
            for (const trim of validTrims) {
                const makeName = trim.make_model?.make?.name;
                const modelName = trim.make_model?.name;
                const trimName = trim.name;
                
                // Skip if we don't have all required data
                if (!makeName || !modelName || !trimName) {
                    continue;
                }
                
                const key = `${makeName}-${modelName}-${trimName}-${trim.year}`;
                
                if (!seen.has(key) && uniqueTrims.length < 5) {
                    seen.add(key);
                    uniqueTrims.push({
                        make: makeName,
                        model: modelName,
                        trim: trimName,
                        year: trim.year,
                        displayText: `${makeName} ${modelName} ${trimName}`
                    });
                }
            }

            setSuggestions(uniqueTrims);
            setShowSuggestions(uniqueTrims.length > 0);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedSuggestion(null);
        fetchSuggestions(value);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.displayText);
        setSelectedSuggestion(suggestion);
        setShowSuggestions(false);
        setSuggestions([]);
        // Trigger search immediately
        fetchDataFromMakeModel(suggestion.make, suggestion.model);
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchDataFromMakeModel = async (makeParam, modelParam) => {
        let make, model;
        
        if (makeParam && modelParam) {
            // Called from suggestion click
            make = makeParam;
            model = modelParam;
        } else {
            // Called from search button
            if (!searchTerm.includes(" ")) return alert("Please enter both Make and Model, e.g. 'Volkswagen Touareg'");
            
            const parts = searchTerm.split(" ");
            make = parts[0];
            model = parts.slice(1).join(" ");
        }

        const modelOptions = {
            method: "GET",
            url: `https://car-api2.p.rapidapi.com/api/trims?make=${make}&model=${model}`,
            headers: {
                "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
                "x-rapidapi-host": process.env.REACT_APP_RAPIDAPI_HOST
            }
        };

        try {
            const modelResponse = await axios.request(modelOptions);
            const trims = modelResponse.data.data || [];

            const yearCounts = {};
            const msrpByYear = {};

            trims.forEach(trim => {
                if (trim.year) {
                    yearCounts[trim.year] = (yearCounts[trim.year] || 0) + 1;

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
            <div className={styles.searchContainer} ref={searchContainerRef}>
                <input
                    type="text"
                    placeholder="Enter Make and Model (e.g. Volkswagen Touareg)"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === "Enter" && fetchDataFromMakeModel()}
                    className={styles.searchBar}
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && (
                    <div className={styles.suggestionsDropdown}>
                    {isLoadingSuggestions ? (
                        <div className={styles.suggestionItem}>Loading...</div>
                    ) : (
                        suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className={styles.suggestionItem}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            <span className={styles.suggestionText}>
                            {suggestion.make} {suggestion.model} {suggestion.trim}
                            </span>
                            <span className={styles.suggestionYear}>{suggestion.year}</span>
                        </div>
                        ))
                    )}
                    </div>
                )}
            </div>
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
                    <p style={{ color: '#aaa' }}>Enter a Make and Model to view model year timeline.</p>
                )}
            </div>
        </div>
    );
};

export default TimelinePage;
