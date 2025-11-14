# Technical Description

## Application Overview

This is a React-based single-page application (SPA) that enables users to fetch and visualise vehicle data using a public API based on a VIN (Vehicle Identification Number) input. The application is designed to provide clear data output for users looking to inspect or compare vehicle specifications and pricing trends.

## Technologies Used

- **Framework:** React 19 (Create React App build system)
- **Charting Library:** Chart.js via `react-chartjs-2`
- **Data Source:** Car API v2 from RapidAPI (VIN-based and Make/Model queries)
- **Routing:** React Router DOM
- **State Management:** React Hooks (`useState`, `useEffect`)
- **HTTP Client:** Axios
- **Styling:** CSS Modules

## Page Structure and Data Flow

### 1. Landing Page

- Contains a user input field for VIN numbers.
- Provides brief introductory content about the application.
- No charts or data visualisation components are rendered here.
- After a valid VIN is entered, the user is redirected to the Comparison Page.

### 2. Comparison Page

- Fetches and displays vehicle information based on the provided VIN.
- Key vehicle attributes (e.g., make, model, year, engine) are rendered as structured data.
- Includes a **bar chart** visualizing engine displacement, gearbox speeds, and cylinders for each vehicle.
- Designed for side-by-side vehicle comparisons in a two-column layout.

### 3. Timeline Page

- Searches by Make and Model (not VIN).
- Displays two **line charts** generated using Chart.js:
  - **Model Year vs. Trim Count** chart: Visualizes the number of trim levels released per year for the selected model.
  - **Average MSRP Trends**: Shows price evolution across model years.
- Data is fetched from the API and then processed into chart-friendly datasets using React.

## Assumptions and Limitations

- The application is frontend-only and does not include backend authentication or data caching.
- API keys are stored in environment variables (.env file) for security.
- The Car API v2 free tier only supports VINs from the 2015–2020 range.
- Chart rendering is conditional on the availability of valid pricing data from the API.
- VINs outside of the supported range will return an error message handled via UI alert notifications.
- MSRP values are displayed in USD as returned by the API.

## Summary

This application demonstrates frontend data processing, component-based architecture, and real-time API integration with clean data visualisation. Its core value lies in delivering structured and visual insights into vehicle pricing trends with a focus on usability and clarity.
