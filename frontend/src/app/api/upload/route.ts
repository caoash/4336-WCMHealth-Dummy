import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Define row structure
interface CsvRow {
    [key: string]: string | number;
}

// Define the status options
const STATUS_OPTIONS = ['Inactive', 'Active', 'Pending', 'Standby'];

function hashStatus(ssw1Value: number): string {
    // Hash function using modulo and ssw1Value to distribute statuses better
    const statusIndex = Math.abs(Math.floor(Math.sin(ssw1Value) * 1000)) % STATUS_OPTIONS.length;
    return STATUS_OPTIONS[statusIndex];
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Read file
        const fileText = await file.text();

        // Parse CSV file
        const records = parse(fileText, {
            columns: true, // Use first row as header
            skip_empty_lines: true,
            trim: true,
        }) as CsvRow[];

        // Only Parse first few (takes too long otherwise), Used when making health report
        // Can set limit here
        const limitedRecords = records.slice(0, 1000);

        // Database connection
        const dbPath = path.join(process.cwd(), 'src', 'db', 'database.sqlite');
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Clear existing data from tables before inserting new data
        await db.run('DELETE FROM DetailRow');
        await db.run('DELETE FROM ChannelRow');

        // Prepare insert statement for DetailRow
        const stmt = await db.prepare(`
            INSERT INTO DetailRow (Details, Value, Status)
            VALUES (?, ?, ?)
        `);

        // Define the columns to ignore when creating Details
        const ignoredColumns = ['Unnamed: 0', 'SSW1'];

        let entryCount = 0; // Initialize counter

        for (const row of limitedRecords) {
            entryCount++; // Increment entry count

            // Get the SSW1 value from the 10th column (index starts from 0)
            const ssw1Value = parseFloat(row['SSW1'] as string); // Read SSW1 correctly

            if (isNaN(ssw1Value)) {
                console.warn(`Invalid SSW1 value at entry #${entryCount}:`, row['SSW1']);
                continue; // Skip invalid rows
            }

            // Log current entry
            if (entryCount % 500 == 0) {
                console.log(`Processing entry #${entryCount}...`);
            }

            // Assign status based on SSW1 value
            const status = hashStatus(ssw1Value);

            // Combinine all columns except ignored ones
            const details = Object.keys(row)
                .filter((col) => !ignoredColumns.includes(col))
                .map((col) => `${col}: ${row[col]}`)
                .join(', ');

            const value = ssw1Value.toString();

            // Insert data into the database
            await stmt.run([details, value, status]);
        }

        // Finalize statement and close database
        await stmt.finalize();
        await db.close();

        return NextResponse.json({ message: 'File uploaded and data inserted successfully' });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
    }
}
