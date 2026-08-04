const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const sqlPath = path.join(__dirname, 'signalements.sql');
if (!fs.existsSync(sqlPath)) {
    console.error('signalements.sql not found in supabase/');
    process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');
const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!connectionString) {
    console.error('Set SUPABASE_DB_URL or DATABASE_URL environment variable to your Postgres connection string');
    process.exit(1);
}

(async () => {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to DB, applying migration...');
        await client.query(sql);
        console.log('Migration applied successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message || err);
        process.exit(2);
    } finally {
        try { await client.end(); } catch (e) { }
    }
})();
