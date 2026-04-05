import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowUpRight,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type {
  DailySummary,
  ExpenseEntry,
  FeeEntry,
  backendInterface,
} from "../backend.d";
import { useActor } from "../hooks/useActor";

function formatCurrency(amount: bigint | number) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function formatTime(ts: bigint) {
  const d = new Date(Number(ts) / 1_000_000);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const { actor, isFetching } = useActor();
  const today = new Date().toISOString().split("T")[0];
  const currentHour = new Date().getHours();
  const isOpen = currentHour < 15;

  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [fees, setFees] = useState<FeeEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor || isFetching) return;
    const load = async () => {
      setLoading(true);
      try {
        const typedActor = actor as unknown as backendInterface;
        const [summaryData, feesData, expensesData] = await Promise.all([
          typedActor.getDailySummary(today),
          typedActor.getFeesByDate(today),
          typedActor.getExpensesByDate(today),
        ]);
        setSummary(summaryData);
        setFees(feesData);
        setExpenses(expensesData);
      } catch (_err) {
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [actor, isFetching, today]);

  const chartData = [
    {
      name: "Today",
      Collection: summary ? Number(summary.totalFees) : 0,
      Expenditure: summary ? Number(summary.totalExpenses) : 0,
    },
  ];

  // Combine and sort transactions
  const transactions: Array<{
    type: "fee" | "expense";
    id: string;
    label: string;
    amount: bigint;
    sub: string;
    createdAt: bigint;
  }> = [
    ...fees.map((f) => ({
      type: "fee" as const,
      id: f.receiptNumber,
      label: f.studentName,
      amount: f.amount,
      sub: `${f.className} • ${f.feeType}`,
      createdAt: f.createdAt,
    })),
    ...expenses.map((e) => ({
      type: "expense" as const,
      id: `EXP-${String(e.id)}`,
      label: e.title,
      amount: e.amount,
      sub: e.description || "—",
      createdAt: e.createdAt,
    })),
  ].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

  const netPositive = summary ? summary.netBalance >= BigInt(0) : true;

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
          data-ocid="dashboard.error_state"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          Entries are closed for today. No new entries allowed after 3:00 PM.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Collection */}
        <Card className="shadow-kpi border-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Total Collection
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(summary?.totalFees ?? BigInt(0))}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {loading ? "—" : `${Number(summary?.feeCount ?? 0)} entries`}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#E6F0FF" }}
              >
                <IndianRupee className="h-6 w-6" style={{ color: "#1D4ED8" }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenditure */}
        <Card className="shadow-kpi border-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Total Expenditure
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(summary?.totalExpenses ?? BigInt(0))}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {loading
                    ? "—"
                    : `${Number(summary?.expenseCount ?? 0)} entries`}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#FFE9D6" }}
              >
                <TrendingDown
                  className="h-6 w-6"
                  style={{ color: "#C2410C" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card className="shadow-kpi border-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Net Balance
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <p
                    className="text-2xl font-bold"
                    style={{ color: netPositive ? "#065F46" : "#991B1B" }}
                  >
                    {formatCurrency(summary?.netBalance ?? BigInt(0))}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {loading ? "—" : netPositive ? "Surplus" : "Deficit"}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: netPositive ? "#D1FAE5" : "#FEE2E2" }}
              >
                {netPositive ? (
                  <TrendingUp
                    className="h-6 w-6"
                    style={{ color: "#059669" }}
                  />
                ) : (
                  <Wallet className="h-6 w-6" style={{ color: "#DC2626" }} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              Today's Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div
                className="p-4 space-y-3"
                data-ocid="dashboard.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground text-sm"
                data-ocid="dashboard.empty_state"
              >
                No transactions today.
              </div>
            ) : (
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {transactions.map((tx, idx) => (
                  <div
                    key={`${tx.type}-${tx.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                    data-ocid={`dashboard.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: tx.type === "fee" ? "#E6F0FF" : "#FFE9D6",
                        }}
                      >
                        {tx.type === "fee" ? (
                          <IndianRupee
                            className="h-4 w-4"
                            style={{ color: "#1D4ED8" }}
                          />
                        ) : (
                          <Receipt
                            className="h-4 w-4"
                            style={{ color: "#C2410C" }}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {tx.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {tx.sub}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: tx.type === "fee" ? "#1D4ED8" : "#C2410C",
                        }}
                      >
                        {tx.type === "fee" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              Collection vs Expenditure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.88 0.012 240)"
                />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    "",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="Collection"
                  fill="#1D4ED8"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="Expenditure"
                  fill="#C2410C"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Need Receipt icon locally
function Receipt({
  className,
  style,
}: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      role="img"
      aria-label="Receipt"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M14 8H8" />
      <path d="M16 12H8" />
      <path d="M13 16H8" />
    </svg>
  );
}
