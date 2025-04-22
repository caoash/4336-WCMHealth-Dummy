# Installation Guide

## Pre-requisites

### System Requirements:

- **Node.js**: Version 18.18 or later
  - Download from: [https://nodejs.org/](https://nodejs.org/)
- **Operating System**: macOS, Windows, or Linux
- **SQLite**: The application uses SQLite for data storage (included in dependencies)

## Dependencies

Install the following dependencies using npm (explained below):

- Next.js (React framework)
- Chart.js and react-chartjs-2 (for data visualization)
- PapaParse (for CSV parsing)
- SQLite and sqlite3 (for database operations)
- Drizzle ORM (for database interactions)
- TailwindCSS (for styling)

## Download Instructions

1. Clone the repository from GitHub:
   ```
   git clone https://github.com/caoash/4336-WCMHealth-Dummy
   cd 4336-WCMHealth-Dummy
   ```
## Installation Instructions

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

3. Install the required dependencies:
   ```
   npm install
   ```

4. Initialize the database (if not already created):
   ```
   mkdir -p src/db
   touch src/db/database.sqlite
   ```

5. Seed the database with initial schema:
   ```
   sqlite3 src/db/database.sqlite < src/db/database.sql
   ```

## Run Instructions

For development:

1. Start the development server:
   ```
   npm run dev
   ```

2. Access the application:
   - Open a web browser and navigate to http://localhost:3000
   - The dashboard will be available at http://localhost:3000/health-report
   - Configuration settings are at http://localhost:3000/configuration

3. Using the Application:
   - Upload tool data via the upload functionality
   - Configure threshold algorithms in the configuration section
   - View the dashboard with real-time updates as you add tools

## Troubleshooting

### Common Installation Issues

1. **Node.js Version Issues**:
   - Error: "The engine "node" is incompatible with this module."
   - Solution: Update Node.js to version 18.18 or later using nvm or by downloading from the official website.

2. **Database Access Issues**:
   - Error: `"SQLITE_CANTOPEN: unable to open database file"`
   - Solution: Ensure the database file exists and has proper permissions. Read above for initialization steps.

3. **CSV Import Problems**:
   - Error: "Error parsing CSV file"
   - Solution: Ensure that your CSV file follows the convention of the dummy data provided. You can locate the dummy data in `dummy_data.csv`.

4. **Slow Performance with Large Datasets**:
   - On larger configurations, the dashboard may load slowly. 
   - Solution: This is a known limitation. Consider using smaller datasets or wait for the pagination to load.

For additional help, contact the development team.
