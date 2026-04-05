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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ExpenseEntry, backendInterface } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface FormState {
  title: string;
  description: string;
  amount: string;
}

const INITIAL_FORM: FormState = { title: "", description: "", amount: "" };

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function ExpensesPage() {
  const { actor, isFetching } = useActor();
  const today = new Date().toISOString().split("T")[0];
  const currentHour = new Date().getHours();
  const isOpen = currentHour < 15;

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadExpenses = async () => {
    if (!actor) return;
    try {
      const typedActor = actor as unknown as backendInterface;
      const data = await typedActor.getExpensesByDate(today);
      setExpenses(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadExpenses is stable within this scope
  useEffect(() => {
    if (!actor || isFetching) return;
    loadExpenses();
  }, [actor, isFetching]);

  const validateForm = () => {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return false;
    }
    if (!form.amount || Number.parseFloat(form.amount) < 1) {
      toast.error("Amount must be at least ₹1.");
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
      await typedActor.addExpenseEntry(
        form.title.trim(),
        form.description.trim(),
        BigInt(Math.round(Number.parseFloat(form.amount))),
        today,
        BigInt(currentHour),
      );
      toast.success("Expense saved successfully!");
      setForm(INITIAL_FORM);
      await loadExpenses();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save expense.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
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
          data-ocid="expenses.error_state"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          Entries are closed for today. No new entries allowed after 3:00 PM.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Form */}
        <Card className="xl:col-span-2 shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-base font-bold">Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="title"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Title *
                </Label>
                <Input
                  id="title"
                  data-ocid="expenses.input"
                  placeholder="e.g. Electricity, Salary, Maintenance"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  disabled={!isOpen || saving}
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="description"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  data-ocid="expenses.textarea"
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  disabled={!isOpen || saving}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="expAmount"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Amount (₹) *
                </Label>
                <Input
                  id="expAmount"
                  data-ocid="expenses.input"
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
                  data-ocid="expenses.submit_button"
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
                    "Save Expense"
                  )}
                </Button>
                <Button
                  type="button"
                  data-ocid="expenses.cancel_button"
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

        {/* Expense Records Table */}
        <Card className="xl:col-span-3 shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Today's Expense Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3" data-ocid="expenses.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : expenses.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground text-sm"
                data-ocid="expenses.empty_state"
              >
                No expense entries recorded today.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="expenses.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((exp, idx) => (
                      <TableRow
                        key={String(exp.id)}
                        data-ocid={`expenses.item.${idx + 1}`}
                      >
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {String(exp.id).slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          {exp.title}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                          {exp.description || "—"}
                        </TableCell>
                        <TableCell
                          className="text-xs font-bold"
                          style={{ color: "#C2410C" }}
                        >
                          ₹{Number(exp.amount).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(exp.date)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm AlertDialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent data-ocid="expenses.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Expense Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save this expense:{" "}
              <strong>{form.title}</strong>? Amount:{" "}
              <strong>
                ₹{Number.parseFloat(form.amount || "0").toLocaleString("en-IN")}
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="expenses.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="expenses.confirm_button"
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
    </div>
  );
}
