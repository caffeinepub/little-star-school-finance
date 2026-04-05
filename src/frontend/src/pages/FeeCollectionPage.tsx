import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Loader2, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { FeeEntry, backendInterface } from "../backend.d";
import ReceiptDialog from "../components/ReceiptDialog";
import { useActor } from "../hooks/useActor";

const CLASSES = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];
const FEE_TYPES = ["Tuition", "Admission", "Other"];
const PAYMENT_MODES = ["Cash", "Online", "UPI"];

interface FormState {
  studentName: string;
  className: string;
  feeType: string;
  amount: string;
  paymentMode: string;
}

const INITIAL_FORM: FormState = {
  studentName: "",
  className: "",
  feeType: "",
  amount: "",
  paymentMode: "",
};

export default function FeeCollectionPage() {
  const { actor, isFetching } = useActor();
  const today = new Date().toISOString().split("T")[0];
  const currentHour = new Date().getHours();
  const isOpen = currentHour < 15;

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [fees, setFees] = useState<FeeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [receiptEntry, setReceiptEntry] = useState<FeeEntry | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  const loadFees = async () => {
    if (!actor) return;
    try {
      const typedActor = actor as unknown as backendInterface;
      const [data, logo] = await Promise.all([
        typedActor.getFeesByDate(today),
        typedActor.getSchoolLogoUrl(),
      ]);
      setFees(data);
      if (logo) setLogoUrl(logo);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadFees is stable within this scope
  useEffect(() => {
    if (!actor || isFetching) return;
    loadFees();
  }, [actor, isFetching, today]);

  const validateForm = () => {
    if (!form.studentName.trim()) {
      toast.error("Student name is required.");
      return false;
    }
    if (!form.className) {
      toast.error("Class is required.");
      return false;
    }
    if (!form.feeType) {
      toast.error("Fee type is required.");
      return false;
    }
    if (!form.amount || Number.parseFloat(form.amount) < 1) {
      toast.error("Amount must be at least ₹1.");
      return false;
    }
    if (!form.paymentMode) {
      toast.error("Payment mode is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOpen) {
      toast.error("Day is closed. No new entries allowed.");
      return;
    }
    if (!validateForm()) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    if (!actor) return;
    setSaving(true);
    try {
      const typedActor = actor as unknown as backendInterface;
      const entry = await typedActor.addFeeEntry(
        form.studentName.trim(),
        form.className,
        form.feeType,
        BigInt(Math.round(Number.parseFloat(form.amount))),
        form.paymentMode,
        today,
        BigInt(currentHour),
      );
      toast.success("Entry saved successfully!");
      setReceiptEntry(entry);
      setForm(INITIAL_FORM);
      await loadFees();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save entry.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const paymentBadgeColor = (mode: string) => {
    if (mode === "Cash") return { bg: "#D1FAE5", color: "#065F46" };
    if (mode === "UPI") return { bg: "#EDE9FE", color: "#5B21B6" };
    return { bg: "#E0F2FE", color: "#0369A1" };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Day closed banner */}
      {!isOpen && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl border text-sm font-medium"
          style={{
            background: "#FEF2F2",
            borderColor: "#FECACA",
            color: "#991B1B",
          }}
          data-ocid="fees.error_state"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          Entries are closed for today. No new entries allowed after 3:00 PM.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Form */}
        <Card className="xl:col-span-2 shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-base font-bold">Add Fee Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="studentName"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Student Name *
                </Label>
                <Input
                  id="studentName"
                  data-ocid="fees.input"
                  placeholder="Enter student name"
                  value={form.studentName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, studentName: e.target.value }))
                  }
                  disabled={!isOpen || saving}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Class *
                </Label>
                <Select
                  value={form.className}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, className: v }))
                  }
                  disabled={!isOpen || saving}
                >
                  <SelectTrigger data-ocid="fees.select">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        Class {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fee Type *
                </Label>
                <Select
                  value={form.feeType}
                  onValueChange={(v) => setForm((p) => ({ ...p, feeType: v }))}
                  disabled={!isOpen || saving}
                >
                  <SelectTrigger data-ocid="fees.select">
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t} Fee
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="amount"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Amount (₹) *
                </Label>
                <Input
                  id="amount"
                  data-ocid="fees.input"
                  type="number"
                  placeholder="Enter amount"
                  min={1}
                  value={form.amount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  disabled={!isOpen || saving}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Payment Mode *
                </Label>
                <Select
                  value={form.paymentMode}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, paymentMode: v }))
                  }
                  disabled={!isOpen || saving}
                >
                  <SelectTrigger data-ocid="fees.select">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </Label>
                <Input
                  value={today}
                  readOnly
                  className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  data-ocid="fees.submit_button"
                  disabled={!isOpen || saving}
                  className="flex-1"
                  style={{
                    background:
                      "linear-gradient(135deg, #163A73 0%, #1B4585 100%)",
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Entry"
                  )}
                </Button>
                <Button
                  type="button"
                  data-ocid="fees.cancel_button"
                  variant="outline"
                  onClick={() => setForm(INITIAL_FORM)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Fee Records Table */}
        <Card className="xl:col-span-3 shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Today's Fee Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3" data-ocid="fees.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : fees.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground text-sm"
                data-ocid="fees.empty_state"
              >
                No fee entries recorded today.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="fees.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Receipt #</TableHead>
                      <TableHead className="text-xs">Student</TableHead>
                      <TableHead className="text-xs">Class</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Mode</TableHead>
                      <TableHead className="text-xs" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map((fee, idx) => {
                      const colors = paymentBadgeColor(fee.paymentMode);
                      return (
                        <TableRow
                          key={String(fee.id)}
                          data-ocid={`fees.item.${idx + 1}`}
                        >
                          <TableCell
                            className="text-xs font-mono font-semibold"
                            style={{ color: "#163A73" }}
                          >
                            {fee.receiptNumber}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {fee.studentName}
                          </TableCell>
                          <TableCell className="text-xs">
                            {fee.className}
                          </TableCell>
                          <TableCell className="text-xs">
                            {fee.feeType}
                          </TableCell>
                          <TableCell className="text-xs font-bold">
                            ₹{Number(fee.amount).toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{
                                background: colors.bg,
                                color: colors.color,
                              }}
                            >
                              {fee.paymentMode}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-ocid={`fees.edit_button.${idx + 1}`}
                              onClick={() => setReceiptEntry(fee)}
                              className="h-7 w-7"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm AlertDialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent data-ocid="fees.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Fee Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save this fee entry for{" "}
              <strong>{form.studentName}</strong>? Amount:{" "}
              <strong>
                ₹{Number.parseFloat(form.amount || "0").toLocaleString("en-IN")}
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="fees.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="fees.confirm_button"
              onClick={handleConfirm}
              style={{
                background: "linear-gradient(135deg, #163A73 0%, #1B4585 100%)",
              }}
            >
              Confirm & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipt Dialog */}
      <ReceiptDialog
        entry={receiptEntry}
        onClose={() => setReceiptEntry(null)}
        logoUrl={logoUrl}
      />
    </div>
  );
}
