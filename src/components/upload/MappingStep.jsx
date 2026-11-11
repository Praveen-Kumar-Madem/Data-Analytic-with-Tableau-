import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FIELD_DEFS } from "@/lib/constants";

const NONE = "__none__";

export default function MappingStep({ headers, rows, mapping, onChange }) {
  const preview = rows.slice(0, 6);
  const mappedCount = FIELD_DEFS.filter((f) => mapping[f.key]).length;

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Map your columns</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Match each required field to a column from your file. {mappedCount} of {FIELD_DEFS.length} fields mapped.
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {rows.length.toLocaleString("en-IN")} data rows detected
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FIELD_DEFS.map((field) => {
              const value = mapping[field.key] || NONE;
              const missing = field.required && !mapping[field.key];
              return (
                <div key={field.key} className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-[12px]">
                    {field.label}
                    {field.required ? <span className="text-red-500">*</span> : <span className="text-muted-foreground">(optional)</span>}
                    {missing ? <AlertCircle className="h-3 w-3 text-red-500" /> : value !== NONE ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : null}
                  </Label>
                  <Select value={value} onValueChange={(v) => onChange(field.key, v === NONE ? "" : v)}>
                    <SelectTrigger className="h-9 text-[13px]">
                      <SelectValue placeholder="Not mapped" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE} className="text-[13px] text-muted-foreground">
                        Not mapped
                      </SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h} className="text-[13px]">
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-semibold">Data preview</p>
            <p className="mt-1 text-[13px] text-muted-foreground">First {preview.length} rows exactly as they appear in your file.</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-[11px]">#</TableHead>
                  {headers.map((h) => (
                    <TableHead key={h} className="whitespace-nowrap text-[11px] font-semibold">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-[11px] text-muted-foreground">{idx + 1}</TableCell>
                    {headers.map((h, ci) => (
                      <TableCell key={h} className="max-w-[220px] truncate text-[12px]">
                        {row[ci] === "" || row[ci] === undefined ? <span className="text-muted-foreground">—</span> : String(row[ci])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}