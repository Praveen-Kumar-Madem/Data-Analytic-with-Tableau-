import React, { useRef, useState } from "react";
import { AlertCircle, Download, FileSpreadsheet, FileText, FlaskConical, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateSampleData, sampleDataToCsv } from "@/lib/sampleData";
import { downloadBlob } from "@/lib/csv";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 15 * 1024 * 1024;

export default function UploadStepSource({ onCsvLoaded, onSampleLoaded, onExcelFile, busy, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleFile = (file) => {
    setLocalError("");
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setLocalError("That file is larger than 15 MB. Split the export or upload a shorter period.");
      return;
    }
    const name = file.name.toLowerCase();
    if (name.endsWith(".csv") || name.endsWith(".txt") || file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = () => onCsvLoaded(String(reader.result), file.name);
      reader.onerror = () => setLocalError("The file could not be read.");
      reader.readAsText(file);
      return;
    }
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      onExcelFile(file);
      return;
    }
    setLocalError("Unsupported file type. Upload a .csv, .xlsx or .xls transaction export.");
  };

  const loadSample = () => {
    setLocalError("");
    onSampleLoaded(generateSampleData());
  };

  const downloadSample = () => {
    const sample = generateSampleData();
    downloadBlob("sample_ecommerce_transactions.csv", sampleDataToCsv(sample));
  };

  return (
    <div className="space-y-5">
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-5 w-5" />
          </span>
          <h3 className="text-base font-semibold tracking-tight">Upload transaction data</h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Drag and drop a CSV or Excel export, or choose a file. The file is stored privately in your workspace and is
            only used to build this analysis.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => inputRef.current?.click()} disabled={busy}>
              <FileText className="mr-2 h-4 w-4" />
              {busy ? "Reading file…" : "Choose CSV or Excel file"}
            </Button>
            <Button variant="outline" onClick={loadSample} disabled={busy}>
              <FlaskConical className="mr-2 h-4 w-4" />
              Load sample dataset
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls,text/csv"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <p className="mt-4 text-[11px] text-muted-foreground">Maximum file size 15 MB · CSV, XLSX and XLS supported</p>
        </CardContent>
      </Card>

      {localError || error ? (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{localError || error}</span>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Expected columns</p>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              InvoiceNo · StockCode · Description · Quantity · InvoiceDate · UnitPrice · CustomerID · Country. Different
              column names are fine — you map them in the next step.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">No dataset? Use the sample</p>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Synthetic e-commerce transactions with repeat purchases, inactive customers, high-value buyers, cancelled
              orders and returns. Clearly labelled as sample data throughout.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={downloadSample}>
              <Download className="mr-2 h-3.5 w-3.5" />
              Download sample CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}