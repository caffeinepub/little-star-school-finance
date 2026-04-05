import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, Loader2, Shield, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { backendInterface } from "../backend.d";
import { useActor } from "../hooks/useActor";

export default function SettingsPage() {
  const { actor, isFetching } = useActor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loadingLogo, setLoadingLogo] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    const fetchLogo = async () => {
      try {
        const typedActor = actor as unknown as backendInterface;
        const url = await typedActor.getSchoolLogoUrl();
        setLogoUrl(url || null);
      } catch {
        // silent
      } finally {
        setLoadingLogo(false);
      }
    };
    fetchLogo();
  }, [actor, isFetching]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !actor) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB.");
      return;
    }

    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const typedActor = actor as unknown as backendInterface;
      await typedActor.setSchoolLogoUrl(dataUrl);
      setLogoUrl(dataUrl);
      toast.success("School logo updated successfully!");
    } catch (_err) {
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      {/* Logo Section */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-base font-bold">School Logo</CardTitle>
          <CardDescription className="text-sm">
            Upload your school logo. It will appear on all pages and receipts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div
              className="w-24 h-24 rounded-full overflow-hidden border-4 flex-shrink-0"
              style={{ borderColor: "#163A73" }}
            >
              {loadingLogo ? (
                <Skeleton className="w-full h-full rounded-full" />
              ) : logoUrl ? (
                <img
                  src={logoUrl}
                  alt="School Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="/assets/generated/school-logo-transparent.dim_120x120.png"
                  alt="Default Logo"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold">LITTLE STAR H. S. SCHOOL</p>
              <p className="text-xs text-muted-foreground">Tengakhat</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                data-ocid="settings.upload_button"
              />
              <Button
                variant="outline"
                size="sm"
                data-ocid="settings.primary_button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo || loadingLogo}
              >
                {uploadingLogo ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, or SVG. Max 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Closing Section */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="h-5 w-5" style={{ color: "#163A73" }} />
            Day Closing Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "#EFF6FF", borderLeft: "4px solid #163A73" }}
          >
            <CheckCircle2
              className="h-5 w-5 mt-0.5 flex-shrink-0"
              style={{ color: "#163A73" }}
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#163A73" }}>
                Auto Day Closing at 3:00 PM
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Entries automatically close at 3:00 PM daily. After this time,
                no new fee or expense entries can be added for the current day.
                This ensures data integrity and prevents unauthorized
                modifications.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Closing Time
              </p>
              <p className="font-bold">3:00 PM (15:00)</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Status
              </p>
              <p
                className="font-bold"
                style={{
                  color: new Date().getHours() < 15 ? "#059669" : "#DC2626",
                }}
              >
                {new Date().getHours() < 15 ? "Open" : "Closed"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials Section */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Shield className="h-5 w-5" style={{ color: "#163A73" }} />
            Login Credentials
          </CardTitle>
          <CardDescription>System administrator credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="p-4 rounded-xl"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Username
                </p>
                <p className="font-bold font-mono">admin</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Password
                </p>
                <p className="font-bold font-mono">admin123</p>
              </div>
            </div>
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground">
              These are the default administrator credentials. Keep them
              confidential.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
