import React, { useState } from "react";
import styles from "../styles/ComparisonPage.module.css";

const ComparisonPage = () => {
const [vehicle1, setVehicle1] = useState("");
const [vehicle2, setVehicle2] = useState("");

return (
    <div className={styles.container}>
    <h1 className={styles.heading}>Compare Vehicles</h1>
    <div className={styles.comparisonTable}>
        <div className={styles.column}>
        <input
            type="text"
            placeholder="Search Vehicle 1"
            value={vehicle1}
            onChange={(e) => setVehicle1(e.target.value)}
            className={styles.searchBar}
        />
        <h2>Volkswagen Toureg TDi</h2>
        <div className="VehicleCardTopStats">
                <p><strong>MSRP: </strong>$54,495</p>
                <p><strong>Model Year: </strong>2018</p>
        </div>
        <div className="statsList">
        
            <hr/>
                <p><strong>Engine</strong></p>
            
            
                <p>Displacement: 3.0L</p>
            
            
                <p>Cyllinders: v6</p>
            
            
                <p>Aspiration: Turbodiesel</p>

                <p>Fuel Type: Diesel</p>
            
                <hr/>
            
                <p><strong>Gearbox</strong></p>
            
            
                <p>Speeds: 8</p>
            
            
                <p>Transmission: Automatic</p>

                <hr/>
            
                <p><strong>Drivetrain: </strong>AWD</p>

                <hr/>

                <p><strong>Power</strong></p>

                <p>Horsepower: 256 hp</p>

                <p>Torque: 600 Nm</p>

                <hr/>

                <p><strong>Weight</strong></p>

                <p>Unladen Weight: 2070 kg</p>

                <p>Power to Weight: 8,08 hp/kg</p>

                <hr/>

                <p><strong>Fuel Consumption</strong></p>

                <p>Fuel Tank Capacity: 100 L</p>
                
                <p>Mileage: 7.4 L/100km</p>

            
        
        </div>
        </div>
        <div className={styles.column}>
        <input
            type="text"
            placeholder= "Search Vehicle 2"
            value={vehicle2}
            onChange={(e) => setVehicle2(e.target.value)}
            className={styles.searchBar}
        />
        <h2>BMW X5 M50d</h2>
        <div className="VehicleCardTopStats">
                <p><strong>MSRP: </strong>$82,204</p>
                <p><strong>Model Year: </strong>2018</p>
        </div>
        <div className="statsList">
        
            <hr/>
                <p><strong>Engine</strong></p>
            
            
                <p>Displacement: 3.0L</p>
            
            
                <p>Cyllinders: i6</p>
            
            
                <p>Aspiration: Quad-Turbo</p>

                <p>Fuel Type: Diesel</p>
            
                <hr/>
            
                <p><strong>Gearbox</strong></p>
            
            
                <p>Speeds: 8</p>
            
            
                <p>Transmission: Automatic</p>

                <hr/>
            
                <p><strong>Drivetrain: </strong>AWD</p>
            
                <hr/>

                <p><strong>Power</strong></p>

                <p>Horsepower: 381 hp</p>

                <p>Torque: 740 Nm</p>

                <hr/>

                <p><strong>Weight</strong></p>

                <p>Unladen Weight: 2128 kg</p>

                <p>Power to Weight: 5,58 hp/kg</p>

                <hr/>

                <p><strong>Fuel Consumption</strong></p>

                <p>Fuel Tank Capacity: 85 L</p>

                <p>Mileage: 6.7 L/100km</p>
        </div>
        </div>
    </div>
    </div>
);
};

export default ComparisonPage;
