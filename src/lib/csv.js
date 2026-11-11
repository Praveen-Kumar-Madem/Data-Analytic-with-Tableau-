/**
 * Dependency-free CSV handling: a RFC4180-style parser that understands quoted
 * fields, embedded commas/newlines, escaped quotes, CRLF line endings and BOMs.
 */

function detectDelimiter(text) {
  const firstLine = text.split("\n")[0] || "";
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = -1;
  for (const c of candidates) {
    const count = firstLine.split(c).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = c;
    }
  }
  return best;
}

/** Parse delimited text into an array of string arrays. */
export function parseDelimited(rawText) {
  let text = String(rawText || "");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const delimiter = detectDelimiter(text);

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === delimiter) {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ""));
}

/**
 * Parse a delimited file into headers plus positional rows.
 * Positional rows keep duplicate header names unambiguous during column mapping.
 */
export function parseTabularFile(text) {
  const matrix = parseDelimited(text);
  if (!matrix.length) return { headers: [], rows: [], delimiter: "," };
  const headers = matrix[0].map((h, idx) => {
    const clean = String(h).trim();
    return clean || `Column ${idx + 1}`;
  });
  const rows = matrix.slice(1).map((r) => {
    const out = new Array(headers.length).fill("");
    for (let i = 0; i < headers.length; i += 1) out[i] = r[i] === undefined ? "" : r[i];
    return out;
  });
  return { headers, rows };
}

function escapeCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Build a CSV string from column definitions and row objects. */
export function toCsv(columns, rows) {
  const header = columns.map((c) => escapeCell(c.label || c.key)).join(",");
  const body = rows.map((row) =>
    columns
      .map((c) => {
        const raw = typeof c.value === "function" ? c.value(row) : row[c.key];
        return escapeCell(raw);
      })
      .join(",")
  );
  return [header, ...body].join("\r\n");
}

export function downloadBlob(filename, content, mime = "text/csv;charset=utf-8;") {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadCsv(filename, columns, rows) {
  downloadBlob(filename, toCsv(columns, rows));
}

/** Page through every record of an entity query so exports are complete. */
export async function fetchAllPages(queryFn, { pageSize = 500, maxRows = 60000 } = {}) {
  const all = [];
  let cursor = null;
  for (let guard = 0; guard < 400; guard += 1) {
    const page = await queryFn({ limit: pageSize, cursor });
    const items = Array.isArray(page) ? page : page?.items || [];
    all.push(...items);
    const next = Array.isArray(page) ? null : page?.next_cursor;
    if (!next || all.length >= maxRows) break;
    cursor = next;
  }
  return all;
}