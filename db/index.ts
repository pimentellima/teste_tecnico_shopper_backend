import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgres://postgres:postgres@postgres:5432/my-local-db",
});

export default pool;
