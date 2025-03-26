import React, { useState } from "react";
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

    const engineConfigRaw = specs.engine_configuration;
    const engineShape = engineConfigRaw?.startsWith("V") ? "V" : engineConfigRaw?.startsWith("I") ? "I" : "";
    const engineCylinders = specs.engine_number_of_cylinders;
    const engine = (!engineShape || !engineCylinders || isHidden(engineCylinders)) ? "N/A" : `${engineShape}${engineCylinders}`;

    const gearbox = specs.transmission_speeds ? parseInt(specs.transmission_speeds) : 0;
    const displacement = specs.displacement_l ? parseFloat(specs.displacement_l) : 0;
    const msrp = trimObj.msrp ? parseInt(trimObj.msrp) : 0;
    const year = data.year ?? 0;

    const horsepower = specs.engine_power_kw
      ? clean((parseFloat(specs.engine_power_kw) * 1.34102).toFixed(0), " bhp")
        : "N/A";

    const topSpeed = specs.top_speed_mph
      ? clean((parseFloat(specs.top_speed_mph) * 1.60934).toFixed(0), " km/h")
        : "N/A";

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
        year: data.year ?? "N/A",
        msrp: trimObj.msrp ? `R${trimObj.msrp}` : "N/A",
        engineDisplacement: clean(specs.displacement_cc, " cc"),
        engine,
        aspiration: clean(specs.valve_train_design),
        fuelType: clean(specs.fuel_type_primary),
        gearbox: clean(specs.transmission_speeds),
        transmissionType: clean(specs.transmission_style),
        drivetrain: clean(specs.drive_type),
        horsepower,
        topSpeed,
        weight,
        powerToWeight,
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

    const fetchVehicleData = async (vin, setDataFn) => {
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
    setDataFn(data);
    } catch (error) {
    console.error("Error fetching vehicle data:", error);
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
        <input
            type="text"
            placeholder="Search Vehicle 1"
            value={vin1}
            onChange={(e) => setVin1(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, vin1, setVehicle1Data)}
            className={styles.searchBar}
        />
        {vehicle1Data ? renderGrid(vehicle1Data) : <p>Search and compare vehicles</p>}
        </div>

        <div className={styles.column}>
        <input
            type="text"
            placeholder="Search Vehicle 2"
            value={vin2}
            onChange={(e) => setVin2(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, vin2, setVehicle2Data)}
            className={styles.searchBar}
        />
        {vehicle2Data ? renderGrid(vehicle2Data) : <p>Search and compare vehicles</p>}
        </div>
    </div>
    </div>
);
};

export default ComparisonPage;
