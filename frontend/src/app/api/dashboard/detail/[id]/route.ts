import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const dbPath = path.join(process.cwd(), 'src', 'db', 'database.sqlite');
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        await db.run('DELETE FROM DetailRow WHERE id = ?', id);
        await db.close();

        return NextResponse.json({ message: 'Detail deleted successfully' });
    } catch (error) {
        console.error('Error deleting detail:', error);
        return NextResponse.json({ error: 'Error deleting detail' }, { status: 500 });
    }
} 