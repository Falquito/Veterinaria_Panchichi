const express = require('express');
const pool = require('./db');
const { z } = require('zod');

const router = express.Router();

const FECHA_EXPR = `
CASE
  WHEN m.fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}(:[0-9]{2})?Z?$'
    THEN (m.fecha::timestamptz)::timestamp
  WHEN m.fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    THEN to_timestamp(m.fecha, 'YYYY-MM-DD')
  WHEN m.fecha ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4} [0-9]{2}:[0-9]{2}(:[0-9]{2})?$'
    THEN to_timestamp(m.fecha, 'DD/MM/YYYY HH24:MI:SS')
  WHEN m.fecha ~ '^[0-9]{2}/[0-9]{2}/[0-9]{4}$'
    THEN to_timestamp(m.fecha, 'DD/MM/YYYY')
  ELSE NULL
END
`;

const listSchema = z.object({
  date_from: z.string().optional(),     // si no lo mandás, no filtra
  date_to:   z.string().optional(),     // si no lo mandás, no filtra
  producto_id: z.coerce.number().int().positive().optional(),
  deposito_id: z.coerce.number().int().positive().optional(),
  tipo: z.enum(['INS','OUT','ADJ']).optional(),   // sin default => no filtra si no lo mandás
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().positive().max(200).default(50),
  sort: z.enum(['fecha:asc','fecha:desc']).default('fecha:desc'),
});

// GET /api/movimientos  (solo lectura, sin filtros por defecto)
router.get('/', async (req, res) => {
  try {
    const {
      date_from, date_to, producto_id, deposito_id,
      tipo, page, page_size, sort
    } = listSchema.parse(req.query);

    const params = [];
    const where = [];

    if (tipo) {
      params.push(tipo);
      where.push(`m.tipo = $${params.length}`);
    }
    if (date_from) {
      params.push(date_from);
      where.push(`${FECHA_EXPR} >= $${params.length}::timestamp`);
    }
    if (date_to) {
      params.push(date_to);
      where.push(`${FECHA_EXPR} <= $${params.length}::timestamp`);
    }
    if (producto_id) {
      params.push(producto_id);
      where.push(`mp."productosId" = $${params.length}`);
    }
    if (deposito_id) {
      params.push(deposito_id);
      where.push(`mp.id_deposito = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderBy = sort === 'fecha:asc' ? `${FECHA_EXPR} ASC` : `${FECHA_EXPR} DESC`;
    const offset = (page - 1) * page_size;

    // COUNT
    const countSql = `
      SELECT COUNT(*) AS total
      FROM movimientos m
      JOIN movimientos_por_producto mp ON mp."movimientosId" = m.id
      ${whereSql}
    `;
    const { rows: countRows } = await pool.query(countSql, params);
    const total = Number(countRows[0]?.total || 0);

    // DATA (agrego limit/offset al final)
    const dataParams = [...params, page_size, offset];
    const dataSql = `
      SELECT
        m.id                  AS movimiento_id,
        m.tipo,
        m.fecha               AS fecha_texto,
        ${FECHA_EXPR}         AS fecha_normalizada,
        m.motivo,
        m.observaciones,
        mp.id                 AS linea_id,
        mp.cantidad,
        mp."productosId"      AS producto_id,
        mp.id_deposito        AS deposito_id
      FROM movimientos m
      JOIN movimientos_por_producto mp ON mp."movimientosId" = m.id
      ${whereSql}
      ORDER BY ${orderBy}
      LIMIT $${dataParams.length-1} OFFSET $${dataParams.length}
    `;
    const { rows } = await pool.query(dataSql, dataParams);

    res.json({ data: rows, page, page_size, total });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});


// GET /api/movimientos/:id  -> cabecera + líneas
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id inválido' });
    }

    const sql = `
      WITH m AS (
        SELECT
          m.id                       AS movimiento_id,
          m.tipo,
          m.fecha                    AS fecha_texto,
          ${FECHA_EXPR}              AS fecha_normalizada,
          m.motivo,
          m.observaciones
        FROM movimientos m
        WHERE m.id = $1
      )
      SELECT
        m.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'linea_id', mp.id,
              'cantidad', mp.cantidad,
              'producto_id', mp."productosId",
              'deposito_id', mp.id_deposito
            )
            ORDER BY mp.id
          ) FILTER (WHERE mp.id IS NOT NULL),
          '[]'::json
        ) AS lineas
      FROM m
      LEFT JOIN "movimientos_por_producto" mp
        ON mp."movimientosId" = m.movimiento_id
      GROUP BY m.movimiento_id, m.tipo, m.fecha_texto, m.fecha_normalizada, m.motivo, m.observaciones
    `;

    const { rows } = await pool.query(sql, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Movimiento no encontrado' });
    return res.json(rows[0]); // { movimiento_id, tipo, fecha_texto, fecha_normalizada, motivo, observaciones, lineas: [...] }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});


module.exports = router;


