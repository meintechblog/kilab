import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { getAppConfig } from "./env";

const globalForDb = globalThis as typeof globalThis & {
  kilabPool?: Pool;
};

function createPool() {
  const { databaseUrl } = getAppConfig();
  return new Pool({ connectionString: databaseUrl });
}

export const db = globalForDb.kilabPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.kilabPool = db;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  return db.query<T>(text, values);
}

export async function withClient<T>(run: (client: PoolClient) => Promise<T>) {
  const client = await db.connect();
  try {
    return await run(client);
  } finally {
    client.release();
  }
}
