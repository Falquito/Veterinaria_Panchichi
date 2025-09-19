// api/db.js
const { Pool } = require('pg');

// Usa DATABASE_URL si está, si no, usa explícitos (con .render.com)
const url = process.env.DATABASE_URL || '';
let cfg;
try {
  const u = new URL(url);
  cfg = {
    host: u.hostname,           // debe terminar en .render.com
    port: Number(u.port || 5432),
    database: u.pathname.slice(1),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    ssl: { rejectUnauthorized: false },
  };
} catch (e) {
  // fallback: PEGÁ ACÁ TU HOST EXTERNO (el del PSQL Command después de -h)
  cfg = {
    host: 'dpg-d2micbjipnbc73etfjq0-a.virginia-postgres.render.com',
    port: 5432,
    database: 'panchita',
    user: 'panchita_user',
    password: 'TU_PASS',
    ssl: { rejectUnauthorized: false },
  };
}

// Guardia: si por error queda el host interno (sin .render.com), corta.
if (!cfg.host.includes('render.com')) {
  console.error('❌ Host inválido para entorno local:', cfg.host);
  process.exit(1);
}
console.log('🔌 PG host =>', cfg.host);

module.exports = new Pool(cfg);
