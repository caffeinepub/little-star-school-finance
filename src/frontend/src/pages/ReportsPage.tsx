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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileDown,
  IndianRupee,
  Printer,
  Search,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  ExpenseEntry,
  FeeEntry,
  RangeSummary,
  backendInterface,
} from "../backend.d";
import { useActor } from "../hooks/useActor";

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  return {
    from: start.toISOString().split("T")[0],
    to: now.toISOString().split("T")[0],
  };
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    from: start.toISOString().split("T")[0],
    to: now.toISOString().split("T")[0],
  };
}

export default function ReportsPage() {
  const { actor, isFetching } = useActor();
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [summary, setSummary] = useState<RangeSummary | null>(null);
  const [fees, setFees] = useState<FeeEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async (from: string, to: string) => {
    if (!actor) return;
    setLoading(true);
    try {
      const typedActor = actor as unknown as backendInterface;
      const [summaryData, feesData, expensesData] = await Promise.all([
        typedActor.getRangeSummary(from, to),
        typedActor.getFeesByDateRange(from, to),
        typedActor.getExpensesByDateRange(from, to),
      ]);
      setSummary(summaryData);
      setFees(feesData);
      setExpenses(expensesData);
    } catch (_err) {
      toast.error("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchReports uses actor from outer scope
  useEffect(() => {
    if (!actor || isFetching) return;
    fetchReports(today, today);
  }, [actor, isFetching]);

  const handleSearch = () => {
    if (fromDate > toDate) {
      toast.error("From date cannot be after To date.");
      return;
    }
    fetchReports(fromDate, toDate);
  };

  const exportCSV = () => {
    const feeRows = fees.map(
      (f) =>
        `${f.receiptNumber},${f.studentName},${f.className},${f.feeType},${Number(f.amount)},${f.paymentMode},${f.date}`,
    );
    const expRows = expenses.map(
      (e) => `,${e.title},,,${Number(e.amount)},,${e.date}`,
    );

    const csvContent = [
      "Receipt/ID,Student/Title,Class,Fee Type,Amount,Payment Mode,Date",
      "--- FEE RECORDS ---",
      ...feeRows,
      "",
      "--- EXPENSE RECORDS ---",
      ...expRows,
      "",
      `Total Collection,${Number(summary?.totalFees ?? 0)}`,
      `Total Expenses,${Number(summary?.totalExpenses ?? 0)}`,
      `Net Balance,${Number(summary?.netBalance ?? 0)}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully!");
  };

  const netPositive = summary ? summary.netBalance >= BigInt(0) : true;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date Range Filter */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Select Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                From
              </Label>
              <Input
                type="date"
                data-ocid="reports.input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                To
              </Label>
              <Input
                type="date"
                data-ocid="reports.input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button
              data-ocid="reports.primary_button"
              onClick={handleSearch}
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #163A73 0%, #1B4585 100%)",
              }}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            <div className="flex gap-2 ml-auto flex-wrap">
              <Button
                variant="outline"
                size="sm"
                data-ocid="reports.tab"
                onClick={() => {
                  setFromDate(today);
                  setToDate(today);
                  fetchReports(today, today);
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                data-ocid="reports.tab"
                onClick={() => {
                  const { from, to } = getWeekRange();
                  setFromDate(from);
                  setToDate(to);
                  fetchReports(from, to);
                }}
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                data-ocid="reports.tab"
                onClick={() => {
                  const { from, to } = getMonthRange();
                  setFromDate(from);
                  setToDate(to);
                  fetchReports(from, to);
                }}
              >
                This Month
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-kpi border-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Total Collection
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <p className="text-xl font-bold">
                    ₹{Number(summary?.totalFees ?? 0).toLocaleString("en-IN")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {Number(summary?.feeCount ?? 0)} entries
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#E6F0FF" }}
              >
                <IndianRupee className="h-5 w-5" style={{ color: "#1D4ED8" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-kpi border-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Total Expenses
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <p className="text-xl font-bold">
                    ₹
                    {Number(summary?.totalExpenses ?? 0).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {Number(summary?.expenseCount ?? 0)} entries
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#FFE9D6" }}
              >
                <TrendingDown
                  className="h-5 w-5"
                  style={{ color: "#C2410C" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-kpi border-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Net Balance
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <p
                    className="text-xl font-bold"
                    style={{ color: netPositive ? "#065F46" : "#991B1B" }}
                  >
                    ₹{Number(summary?.netBalance ?? 0).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: netPositive ? "#D1FAE5" : "#FEE2E2" }}
              >
                <Wallet
                  className="h-5 w-5"
                  style={{ color: netPositive ? "#059669" : "#DC2626" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Tabs */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-bold">
              Transaction Records
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                data-ocid="reports.secondary_button"
                onClick={exportCSV}
                disabled={loading || (!fees.length && !expenses.length)}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                data-ocid="reports.secondary_button"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 p-0">
          <Tabs defaultValue="fees" data-ocid="reports.tab">
            <div className="px-6">
              <TabsList>
                <TabsTrigger value="fees" data-ocid="reports.tab">
                  Fee Records ({fees.length})
                </TabsTrigger>
                <TabsTrigger value="expenses" data-ocid="reports.tab">
                  Expense Records ({expenses.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="fees" className="mt-0">
              {loading ? (
                <div
                  className="p-4 space-y-3"
                  data-ocid="reports.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : fees.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground text-sm"
                  data-ocid="reports.empty_state"
                >
                  No fee records found for the selected date range.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="reports.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Receipt #</TableHead>
                        <TableHead className="text-xs">Student Name</TableHead>
                        <TableHead className="text-xs">Class</TableHead>
                        <TableHead className="text-xs">Fee Type</TableHead>
                        <TableHead className="text-xs">Amount</TableHead>
                        <TableHead className="text-xs">Payment Mode</TableHead>
                        <TableHead className="text-xs">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fees.map((fee, idx) => (
                        <TableRow
                          key={String(fee.id)}
                          data-ocid={`reports.item.${idx + 1}`}
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
                          <TableCell className="text-xs">
                            {fee.paymentMode}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(fee.date)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              {loading ? (
                <div
                  className="p-4 space-y-3"
                  data-ocid="reports.loading_state"
                >
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : expenses.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground text-sm"
                  data-ocid="reports.empty_state"
                >
                  No expense records found for the selected date range.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="reports.table">
                    <TableHeader>
                      <TableRow>
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
                          data-ocid={`reports.item.${idx + 1}`}
                        >
                          <TableCell className="text-xs font-semibold">
                            {exp.title}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
