import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Printer, X } from "lucide-react";
import { useRef } from "react";
import type { FeeEntry } from "../backend.d";

interface ReceiptDialogProps {
  entry: FeeEntry | null;
  onClose: () => void;
  logoUrl?: string;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export default function ReceiptDialog({
  entry,
  onClose,
  logoUrl,
}: ReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!entry) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={!!entry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm" data-ocid="receipt.dialog">
        <DialogHeader>
          <DialogTitle className="text-center">Fee Receipt</DialogTitle>
        </DialogHeader>

        {/* Printable Receipt */}
        <div
          ref={receiptRef}
          className="print-receipt space-y-4 text-sm"
          data-ocid="receipt.panel"
        >
          {/* School header */}
          <div className="text-center space-y-1">
            <div className="flex justify-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="School Logo"
                  className="w-14 h-14 object-cover rounded-full"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0"
                  style={{ borderColor: "#163A73" }}
                >
                  <img
                    src="/assets/generated/school-logo-transparent.dim_120x120.png"
                    alt="School Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <p className="font-bold text-base" style={{ color: "#163A73" }}>
              LITTLE STAR H. S. SCHOOL
            </p>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">
              Tengakhat
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-muted-foreground font-medium">
              Receipt No:
            </span>
            <span className="font-bold" style={{ color: "#163A73" }}>
              {entry.receiptNumber}
            </span>
            <span className="text-muted-foreground font-medium">Date:</span>
            <span className="font-semibold">{formatDate(entry.date)}</span>
          </div>

          <Separator />

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground font-medium">
                Student Name:
              </span>
              <span className="font-semibold">{entry.studentName}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground font-medium">Class:</span>
              <span className="font-semibold">{entry.className}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground font-medium">
                Fee Type:
              </span>
              <span className="font-semibold">{entry.feeType}</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground font-medium">
                Amount Paid:
              </span>
              <span className="font-bold text-green-700">
                ₹{Number(entry.amount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <span className="text-muted-foreground font-medium">
                Payment Mode:
              </span>
              <span className="font-semibold">{entry.paymentMode}</span>
            </div>
          </div>

          <Separator />

          <div className="text-center space-y-2">
            <p className="font-bold text-base" style={{ color: "#163A73" }}>
              Thank You!
            </p>
            <p className="text-xs text-muted-foreground italic">
              We appreciate your timely payment.
            </p>
          </div>

          <div className="text-right text-xs">
            <p className="text-muted-foreground">________________________</p>
            <p className="font-medium text-muted-foreground">
              Authorised Signatory
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            data-ocid="receipt.close_button"
            onClick={onClose}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button
            data-ocid="receipt.primary_button"
            onClick={handlePrint}
            className="flex-1"
            style={{
              background: "linear-gradient(135deg, #163A73 0%, #1B4585 100%)",
            }}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
