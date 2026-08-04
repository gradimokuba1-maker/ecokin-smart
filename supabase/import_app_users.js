const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const allowedRoles = new Set(['citoyen', 'agent', 'bourgmestre', 'gouverneur', 'admin', 'superadmin']);

async function main() {
    const csvPath = process.argv[2] || path.join(__dirname, 'app_users.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('CSV file not found:', csvPath);
        process.exit(1);
    }

    const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('Set SUPABASE_DB_URL or DATABASE_URL to your Postgres connection string (service_role recommended)');
        process.exit(1);
    }

    const raw = fs.readFileSync(csvPath, 'utf8');
    const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) {
        console.error('CSV must contain a header and at least one data row');
        process.exit(1);
    }

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const idIdx = header.indexOf('id');
    const roleIdx = header.indexOf('role');
    const communeIdx = header.indexOf('commune');
    if (idIdx === -1 || roleIdx === -1) {
        console.error('CSV header must include at least `id` and `role` columns');
        process.exit(1);
    }

    const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to DB');
        let applied = 0;
        for (const cols of rows) {
            const id = cols[idIdx];
            const role = cols[roleIdx];
            const commune = communeIdx !== -1 ? cols[communeIdx] || null : null;
            if (!id || !role) {
                console.warn('Skipping row without id or role:', cols);
                continue;
            }
            if (!allowedRoles.has(role)) {
                console.warn('Skipping row with invalid role:', role, 'allowed:', Array.from(allowedRoles).join(','));
                continue;
            }
            await client.query(
                `INSERT INTO public.app_users (id, role, commune) VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, commune = EXCLUDED.commune`,
                [id, role, commune]
            );
            applied++;
        }
        console.log(`Imported/updated ${applied} app_users from ${csvPath}`);
        process.exit(0);
    } catch (err) {
        console.error('Error importing:', err.message || err);
        process.exit(2);
    } finally {
        try { await client.end(); } catch (e) { }
    }
}

main();
