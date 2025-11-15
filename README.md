## Author: [Xander Poalses](https://github.com/241322)

# Formative Assessment 1: React Application for Data Visualisation with ChartJS

For car enthusiasts, researchers, and potential buyers who wish to examine and contrast vehicles using actual data, this project is a comprehensive vehicle data explorer. The application provides:

- **Flexible Vehicle Lookup** - Search by VIN number or Make/Model with intelligent autocomplete suggestions

- **Smart Search Experience** - Real-time dropdown suggestions as you type, showing available trims and years

- **Side-by-Side Comparison** - Examine two vehicles with detailed specifications and visual charts

- **Historical Insights** - View model year timelines and MSRP trends with interactive visualizations

- **Modern UI/UX** - Glassmorphic design with backdrop blur effects, smooth page transitions, and responsive layout

It is intended for users who wish to research vehicle specifications, compare models, or make well-informed purchasing decisions.

## Appendix

#### API Source
- This app uses the [Car API v2](https://rapidapi.com/apininjas/api/car-api2) from RapidAPI to fetch vehicle data such as VIN details, trims, and specifications.
- Note: Non-paying users are limited to VINs from **2015–2020**.

#### Project Structure

```
/pages
  LandingPage.jsx         // Vehicle search with autocomplete (VIN or Make/Model)
  ComparisonPage.jsx      // Compare two vehicles side-by-side
  TimelinePage.jsx        // Model year timeline and MSRP trends

/components
  CustomAlert.jsx         // Integrated alert notifications

/hooks
  useCustomAlert.js       // Custom hook for alert management

/styles
  App.module.css
  LandingPage.module.css
  ComparisonPage.module.css
  TimelinePage.module.css
  CustomAlert.module.css
```

#### Example Vehicle Searches

**By VIN:**
- `1GTG6CEN0L1139305` (GMC Canyon 2020)
- `5UXKR0C5XF0K56785` (BMW X5 2015)
- `WVGZZZ7PZHD006123` (Volkswagen Touareg 2017)

**By Make/Model** (try typing to see autocomplete):
- `GMC Canyon`
- `BMW X5`
- `Volkswagen Touareg`
- `Ford F-150`

#### Recent Enhancements

- ✅ Autocomplete dropdown suggestions on all search pages
- ✅ Glassmorphic UI with backdrop blur effects
- ✅ Directional page transitions (slide up/down based on navigation)
- ✅ Custom styled alert notifications
- ✅ SVG icon-based navigation sidebar
- ✅ Responsive search bars with exact-width dropdowns

#### Future Ideas

- Add user authentication and save vehicle history
- Export comparison results as PDF
- Add live exchange rate for MSRP conversion
- Keyboard navigation for autocomplete dropdowns
- Dark/Light theme toggle


## API Reference

#### Get vehicle data by VIN

```http
  GET /api/vin/{vin}
```

#### Get vehicle data by Make and Model

```http
  GET /api/trims?make={make}&model={model}&verbose=yes
```

| Parameter  | Type     | Description                          |
|------------|----------|--------------------------------------|
| `api_key`  | `string` | **Required**. Your RapidAPI key (stored in `.env`) |
| `vin`      | `string` | Vehicle Identification Number (e.g., "1GTG6CEN0L1139305") |
| `make`     | `string` | Vehicle manufacturer (e.g., "GMC") |
| `model`    | `string` | Vehicle model (e.g., "Canyon") |
| `year`     | `number` | Model year (e.g., 2020) |
| `verbose`  | `string` | Set to "yes" for detailed trim information |

**Note:** API keys are never committed to the repository. They are stored securely in the `.env` file.

## Features

- **Multi-Method Vehicle Lookup** - Search by VIN or Make/Model with real-time autocomplete

- **Intelligent Autocomplete** - Dropdown suggestions filtered to 2015-2020 range with instant preview

- **Real-Time Vehicle Comparison** - Side-by-side specs with interactive bar charts

- **Timeline Visualization** - Historical trim count and MSRP trends with Chart.js line graphs

- **Modern Glassmorphic UI** - Backdrop blur effects, smooth animations, and responsive design

- **Custom Alert System** - Integrated modal notifications with auto-dismiss and custom styling

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