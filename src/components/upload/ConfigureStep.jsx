import React from "react";
import { AlertCircle, IndianRupee, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLEANING_RULE_HELP } from "@/lib/constants";

const CURRENCIES = [
  { code: "INR", label: "INR — Indian Rupee (₹)" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — Pound Sterling" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "CAD", label: "CAD — Canadian Dollar" }
];

export default function ConfigureStep({ config, onChange }) {
  const foreign = config.sourceCurrency !== "INR";

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Currency</p>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            All reporting is in Indian Rupees (₹ INR). Confirm the currency your file actually contains — prices are never
            assumed to be rupees.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Source currency of the file</Label>
              <Select value={config.sourceCurrency} onValueChange={(v) => onChange("sourceCurrency", v)}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="text-[13px]">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Reporting currency</Label>
              <Input value="INR — Indian Rupee (₹)" readOnly className="h-9 bg-muted text-[13px]" />
            </div>
            {foreign ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">
                    Conversion rate to INR <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={config.conversionRate}
                    onChange={(e) => onChange("conversionRate", e.target.value)}
                    placeholder="e.g. 83.50"
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Conversion date</Label>
                  <Input
                    type="date"
                    value={config.conversionDate}
                    onChange={(e) => onChange("conversionDate", e.target.value)}
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-[12px]">Conversion source / note</Label>
                  <Input
                    value={config.conversionNote}
                    onChange={(e) => onChange("conversionNote", e.target.value)}
                    placeholder="Where the rate came from, e.g. RBI reference rate"
                    className="h-9 text-[13px]"
                  />
                </div>
              </>
            ) : null}
          </div>

          {foreign ? (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3.5 py-3 text-[12px] leading-relaxed text-amber-900">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                This file is not denominated in INR. Enter the exact rate you are using — the platform never invents an
                exchange rate. The rate and date are recorded on the dataset for auditability.
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold">Transaction cleaning rules</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Nothing is deleted. Every questionable row is classified, given a reason and kept for inspection.
          </p>

          <div className="mt-4 space-y-5">
            <div>
              <Label className="text-[12px]">{CLEANING_RULE_HELP.returnsHandling.label}</Label>
              <RadioGroup
                value={config.returnsHandling}
                onValueChange={(v) => onChange("returnsHandling", v)}
                className="mt-2 grid gap-2 sm:grid-cols-2"
              >
                {CLEANING_RULE_HELP.returnsHandling.options.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-start gap-2.5 rounded-md border border-border p-3 text-[12px] leading-relaxed hover:bg-muted/50"
                  >
                    <RadioGroupItem value={opt.value} className="mt-0.5" />
                    <span>
                      <span className="block font-medium">{opt.label}</span>
                      <span className="mt-0.5 block text-muted-foreground">{opt.help}</span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-[12px]">{CLEANING_RULE_HELP.duplicateHandling.label}</Label>
              <RadioGroup
                value={config.duplicateHandling}
                onValueChange={(v) => onChange("duplicateHandling", v)}
                className="mt-2 grid gap-2 sm:grid-cols-2"
              >
                {CLEANING_RULE_HELP.duplicateHandling.options.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-start gap-2.5 rounded-md border border-border p-3 text-[12px] leading-relaxed hover:bg-muted/50"
                  >
                    <RadioGroupItem value={opt.value} className="mt-0.5" />
                    <span>
                      <span className="block font-medium">{opt.label}</span>
                      <span className="mt-0.5 block text-muted-foreground">{opt.help}</span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Cancelled invoice prefix</Label>
                <Input
                  value={config.cancelledInvoicePrefix}
                  onChange={(e) => onChange("cancelledInvoicePrefix", e.target.value)}
                  placeholder="C"
                  className="h-9 text-[13px]"
                />
                <p className="text-[11px] text-muted-foreground">
                  Invoices starting with this prefix are treated as cancelled and excluded from sales and RFM.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Rows with a blank Customer ID</Label>
                <Input value="Classified and excluded from RFM" readOnly className="h-9 bg-muted text-[13px]" />
                <p className="text-[11px] text-muted-foreground">
                  They cannot be attributed to a customer, so they are reported in the quality summary instead.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold">RFM reference date</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Recency is measured backwards from this date. A single reference date is used for every customer.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Reference date source</Label>
              <Select value={config.referenceMode} onValueChange={(v) => onChange("referenceMode", v)}>
                <SelectTrigger className="h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto" className="text-[13px]">
                    Automatic — day after the latest transaction
                  </SelectItem>
                  <SelectItem value="manual" className="text-[13px]">
                    Manual — choose a date
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.referenceMode === "manual" ? (
              <div className="space-y-1.5">
                <Label className="text-[12px]">Reference date</Label>
                <Input
                  type="date"
                  value={config.referenceDate}
                  onChange={(e) => onChange("referenceDate", e.target.value)}
                  className="h-9 text-[13px]"
                />
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-md bg-muted/60 px-3.5 py-3 text-[12px] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Defaults: 180 days of inactivity marks a customer Lost, and Big Spenders are customers with a monetary score
              of 4 or above. Both thresholds can be changed in Settings and the segmentation page, then the pipeline can be
              re-run without re-uploading.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}