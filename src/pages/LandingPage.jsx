import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/LandingPage.module.css";
import axios from "axios";
import { useCustomAlert } from "../hooks/useCustomAlert";

const LandingPage = () => {
    const [searchInput, setSearchInput] = useState("");
    const [vehicleData, setVehicleData] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const searchContainerRef = useRef(null);
    const { showAlert, AlertComponent } = useCustomAlert();

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
    if (isOutOfRange) showAlert("This VIN is outside the supported range (2015–2020). Not all data will be displayed.", "info");

    const kilowatts = specs.engine_power_kw;
    const horsepowerValue = kilowatts ? (parseFloat(kilowatts) * 1.34102) : null;
    const horsepower = horsepowerValue ? horsepowerValue.toFixed(0) + " bhp" : "N/A";

    const weight = specs.curb_weight_pounds ? (parseFloat(specs.curb_weight_pounds) / 2.205).toFixed(1) : null;

    const torqueFtLbs = specs.torque_ft_lbs;
    const torqueNm = torqueFtLbs ? (parseFloat(torqueFtLbs) * 1.35582).toFixed(0) + " Nm" : "N/A";

    const engineConfigRaw = specs.engine_configuration;
    const engineShape = engineConfigRaw?.startsWith("V") ? "V" : engineConfigRaw?.startsWith("I") ? "I" : "";
    const engineCylinders = specs.engine_number_of_cylinders;
    const engine = (!engineShape || !engineCylinders || isHidden(engineCylinders)) ? "N/A" : `${engineShape}${engineCylinders}`;

    return {
        heading: headingParts.join(" ") || "",
        year: year ?? "N/A",
        msrp: trimObj.msrp ? `$${trimObj.msrp}` : "N/A",
        engineDisplacement: clean(specs.displacement_cc),
        engine,
        aspiration: clean(specs.valve_train_design),
        fuelType: clean(specs.fuel_type_primary),
        gearbox: clean(specs.transmission_speeds),
        transmissionType: clean(specs.transmission_style),
        drivetrain: clean(specs.drive_type),
        horsepower,
        torque: torqueNm,
        weight: weight ?? "N/A",
        seats: clean(specs.seats),
        fuelTank: clean(specs.fuel_tank_capacity_l),
        fuelEfficiency: clean(specs.fuel_consumption_l_per_100_km),
        bodyClass: clean(specs.body_class)
    };
    };

    // Fetch search suggestions
    const fetchSuggestions = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        // Check if it's a VIN (17 characters) - don't show suggestions for VINs
        const isVIN = /^[A-HJ-NPR-Z0-9]{17}$/i.test(query);
        if (isVIN) {
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
                console.log("First trim full object:", validTrims[0]);
                console.log("First trim keys:", Object.keys(validTrims[0]));
            }

            // Get unique combinations and limit to 5
            const uniqueTrims = [];
            const seen = new Set();
            
            for (const trim of validTrims) {
                const makeName = trim.make_model?.make?.name || make;
                const modelName = trim.make_model?.name || model;
                const trimName = trim.name;
                
                // Skip if we don't have all required data
                if (!makeName || !modelName || !trimName) {
                    continue;
                }
                
                console.log("Raw trim data:", { 
                    fullTrimObject: trim.make_model,
                    extractedMake: makeName, 
                    extractedModel: modelName, 
                    extractedTrim: trimName 
                });
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
                    console.log("Added suggestion:", { makeName, modelName, trimName, year: trim.year });
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

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        setSelectedSuggestion(null); // Clear selection when user types
        fetchSuggestions(value);
    };

    // Handle suggestion click
    const handleSuggestionClick = async (suggestion) => {
        setSearchInput(suggestion.displayText);
        setSelectedSuggestion(suggestion);
        setShowSuggestions(false);
        setSuggestions([]);
        
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
                showAlert(`Error fetching vehicle data: ${trims.message || "Invalid response from API"}`, "error");
                return;
            }
            
            // Find the exact trim and year
            const matchingTrim = trims.find(trim => 
                trim.name === suggestion.trim && 
                trim.year === suggestion.year
            );

            if (matchingTrim) {
                // Get full vehicle data for this specific trim
                const vehicleOptions = {
                    method: "GET",
                    url: `https://car-api2.p.rapidapi.com/api/trims/${matchingTrim.id}`,
                    headers: {
                        "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
                        "x-rapidapi-host": process.env.REACT_APP_RAPIDAPI_HOST
                    }
                };
                
                const vehicleResponse = await axios.request(vehicleOptions);
                console.log("Vehicle data from trim ID:", vehicleResponse.data);
                console.log("Checking for photos/images:", {
                    photos: vehicleResponse.data.photos,
                    images: vehicleResponse.data.images,
                    media: vehicleResponse.data.media,
                    allKeys: Object.keys(vehicleResponse.data)
                });
                
                // Try to get more complete data by searching for a VIN of this make/model/year
                // First, let's try the /vins endpoint to find a VIN for this vehicle
                try {
                    const vinSearchOptions = {
                        method: "GET",
                        url: `https://car-api2.p.rapidapi.com/api/vins?make=${suggestion.make}&model=${suggestion.model}&year=${suggestion.year}&trim=${suggestion.trim}`,
                        headers: {
                            "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
                            "x-rapidapi-host": process.env.REACT_APP_RAPIDAPI_HOST
                        }
                    };
                    
                    const vinSearchResponse = await axios.request(vinSearchOptions);
                    console.log("VIN search response:", vinSearchResponse.data);
                    
                    // If we found a VIN, use it to get complete specs
                    if (vinSearchResponse.data.data && vinSearchResponse.data.data.length > 0) {
                        const vin = vinSearchResponse.data.data[0].vin;
                        console.log("Found VIN:", vin);
                        
                        const vinOptions = {
                            method: "GET",
                            url: `https://car-api2.p.rapidapi.com/api/vin/${vin}`,
                            headers: {
                                "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
                                "x-rapidapi-host": process.env.REACT_APP_RAPIDAPI_HOST
                            }
                        };
                        
                        const vinResponse = await axios.request(vinOptions);
                        console.log("Complete VIN data:", vinResponse.data);
                        const data = extractData(vinResponse.data);
                        setVehicleData(data);
                        return;
                    }
                } catch (vinError) {
                    console.log("Could not fetch VIN data, using trim data:", vinError);
                }
                
                // Fallback to trim data if VIN search fails
                const data = extractData(vehicleResponse.data);
                setVehicleData(data);
            } else {
                showAlert("Could not find the selected vehicle.", "error");
            }
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            showAlert("Error fetching vehicle data. Please try again.", "error");
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchLandingVehicle = async () => {
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
            setVehicleData(data);
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            showAlert("Error fetching vehicle data. Please try again.", "error");
        }
    } else {
        // Search by Make/Model/Trim
        if (!searchInput.includes(" ")) {
            showAlert("Please enter both Make and Model (e.g., `GMC Canyon`)", "info");
            return;
        }

        let make, model, trimName;
        
        // If user selected from dropdown, use those exact values
        if (selectedSuggestion) {
            make = selectedSuggestion.make;
            model = selectedSuggestion.model;
            trimName = selectedSuggestion.trim;
        } else {
            // Otherwise parse the input
            const [makePart, ...modelParts] = searchInput.split(" ");
            make = makePart;
            model = modelParts.join(" ");
        }

        const options = {
            method: "GET",
            url: `https://car-api2.p.rapidapi.com/api/trims?make=${make}&model=${model}&verbose=yes`,
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
                showAlert(`Error fetching vehicle data: ${trims.message || "Invalid response from API"}`, "error");
                return;
            }
            
            if (trims.length === 0) {
                showAlert("No vehicles found for that Make/Model combination.", "info");
                return;
            }

            // Filter to only include trims from 2015-2020 (free tier range) and without subscription message
            let validTrims = trims.filter(trim => 
                trim.year >= 2015 && 
                trim.year <= 2020 && 
                !trim.name?.includes("subscription required")
            );

            // If user selected a specific trim from dropdown, filter to that trim and year
            if (selectedSuggestion) {
                const matchingTrims = validTrims.filter(trim => 
                    trim.name === trimName && 
                    trim.year === selectedSuggestion.year
                );
                if (matchingTrims.length > 0) {
                    validTrims = matchingTrims;
                }
            }

            if (validTrims.length === 0) {
                showAlert("No vehicles found in the 2015-2020 range. Please try a different make/model or use a VIN.", "info");
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
            setVehicleData(data);
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            showAlert("Error fetching vehicle data. Please try again.", "error");
        }
    }
    };

    const handleKeyDown = (e) => {
    if (e.key === "Enter") {
        searchLandingVehicle();
    }
    };

    const renderGrid = (vehicleData) => (
    <div>
        {vehicleData.heading && <h3>{vehicleData.heading}</h3>}
        <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px",
        backgroundColor: "transparent",
        marginTop: "10px"
        }}>
        {Object.entries(vehicleData).map(([key, value]) => {
            if (key === "heading" || key === "powerToWeight") return null;
            return (
            <div key={key} className={styles.statBox}>
                <strong>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</strong>
                <p>{value}</p>
            </div>
            );
        })}
        </div>
    </div>
    );

    return (
    <>
    {AlertComponent}
    <div className={styles.container}>
        <h1 className={styles.heading}>REVVY</h1>
        <p className={styles.subtext}>
        Search for your vehicle using Make, Model, Trim, or VIN.
        </p>
        <div className={styles.searchContainer}>
        <div className={styles.inputWrapper} ref={searchContainerRef}>
            <input
                type="text"
                placeholder="Enter VIN or Make Model (e.g., 'GMC Canyon')"
                className={styles.input}
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
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
        <button className={styles.button} onClick={searchLandingVehicle}>Search</button>
        </div>
        <div className={styles.latestSearched}>
        <h2>Latest Searched</h2>
        {vehicleData ? renderGrid(vehicleData) : <p>Recently searched vehicles will appear here.</p>}
        </div>
    </div>
    </>
    );
};

export default LandingPage;
