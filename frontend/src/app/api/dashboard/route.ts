import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function GET() {
    const dbPath = path.join(process.cwd(), 'src', 'db', 'database.sqlite');
    
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const details = await db.all('SELECT * FROM DetailRow');
    const channels = await db.all('SELECT * FROM ChannelRow');
    
    await db.close();

    return NextResponse.json({ details, channels });
} 