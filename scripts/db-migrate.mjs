import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

// Aplica as migrações SQL de supabase/migrations em ordem e registra as
// aplicadas em public.schema_migrations — idempotente, pode rodar quantas vezes
// quiser. Migrações já presentes no banco (baseline anterior ao ledger) são
// detectadas pelos erros de "objeto já existe" e apenas marcadas como aplicadas.
// Uso: npm run db:migrate   (lê SUPABASE_DB_URL de .env.local)

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error(
    "Defina SUPABASE_DB_URL no .env.local.\n" +
      "Supabase > Project Settings > Database > Connection string > URI.",
  );
  process.exit(1);
}

// Códigos do Postgres para "objeto já existe" (migração-base já aplicada).
const ALREADY_EXISTS = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object (type, trigger, policy, extension…)
  "42P06", // duplicate_schema
  "42723", // duplicate_function
  "23505", // unique_violation (insert em catálogo já presente)
]);

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

try {
  await client.query(`
    create table if not exists public.schema_migrations (
      name       text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const dir = "supabase/migrations";
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows } = await client.query(
    "select name from public.schema_migrations",
  );
  const applied = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`• ${file} — já aplicada, pulando`);
      continue;
    }
    process.stdout.write(`Aplicando ${file}... `);
    const sql = readFileSync(join(dir, file), "utf8");
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into public.schema_migrations(name) values ($1)",
        [file],
      );
      await client.query("commit");
      console.log("ok");
    } catch (err) {
      await client.query("rollback");
      if (ALREADY_EXISTS.has(err.code)) {
        await client.query(
          "insert into public.schema_migrations(name) values ($1) on conflict do nothing",
          [file],
        );
        console.log("já existia — marcada como aplicada");
      } else {
        console.error(`\nFalha em ${file}: ${err.message}`);
        process.exitCode = 1;
        break;
      }
    }
  }

  if (!process.exitCode) console.log("Migrações em dia.");
} catch (err) {
  console.error("\nFalha:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
