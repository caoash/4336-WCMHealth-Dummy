import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Here you can add logic to process the CSV file
        // For example, parsing it and storing the data

        return NextResponse.json({ message: 'File uploaded successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
    }
} 