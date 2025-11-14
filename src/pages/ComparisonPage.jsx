import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/ComparisonPage.module.css";
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const ComparisonPage = () => {
    const [vin1, setVin1] = useState("");
    const [vin2, setVin2] = useState("");
    const [vehicle1Data, setVehicle1Data] = useState(null);
    const [vehicle2Data, setVehicle2Data] = useState(null);
    
    // Suggestions for vehicle 1
    const [suggestions1, setSuggestions1] = useState([]);
    const [showSuggestions1, setShowSuggestions1] = useState(false);
    const [isLoadingSuggestions1, setIsLoadingSuggestions1] = useState(false);
    const [selectedSuggestion1, setSelectedSuggestion1] = useState(null);
    const searchContainer1Ref = useRef(null);
    
    // Suggestions for vehicle 2
    const [suggestions2, setSuggestions2] = useState([]);
    const [showSuggestions2, setShowSuggestions2] = useState(false);
    const [isLoadingSuggestions2, setIsLoadingSuggestions2] = useState(false);
    const [selectedSuggestion2, setSelectedSuggestion2] = useState(null);
    const searchContainer2Ref = useRef(null);

    const isHidden = (val) => typeof val === "string" && val.includes("***");
    const clean = (val, unit = "") => (!val || isHidden(val)) ? "N/A" : `${val}${unit}`;

    const extractData = (data) => {
    // Handle two different API response structures:
    // 1. VIN endpoint: has data.specs, data.make, data.model, data.trim
    // 2. Trim ID endpoint: has make_model_trim_engine, make_model_trim_body, make_model.make.name, etc.
    
    const isVinResponse = data.specs !== undefined;
    
    let specs, trimObj, make, model, trim, year;
    
    if (isVinResponse) {
        // VIN endpoint structure
        specs = data.specs ?? {};
        trimObj = Array.isArray(data.trims) ? data.trims[0] : {};
        make = data.make;
        model = data.model;
        trim = data.trim;
        year = data.year;
    } else {
        // Trim ID endpoint structure
        const engine = data.make_model_trim_engine || {};
        const body = data.make_model_trim_body || {};
        const mileage = data.make_model_trim_mileage || {};
        
        // Map trim endpoint fields to VIN endpoint field names
        specs = {
            engine_power_kw: engine.horsepower_hp ? (engine.horsepower_hp / 1.34102).toString() : null,
            torque_ft_lbs: engine.torque_ft_lbs,
            displacement_cc: engine.size ? (parseFloat(engine.size) * 1000).toString() : null,
            displacement_l: engine.size,
            engine_configuration: engine.cylinders,
            engine_number_of_cylinders: engine.cylinders?.replace(/[^0-9]/g, ''),
            valve_train_design: engine.cam_type,
            fuel_type_primary: engine.fuel_type,
            transmission_speeds: engine.transmission?.match(/\d+/)?.[0],
            transmission_style: engine.transmission,
            drive_type: engine.drive_type,
            curb_weight_pounds: body.curb_weight,
            fuel_tank_capacity_l: mileage.fuel_tank_capacity ? (parseFloat(mileage.fuel_tank_capacity) * 3.78541).toString() : null,
            fuel_consumption_l_per_100_km: mileage.combined_mpg ? (235.215 / mileage.combined_mpg).toFixed(1) : null,
            body_class: body.type,
            seats: body.seats
        };
        
        trimObj = {
            msrp: data.msrp,
            invoice: data.invoice
        };
        
        make = data.make_model?.make?.name;
        model = data.make_model?.name;
        trim = data.name;
        year = data.year;
    }

    const headingParts = [make, model, trim].filter(
        (part) => part && !isHidden(part)
    );

    const dataLimitedMsg = "NOTE: Data is limited to 2015-2020 for non-paying users";
    const isOutOfRange = [model, trim].some(
        (val) => typeof val === "string" && val.includes(dataLimitedMsg)
    );
    if (isOutOfRange) alert("This VIN is outside the supported range (2015–2020). Not all data will be displayed.");

    const engineConfigRaw = specs.engine_configuration;
    const engineShape = engineConfigRaw?.startsWith("V") ? "V" : engineConfigRaw?.startsWith("I") ? "I" : "";
    const engineCylinders = specs.engine_number_of_cylinders;
    const engine = (!engineShape || !engineCylinders || isHidden(engineCylinders)) ? "N/A" : `${engineShape}${engineCylinders}`;

    const gearbox = specs.transmission_speeds ? parseInt(specs.transmission_speeds) : 0;
    const displacement = specs.displacement_l ? parseFloat(specs.displacement_l) : 0;

    const horsepower = specs.engine_power_kw
      ? clean((parseFloat(specs.engine_power_kw) * 1.34102).toFixed(0), " bhp")
        : "N/A";

    const torqueFtLbs = specs.torque_ft_lbs;
    const torqueNm = torqueFtLbs ? (parseFloat(torqueFtLbs) * 1.35582).toFixed(0) + " Nm" : "N/A";

    const weight = specs.curb_weight_pounds
        ? clean((parseFloat(specs.curb_weight_pounds) / 2.205).toFixed(1), " kg")
        : "N/A";

    const powerToWeight = specs.engine_power_kw && specs.curb_weight_pounds
        ? clean((
          (parseFloat(specs.engine_power_kw) * 1.34102) /
            (parseFloat(specs.curb_weight_pounds) / 2.205)
        ).toFixed(2), " bhp/kg")
        : "N/A";

    return {
        heading: headingParts.join(" ") || "",
        year: year ?? "N/A",
        msrp: trimObj.msrp ? `$${trimObj.msrp}` : "N/A",
        engineDisplacement: clean(specs.displacement_cc, " cc"),
        engine,
        aspiration: clean(specs.valve_train_design),
        fuelType: clean(specs.fuel_type_primary),
        gearbox: clean(specs.transmission_speeds),
        transmissionType: clean(specs.transmission_style),
        drivetrain: clean(specs.drive_type),
        horsepower,
        torque: torqueNm,
        weight,
        powerToWeight,
        seats: clean(specs.seats),
    //   fuelTank: clean(specs.fuel_tank_capacity_l, " L"),
    //   fuelEfficiency: clean(specs.fuel_consumption_l_per_100_km, " L/100km"),
        bodyClass: clean(specs.body_class),
        chartData: {
        displacement,
        gearbox,
        cylinders: engineCylinders ? parseInt(engineCylinders) : 0
        }
    };
    };

    // Fetch search suggestions
    const fetchSuggestions = async (query, setSuggestionsFn, setShowFn, setLoadingFn) => {
        if (!query || query.length < 2) {
            setSuggestionsFn([]);
            setShowFn(false);
            return;
        }

        const isVIN = /^[A-HJ-NPR-Z0-9]{17}$/i.test(query);
        if (isVIN) {
            setSuggestionsFn([]);
            setShowFn(false);
            return;
        }

        setLoadingFn(true);

        const parts = query.trim().split(/\s+/);
        const make = parts[0];
        const model = parts.slice(1).join(" ");

        // Only fetch suggestions if user has typed at least make and partial model
        if (!model || model.length < 1) {
            setSuggestionsFn([]);
            setShowFn(false);
            setLoadingFn(false);
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

            setSuggestionsFn(uniqueTrims);
            setShowFn(uniqueTrims.length > 0);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestionsFn([]);
            setShowFn(false);
        } finally {
            setLoadingFn(false);
        }
    };

    // Handle input changes
    const handleInput1Change = (e) => {
        const value = e.target.value;
        setVin1(value);
        setSelectedSuggestion1(null);
        fetchSuggestions(value, setSuggestions1, setShowSuggestions1, setIsLoadingSuggestions1);
    };

    const handleInput2Change = (e) => {
        const value = e.target.value;
        setVin2(value);
        setSelectedSuggestion2(null);
        fetchSuggestions(value, setSuggestions2, setShowSuggestions2, setIsLoadingSuggestions2);
    };

    // Handle suggestion clicks
    const handleSuggestion1Click = async (suggestion) => {
        setVin1(suggestion.displayText);
        setSelectedSuggestion1(suggestion);
        setShowSuggestions1(false);
        setSuggestions1([]);
        
        // Trigger search immediately
        const options = {
            method: "GET",
            url: `https://car-api2.p.rapidapi.com/api/trims?make=${suggestion.make}&model=${suggestion.model}&verbose=yes`,
            headers: {
                "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
                "x-rapidapi-host": process.env.REACT_APP_RAPIDAPI_HOST
            }
        };

        try {
            const response = await axios.request(options);
            const trims = response.data.data || [];
            
            if (!Array.isArray(trims)) {
                alert(`Error fetching vehicle data: ${trims.message || "Invalid response from API"}`);
                return;
            }
            
            const matchingTrim = trims.find(trim => 
                trim.name === suggestion.trim && 
                trim.year === suggestion.year
            );

            if (matchingTrim) {
                const vehicleOptions = {
                    method: "GET",
                    url: `https://car-api2.p.rapidapi.com/api/trims/${matchingTrim.id}`,
                    headers: {
                        "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
                        "x-rapidapi-host": process.env.REACT_APP_RAPIDAPI_HOST
                    }
                };
                
                const vehicleResponse = await axios.request(vehicleOptions);
                const data = extractData(vehicleResponse.data);
                setVehicle1Data(data);
            }
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            alert("Error fetching vehicle data. Please try again.");
        }
    };

    const handleSuggestion2Click = async (suggestion) => {
        setVin2(suggestion.displayText);
        setSelectedSuggestion2(suggestion);
        setShowSuggestions2(false);
        setSuggestions2([]);
        
        // Trigger search immediately
        const options = {
            method: "GET",
            url: `https://car-api2.p.rapidapi.com/api/trims?make=${suggestion.make}&model=${suggestion.model}&verbose=yes`,
            headers: {
                "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
                "x-rapidapi-host": process.env.REACT_APP_RAPIDAPI_HOST
            }
        };

        try {
            const response = await axios.request(options);
            const trims = response.data.data || [];
            
            if (!Array.isArray(trims)) {
                alert(`Error fetching vehicle data: ${trims.message || "Invalid response from API"}`);
                return;
            }
            
            const matchingTrim = trims.find(trim => 
                trim.name === suggestion.trim && 
                trim.year === suggestion.year
            );

            if (matchingTrim) {
                const vehicleOptions = {
                    method: "GET",
                    url: `https://car-api2.p.rapidapi.com/api/trims/${matchingTrim.id}`,
                    headers: {
                        "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
                        "x-rapidapi-host": process.env.REACT_APP_RAPIDAPI_HOST
                    }
                };
                
                const vehicleResponse = await axios.request(vehicleOptions);
                const data = extractData(vehicleResponse.data);
                setVehicle2Data(data);
            }
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            alert("Error fetching vehicle data. Please try again.");
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainer1Ref.current && !searchContainer1Ref.current.contains(event.target)) {
                setShowSuggestions1(false);
            }
            if (searchContainer2Ref.current && !searchContainer2Ref.current.contains(event.target)) {
                setShowSuggestions2(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchVehicleData = async (searchInput, setDataFn) => {
    if (!searchInput) return;

    // Determine if input is VIN (17 characters, alphanumeric) or Make/Model
    const isVIN = /^[A-HJ-NPR-Z0-9]{17}$/i.test(searchInput);
    
    if (isVIN) {
        // Search by VIN
        const options = {
            method: "GET",
            url: `https://car-api2.p.rapidapi.com/api/vin/${searchInput}`,
            headers: {
                "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
                "x-rapidapi-host": process.env.REACT_APP_RAPIDAPI_HOST
            }
        };

        try {
            const response = await axios.request(options);
            const data = extractData(response.data);
            setDataFn(data);
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            alert("Error fetching vehicle data. Please try again.");
        }
    } else {
        // Search by Make/Model
        if (!searchInput.includes(" ")) {
            alert("Please enter both Make and Model (e.g., 'GMC Canyon')");
            return;
        }

        const [make, ...modelParts] = searchInput.split(" ");
        const model = modelParts.join(" ");

        const options = {
            method: "GET",
            url: `https://car-api2.p.rapidapi.com/api/trims?make=${make}&model=${model}`,
            headers: {
                "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
                "x-rapidapi-host": process.env.REACT_APP_RAPIDAPI_HOST
            }
        };

        try {
            const response = await axios.request(options);
            const trims = response.data.data || [];
            
            // Check if response is an error message
            if (!Array.isArray(trims)) {
                alert(`Error fetching vehicle data: ${trims.message || "Invalid response from API"}`);
                return;
            }
            
            if (trims.length === 0) {
                alert("No vehicles found for that Make/Model combination.");
                return;
            }

            // Filter to only include trims from 2015-2020 (free tier range) and without subscription message
            const validTrims = trims.filter(trim => 
                trim.year >= 2015 && 
                trim.year <= 2020 && 
                !trim.name?.includes("subscription required")
            );

            if (validTrims.length === 0) {
                alert("No vehicles found in the 2015-2020 range. Please try a different make/model or use a VIN.");
                return;
            }

            // Get the most recent valid trim (latest year)
            const sortedTrims = validTrims.sort((a, b) => b.year - a.year);
            const latestTrim = sortedTrims[0];

            // Extract make and model from the nested structure
            const makeName = latestTrim.make_model?.make?.name || make;
            const modelName = latestTrim.make_model?.name || model;

            // Use trim data directly (API doesn't provide VINs in trim response)
            const trimData = {
                make: makeName,
                model: modelName,
                year: latestTrim.year,
                trim: latestTrim.name,
                trims: [latestTrim],
                specs: {}
            };
            const data = extractData(trimData);
            setDataFn(data);
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            alert("Error fetching vehicle data. Please try again.");
        }
    }
};

const handleKeyDown = (e, vin, setDataFn) => {
    if (e.key === "Enter") {
    fetchVehicleData(vin, setDataFn);
    }
};

const renderGrid = (vehicleData) => (
    <div>
    {vehicleData.heading && <h3>{vehicleData.heading}</h3>}
    <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "10px",
        backgroundColor: "transparent",
        marginTop: "10px"
    }}>
        {Object.entries(vehicleData).map(([key, value]) => {
        if (key === "heading" || key === "chartData") return null;
        return (
            <div key={key} className={styles.statBox}>
            <strong>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</strong>
            <p>{value}</p>
            </div>
        );
        })}
    </div>
    {vehicleData.chartData && (
        <div style={{
        marginTop: '2rem',
        backgroundColor: '#1a1a1a',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
        <Bar
            data={{
            labels: ["Displacement (L)", "Gearbox Speeds", "Cylinders"],
            datasets: [
                {
                label: vehicleData.heading || "Vehicle",
                data: [
                    vehicleData.chartData.displacement,
                    vehicleData.chartData.gearbox,
                    vehicleData.chartData.cylinders
                ],
                backgroundColor: "rgba(255, 99, 99, 0.41)",
                borderColor: "rgb(255, 99, 99)",
                borderWidth: 1
                }
            ]
            }}
            options={{
            plugins: {
                tooltip: {
                callbacks: {
                    label: function (context) {
                    const units = {
                        "Displacement (L)": " L",
                        "Gearbox Speeds": " gears",
                        "Cylinders": " cyl"
                    };
                    const label = context.label;
                    const value = context.raw;
                    return `${label}: ${value}${units[label] || ''}`;
                    }
                }
                },
                legend: {
                labels: {
                    color: '#fff'
                }
                }
            },
            scales: {
                y: {
                min: 0,
                  max: 12, // Adjust based on realistic upper bounds for these metrics
                ticks: { color: '#fff' },
                grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
            }}
        />
        </div>
    )}
    </div>
);

return (
    <div className={styles.container}>
    <h1 className={styles.heading}>Compare Vehicles</h1>
    <div className={styles.comparisonTable}>
        <div className={styles.column}>
        <div style={{ position: 'relative' }} ref={searchContainer1Ref}>
            <input
            type="text"
            placeholder="Enter VIN or Make Model (e.g., 'GMC Canyon')"
            value={vin1}
            onChange={handleInput1Change}
            onKeyDown={(e) => handleKeyDown(e, vin1, setVehicle1Data)}
            onFocus={() => suggestions1.length > 0 && setShowSuggestions1(true)}
            className={styles.searchBar}
            />
            
            {/* Suggestions Dropdown for Vehicle 1 */}
            {showSuggestions1 && (
            <div className={styles.suggestionsDropdown}>
                {isLoadingSuggestions1 ? (
                <div className={styles.suggestionItem}>Loading...</div>
                ) : (
                suggestions1.map((suggestion, index) => (
                    <div
                    key={index}
                    className={styles.suggestionItem}
                    onClick={() => handleSuggestion1Click(suggestion)}
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
        {vehicle1Data ? renderGrid(vehicle1Data) : <p>Search and compare vehicles</p>}
        </div>

        <div className={styles.column}>
        <div style={{ position: 'relative' }} ref={searchContainer2Ref}>
            <input
            type="text"
            placeholder="Enter VIN or Make Model (e.g., 'BMW X5')"
            value={vin2}
            onChange={handleInput2Change}
            onKeyDown={(e) => handleKeyDown(e, vin2, setVehicle2Data)}
            onFocus={() => suggestions2.length > 0 && setShowSuggestions2(true)}
            className={styles.searchBar}
            />
            
            {/* Suggestions Dropdown for Vehicle 2 */}
            {showSuggestions2 && (
            <div className={styles.suggestionsDropdown}>
                {isLoadingSuggestions2 ? (
                <div className={styles.suggestionItem}>Loading...</div>
                ) : (
                suggestions2.map((suggestion, index) => (
                    <div
                    key={index}
                    className={styles.suggestionItem}
                    onClick={() => handleSuggestion2Click(suggestion)}
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
        {vehicle2Data ? renderGrid(vehicle2Data) : <p>Search and compare vehicles</p>}
        </div>
    </div>
    </div>
);
};

export default ComparisonPage;
