import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { Details, Value, Status } = body;

        const dbPath = path.join(process.cwd(), 'src', 'db', 'database.sqlite');
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        await db.run(
            'INSERT INTO DetailRow (Details, Value, Status) VALUES (?, ?, ?)',
            [Details, Value, Status]
        );

        await db.close();

        return NextResponse.json({ message: 'Detail added successfully' });
    } catch (error) {
        console.error('Error adding detail:', error);
        return NextResponse.json({ error: 'Error adding detail' }, { status: 500 });
    }
} 