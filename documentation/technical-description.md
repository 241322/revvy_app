# Technical Description

## Application Overview

This is a React-based single-page application (SPA) that enables users to fetch and visualise vehicle data using a public API based on a VIN (Vehicle Identification Number) input. The application is designed to provide clear data output for users looking to inspect or compare vehicle specifications and pricing trends.

## Technologies Used

- **Framework:** React (Vite build system)
- **Charting Library:** Chart.js via `react-chartjs-2`
- **Data Source:** Public Vehicle API (VIN-based queries)
- **Routing:** React Router DOM
- **State Management:** React Hooks (`useState`, `useEffect`)
- **Styling:** Tailwind CSS

## Page Structure and Data Flow

### 1. Landing Page

- Contains a user input field for VIN numbers.
- Provides brief introductory content about the application.
- No charts or data visualisation components are rendered here.
- After a valid VIN is entered, the user is redirected to the Comparison Page.

### 2. Comparison Page

- Fetches and displays vehicle information based on the provided VIN.
- Key vehicle attributes (e.g., make, model, year, engine) are rendered as structured data.
- No chart or graphical visualisation is used on this page.
- Designed for clear, text-based vehicle comparisons.
- A bar chart from chart.js will also be found there

### 3. Timeline Page

- The only page in the application containing visual data charts.
- Displays two **line charts** generated using Chart.js:
  - **Model Year vs. Price** chart: Visualises historical pricing data for the selected model.
  - **Comparative Pricing Trends**: If applicable, a secondary chart compares price evolution across multiple model years or related VINs.
- Data is fetched from the API and then processed into chart-friendly datasets using React.

## Assumptions and Limitations

- The application is frontend-only and does not include backend authentication or data caching.
- The public API may only support a limited VIN year range (e.g., 2015–2020).
- Chart rendering is conditional on the availability of valid pricing data from the API.
- VINs outside of the supported range will return an error message handled via UI notifications.

## Summary

This application demonstrates frontend data processing, component-based architecture, and real-time API integration with clean data visualisation. Its core value lies in delivering structured and visual insights into vehicle pricing trends with a focus on usability and clarity.
