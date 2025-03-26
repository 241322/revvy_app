## Author: [Xander Poalses](https://github.com/241322)

# Formative Assessment 1: React Application for Data Visualisation with ChartJS

For car enthusiasts, researchers, and potential buyers who wish to examine and contrast vehicles using actual data, this project is a VIN-powered vehicle data explorer. Data is extracted to:

- Look up a car using its VIN

- Present technical details in a clear, engaging format.

- Examine two separate cars side by side.

- See a vehicle's historical model year timeline and MSRP trends.

It is intended for users who wish to research the historical development of automobiles or make well-informed decisions.

## Appendix

#### API Source
- This app uses the [Car API v2](https://rapidapi.com/apininjas/api/car-api2) from RapidAPI to fetch vehicle data such as VIN details, trims, and specifications.
- Note: Non-paying users are limited to VINs from **2015–2020**.

#### Project Structure

```
/pages
  LandingPage.jsx         // VIN search and single vehicle data
  ComparisonPage.jsx      // Compare two vehicles
  TimelinePage.jsx        // Visual timeline of trims and MSRP

/styles
  LandingPage.module.css
  ComparisonPage.module.css
  TimelinePage.module.css
```

#### Test VINs to Try

- `1GTG6CEN0L1139305` (GMC Canyon 2020)
- `5UXKR0C5XF0K56785` (BMW X5 2015)
- `WVGZZZ7PZHD006123` (Volkswagen Touareg 2017)

#### Future Ideas

- Add user authentication and save vehicle history
- Export comparison results as PDF
- Add live exchange rate for MSRP conversion
- Add ability to search for Make and Model across all pages


## API Reference

#### Get data by via VIN

```http
  GET /api/vin/{vin}
```

#### Get data via Make and Model

```http
  GET /api/trims?make={make}&model={model}
```

| Parameter  | Type     | Description                          |
|------------|----------|--------------------------------------|
| `api_key`  | `string` | "b0cfcdeaacmshfbeaeb3c7c2f25ap129777jsn7bd8637ddc5f" |
| `vin`      | `string` | "1GTG6CEN0L1139305" |
| `make`     | `string` | "GMC" |
| `model`    | `string` | "Canyon" |
| `year`     | `number` | 2020 |

## Features

- VIN-Based Vehicle Lookup

- Real-Time Vehicle Comparison

- Timeline Visualization

- Interactive Charts & UI

##  Dependencies

This project relies on several modern web technologies and libraries to provide a responsive, data-driven user experience:

| Dependency                | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| **react**                 | Core library for building the user interface                                |
| **react-dom**             | Renders React components into the DOM                                       |
| **react-router-dom**      | Enables client-side routing across pages                                    |
| **react-scripts**         | Scripts and configuration from Create React App                             |
| **axios**                 | Promise-based HTTP client for calling the vehicle API                       |
| **chart.js**              | Powerful charting library used for data visualization                       |
| **react-chartjs-2**       | React wrapper for Chart.js components                                       |
| **web-vitals**            | Collects and reports essential performance metrics                          |
| **@testing-library/react** | Tools for testing React components                                          |
| **@testing-library/jest-dom** | Custom matchers for better DOM assertions in tests                     |
| **@testing-library/user-event** | Simulates user interactions in tests                                 |
| **@testing-library/dom**  | Base utilities for testing DOM nodes                                        |

These dependencies are defined in the [`package.json`](./package.json) file and can be installed with:

```bash
npm install
```

Start the development server:

```bash
npm start
```