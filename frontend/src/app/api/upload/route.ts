import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Define row structure
interface CsvRow {
    [key: string]: string | number;
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

        // Parse CSV
        const records = parse(fileText, {
            columns: true, // Use first row as header
            skip_empty_lines: true,
            trim: true,
        }) as CsvRow[];

        // Only Parse first few (takes too long otherwise)
        const limitedRecords = records.slice(0, 20000);

        // Database connection
        const dbPath = path.join(process.cwd(), 'src', 'db', 'database.sqlite');
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Prepare insert statement for DetailRow
        const stmt = await db.prepare(`
            INSERT INTO DetailRow (Details, Value, Status)
            VALUES (?, ?, ?)
        `);

        // Define the columns to ignore when creating Details
        const ignoredColumns = ['Unnamed: 0', 'TTEM'];

        let entryCount = 0; // Initialize counter

        for (const row of limitedRecords) {
            entryCount++; // Increment entry count

            const ttemValue = parseFloat(row['TTEM'] as string); // Read TTEM correctly

            if (isNaN(ttemValue)) {
                console.warn(`Invalid TTEM value at entry #${entryCount}:`, row['TTEM']);
                continue; // Skip invalid rows
            }

            // Log current entry
            if (entryCount % 500 == 0) {
                console.log(`Processing entry #${entryCount}...`);
            }

            // Determine status based on TTEM value
            const status = ttemValue < 20 ? 'Inactive' : ttemValue < 50 ? 'Pending' : 'Active';

            // Create Details by combining all columns except ignored ones
            const details = Object.keys(row)
                .filter((col) => !ignoredColumns.includes(col))
                .map((col) => `${col}: ${row[col]}`)
                .join(', ');

            const value = ttemValue.toString();

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
