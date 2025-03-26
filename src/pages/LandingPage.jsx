import React, { useState } from "react";
import styles from "../styles/LandingPage.module.css";
import axios from "axios";

const LandingPage = () => {
    const [vin, setVin] = useState("");
    const [vehicleData, setVehicleData] = useState(null);

    const isHidden = (val) => typeof val === "string" && val.includes("***");
    const clean = (val, unit = "") => (!val || isHidden(val)) ? "N/A" : `${val}${unit}`;

    const extractData = (data) => {
    const specs = data.specs ?? {};
    const trimObj = Array.isArray(data.trims) ? data.trims[0] : {};

    const headingParts = [data.make, data.model, data.trim].filter(
        (part) => part && !isHidden(part)
    );

    const dataLimitedMsg = "NOTE: Data is limited to 2015-2020 for non-paying users";
    const isOutOfRange = [data.model, data.trim].some(
        (val) => typeof val === "string" && val.includes(dataLimitedMsg)
    );
    if (isOutOfRange) alert("This VIN is outside the supported range (2015–2020). Not all data will be displayed.");

    const kilowatts = specs.engine_power_kw;
    const horsepowerValue = kilowatts ? (parseFloat(kilowatts) * 1.34102) : null;
    const horsepower = horsepowerValue ? horsepowerValue.toFixed(0) + " bhp" : "N/A";

    const weight = specs.curb_weight_pounds ? (parseFloat(specs.curb_weight_pounds) / 2.205).toFixed(1) : null;

    const topSpeedMph = specs.top_speed_mph;
    const topSpeedKph = topSpeedMph ? (parseFloat(topSpeedMph) * 1.60934).toFixed(0) + " km/h" : "N/A";

    const engineConfigRaw = specs.engine_configuration;
    const engineShape = engineConfigRaw?.startsWith("V") ? "V" : engineConfigRaw?.startsWith("I") ? "I" : "";
    const engineCylinders = specs.engine_number_of_cylinders;
    const engine = (!engineShape || !engineCylinders || isHidden(engineCylinders)) ? "N/A" : `${engineShape}${engineCylinders}`;

    return {
        heading: headingParts.join(" ") || "",
        year: data.year ?? "N/A",
        msrp: trimObj.msrp ? `R${trimObj.msrp}` : "N/A",
        engineDisplacement: clean(specs.displacement_cc),
        engine,
        aspiration: clean(specs.valve_train_design),
        fuelType: clean(specs.fuel_type_primary),
        gearbox: clean(specs.transmission_speeds),
        transmissionType: clean(specs.transmission_style),
        drivetrain: clean(specs.drive_type),
        horsepower,
        topSpeed: topSpeedKph,
        weight: weight ?? "N/A",
        fuelTank: clean(specs.fuel_tank_capacity_l),
        fuelEfficiency: clean(specs.fuel_consumption_l_per_100_km),
        bodyClass: clean(specs.body_class)
    };
    };

    const searchLandingVehicle = async () => {
    if (!vin) return;

    const options = {
        method: "GET",
        url: `https://car-api2.p.rapidapi.com/api/vin/${vin}`,
        headers: {
        "x-rapidapi-key": "b0cfcdeaacmshfbeaeb3c7c2f25ap129777jsn7bd8637ddc5f",
        "x-rapidapi-host": "car-api2.p.rapidapi.com"
        }
    };

    try {
        const response = await axios.request(options);
        const data = extractData(response.data);
        setVehicleData(data);
    } catch (error) {
        console.error("Error fetching vehicle data:", error);
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
    <div className={styles.container}>
        <h1 className={styles.heading}>REVVY</h1>
        <p className={styles.subtext}>
        Search for your vehicle using Make, Model, Trim, or VIN.
        </p>
        <div className={styles.searchContainer}>
        <input
            type="text"
            placeholder="Make, Model, Trim or VIN..."
            className={styles.input}
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            onKeyDown={handleKeyDown}
        />
        <button className={styles.button} onClick={searchLandingVehicle}>Search</button>
        </div>
        <div className={styles.latestSearched}>
        <h2>Latest Searched</h2>
        {vehicleData ? renderGrid(vehicleData) : <p>Recently searched vehicles will appear here.</p>}
        </div>
    </div>
    );
};

export default LandingPage;
