import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync'
console.log("Upload route is being executed");

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Here you can add logic to process the CSV file
        // For example, parsing it and storing the data

        // Read the file contents as text
        const fileText = await file.text();

        // Parse the CSV text into a JSON format
        const records = parse(fileText, {
            columns: true,  // Treat first row as column headers
            skip_empty_lines: true
        });

        //Logs CSV Data
        console.log("Parsed CSV Data:", records);

        return NextResponse.json({ message: 'File uploaded successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
    }
} 