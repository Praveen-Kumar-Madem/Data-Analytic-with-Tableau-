import { base44 } from "@/api/base44Client";
import { FIELD_DEFS } from "@/lib/constants";

const CHUNK_SIZE = 900;

/** Return the labels of required fields that have no source column mapped. */
export function validateMapping(mapping) {
  return FIELD_DEFS.filter((f) => f.required && !mapping[f.key]).map((f) => f.label);
}

/** Index mapped source rows into canonical field objects. */
export function buildMappedRows(rows, headers, mapping) {
  const indexByField = {};
  for (const field of FIELD_DEFS) {
    const header = mapping[field.key];
    indexByField[field.key] = header ? headers.indexOf(header) : -1;
  }
  return rows.map((row) => {
    const out = {};
    for (const field of FIELD_DEFS) {
      const idx = indexByField[field.key];
      out[field.key] = idx >= 0 && row[idx] !== undefined ? row[idx] : "";
    }
    return out;
  });
}

/** Push every mapped row into the dataset in bounded batches. */
export async function ingestRows({ datasetId, mappedRows, onProgress }) {
  let inserted = 0;
  for (let i = 0; i < mappedRows.length; i += CHUNK_SIZE) {
    const slice = mappedRows.slice(i, i + CHUNK_SIZE);
    const response = await base44.functions.invoke("ingestRows", {
      dataset_id: datasetId,
      rows: slice,
      start_index: i,
      total_rows: mappedRows.length
    });
    const data = response?.data || {};
    if (data.error) throw new Error(data.error);
    inserted += Number(data.inserted) || slice.length;
    if (onProgress) onProgress(Math.min(94, Math.round((inserted / mappedRows.length) * 94)));
  }
  return inserted;
}

export async function runPipeline({ datasetId, referenceDate }) {
  const response = await base44.functions.invoke("runPipeline", {
    dataset_id: datasetId,
    reference_date: referenceDate || undefined
  });
  const data = response?.data || {};
  if (data.error) throw new Error(data.error);
  return data;
}