export function DayStatusBadge() {
  const currentHour = new Date().getHours();
  const isOpen = currentHour < 15;

  if (isOpen) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
        style={{ background: "#D1FAE5", color: "#065F46" }}
      >
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Open
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: "#FEE2E2", color: "#991B1B" }}
    >
      <span className="w-2 h-2 rounded-full bg-red-500" />
      Closed for Today
    </span>
  );
}
