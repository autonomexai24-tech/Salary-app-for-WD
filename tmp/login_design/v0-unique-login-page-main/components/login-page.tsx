"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, EyeOff, ArrowRight, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ───────────────────────── TYPES ───────────────────────── */
type Role = "employer" | "admin" | null;
type Stage = "role" | "credentials" | "success";

interface Credentials {
  userId: string;
  password: string;
}

interface DotProps {
  cx: number;
  cy: number;
  delay: number;
}

/* ───────────────────── MOCK CREDENTIALS ────────────────── */
const VALID_CREDS: Record<NonNullable<Role>, Credentials> = {
  employer: { userId: "EMP-2024", password: "pass123" },
  admin: { userId: "ADM-ROOT", password: "admin@99" },
};

/* ─────────────────── ANIMATED DOT GRID ─────────────────── */
const DOTS: DotProps[] = Array.from({ length: 80 }, (_, i) => ({
  cx: (i % 10) * 10 + 5,
  cy: Math.floor(i / 10) * 12.5 + 6.25,
  delay: (i * 137.508) % 5000,
}));

function DotGrid() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full opacity-100"
      aria-hidden="true"
    >
      {DOTS.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r="0.55"
          fill="oklch(0.28 0 0)"
          style={{ animation: `dot-breathe ${2.8 + (d.delay % 2000) / 1000}s ease-in-out ${d.delay}ms infinite` }}
        />
      ))}
    </svg>
  );
}

/* ──────────────────── GRID LINES (SVG) ──────────────────── */
function GridLines() {
  const horizontalLines = Array.from({ length: 9 }, (_, i) => (i + 1) * 10);
  const verticalLines = Array.from({ length: 11 }, (_, i) => (i + 1) * 8.33);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full animate-grid-pulse"
      aria-hidden="true"
    >
      {horizontalLines.map((y, i) => (
        <line key={`h${i}`} x1="0" y1={y} x2="100" y2={y} stroke="oklch(0.17 0 0)" strokeWidth="0.06" />
      ))}
      {verticalLines.map((x, i) => (
        <line key={`v${i}`} x1={x} y1="0" x2={x} y2="100" stroke="oklch(0.17 0 0)" strokeWidth="0.06" />
      ))}
    </svg>
  );
}

/* ─────────────────── CROSSHAIR ORNAMENT ──────────────────── */
function Crosshair({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("w-8 h-8 text-[oklch(0.28_0_0)]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
      aria-hidden="true"
    >
      <line x1="12" y1="0" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="24" />
      <line x1="0" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="24" y2="12" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* ──────────────────────── LIVE CLOCK ───────────────────── */
function LiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      return now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      });
    };
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[11px] tracking-[0.18em] text-[oklch(0.36_0_0)] select-none tabular-nums">
      {time || "—"}
    </span>
  );
}

/* ──────────────────── STEP INDICATOR ───────────────────── */
function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={2}>
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full border text-[10px] font-semibold transition-all duration-300",
              n < current
                ? "bg-foreground border-foreground text-background"
                : n === current
                ? "bg-foreground border-foreground text-background scale-110"
                : "bg-transparent border-border text-muted-foreground"
            )}
          >
            {n < current ? <Check className="w-2.5 h-2.5" /> : n}
          </div>
          {n < 2 && (
            <div className="relative h-px w-8 bg-border overflow-hidden">
              {current > 1 && (
                <div className="absolute inset-0 bg-foreground animate-line-draw" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────── ROLE SELECTION CARD ──────────────────── */
interface RoleCardProps {
  role: NonNullable<Role>;
  label: string;
  description: string;
  glyph: string;
  selected: boolean;
  onSelect: () => void;
}

function RoleCard({ role, label, description, glyph, selected, onSelect }: RoleCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col gap-4 p-7 rounded-xl border text-left",
        "transition-all duration-300 cursor-pointer select-none",
        "min-h-[180px] w-full",
        "active:scale-[0.97]",
        selected
          ? "border-foreground bg-foreground text-background shadow-lg animate-card-pop"
          : "border-border bg-card text-foreground hover:border-foreground/40 hover:shadow-md"
      )}
      aria-pressed={selected}
      aria-label={`Select ${label} login`}
    >
      {/* Glyph */}
      <div
        className={cn(
          "text-3xl font-black tracking-tighter leading-none font-mono transition-colors duration-300",
          selected ? "text-background/60" : "text-foreground/10 group-hover:text-foreground/20"
        )}
        aria-hidden="true"
      >
        {glyph}
      </div>

      {/* Label */}
      <div className="mt-auto">
        <p
          className={cn(
            "text-xl font-semibold tracking-tight transition-all duration-300",
            selected ? "text-background text-2xl" : "text-foreground"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-xs mt-1 leading-relaxed transition-colors duration-300",
            selected ? "text-background/60" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      </div>

      {/* Selection pill */}
      {selected && (
        <div className="absolute top-4 right-4 flex items-center justify-center w-5 h-5 rounded-full bg-background animate-tick-in">
          <Check className="w-3 h-3 text-foreground" />
        </div>
      )}

      {/* Bottom accent line */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-[2px] rounded-b-xl transition-all duration-400",
          selected ? "w-full bg-background/30" : "w-0 group-hover:w-full bg-foreground/20"
        )}
        aria-hidden="true"
      />
    </button>
  );
}

/* ─────────────────── UNDERLINE INPUT ──────────────────── */
interface UnderlineInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

function UnderlineInput({ label, id, error, className, ...props }: UnderlineInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground select-none"
      >
        {label}
      </label>
      <div className="input-underline relative">
        <input
          id={id}
          className={cn(
            "w-full bg-transparent border-0 border-b border-border pb-2.5 pt-1",
            "text-sm font-medium text-foreground placeholder:text-muted-foreground/40",
            "focus:outline-none focus:border-foreground transition-colors duration-200",
            "min-h-[44px]",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[11px] text-destructive animate-fade-in font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ──────────────────── MAIN COMPONENT ──────────────────── */
export default function LoginPage() {
  const [stage, setStage] = useState<Stage>("role");
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [pendingRole, setPendingRole] = useState<Role>(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Credentials & { form: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const userIdRef = useRef<HTMLInputElement>(null);

  /* Focus first input when credentials stage appears */
  useEffect(() => {
    if (stage === "credentials") {
      const t = setTimeout(() => userIdRef.current?.focus(), 420);
      return () => clearTimeout(t);
    }
  }, [stage]);

  /* Keyboard shortcut: Cmd/Ctrl+Enter to submit */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (stage === "role" && pendingRole) handleRoleConfirm();
        if (stage === "credentials") handleSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleRoleConfirm = useCallback(() => {
    if (!pendingRole) return;
    setSelectedRole(pendingRole);
    setStage("credentials");
    setErrors({});
  }, [pendingRole]);

  const handleSubmit = useCallback(async () => {
    if (!selectedRole) return;
    const newErrors: typeof errors = {};
    if (!userId.trim()) newErrors.userId = "User ID is required";
    if (!password.trim()) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsLoading(true);
    setErrors({});

    await new Promise((r) => setTimeout(r, 1100));

    const valid = VALID_CREDS[selectedRole];
    if (userId === valid.userId && password === valid.password) {
      setStage("success");
    } else {
      setErrors({ form: "Invalid credentials — please try again." });
    }
    setIsLoading(false);
  }, [selectedRole, userId, password]);

  const handleBack = () => {
    setStage("role");
    setUserId("");
    setPassword("");
    setErrors({});
    setPendingRole(selectedRole);
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-background" role="main">

      {/* ── LEFT PANEL: Dark geometric background ── */}
      <aside
        className="hidden lg:flex relative w-[52%] xl:w-[56%] flex-col justify-between p-10 overflow-hidden"
        style={{ background: "oklch(0.07 0 0)" }}
        aria-hidden="true"
      >
        {/* Layered background */}
        <GridLines />
        <DotGrid />

        {/* Floating crosshairs */}
        <div className="absolute top-[18%] left-[22%] animate-crosshair opacity-60">
          <Crosshair />
        </div>
        <div
          className="absolute bottom-[24%] right-[18%] opacity-40"
          style={{ animation: "crosshair-drift 22s ease-in-out 3s infinite reverse" }}
        >
          <Crosshair className="w-5 h-5" />
        </div>
        <div
          className="absolute top-[55%] left-[60%] opacity-25"
          style={{ animation: "crosshair-drift 14s ease-in-out 7s infinite" }}
        >
          <Crosshair className="w-12 h-12" />
        </div>

        {/* Product wordmark — top of dark panel */}
        <div className="relative z-10 flex flex-col gap-2 select-none">
          <div className="flex items-center gap-3">
            <span className="inline-block w-6 h-px bg-[oklch(0.32_0_0)]" />
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[oklch(0.55_0_0)]">
                SalaryTracker
              </span>
              <span className="font-mono text-[9px] tracking-[0.16em] text-[oklch(0.28_0_0)] pl-0.5">
                (web Dream)
              </span>
            </div>
          </div>
          <LiveClock />
        </div>

        {/* Central hero text */}
        <div className="relative z-10 flex flex-col gap-6 select-none">
          <div className="flex flex-col gap-1">
            <span
              className="font-black leading-[0.88] tracking-tighter text-[oklch(0.92_0_0)]"
              style={{ fontSize: "clamp(4rem, 8vw, 7rem)" }}
            >
              WHO
            </span>
            <span
              className="font-black leading-[0.88] tracking-tighter text-[oklch(0.28_0_0)]"
              style={{ fontSize: "clamp(4rem, 8vw, 7rem)" }}
            >
              ARE
            </span>
            <span
              className="font-black leading-[0.88] tracking-tighter text-[oklch(0.92_0_0)]"
              style={{ fontSize: "clamp(4rem, 8vw, 7rem)" }}
            >
              YOU?
            </span>
          </div>
          <p className="text-[oklch(0.38_0_0)] text-sm leading-relaxed max-w-[240px] font-medium">
            Salary intelligence for Indian businesses.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-[0.2em] text-[oklch(0.22_0_0)] uppercase">
            v2.4.1 — 2026
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{
                  background: "oklch(0.28 0 0)",
                  animation: `dot-breathe ${2 + i * 0.6}s ease-in-out ${i * 400}ms infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL: Login Form ── */}
      <section
        className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:px-12 bg-background relative"
        aria-label="Login form"
      >
        {/* Corner ornaments — desktop only */}
        <div className="hidden lg:block absolute top-6 left-6 w-6 h-6 border-l border-t border-border" aria-hidden="true" />
        <div className="hidden lg:block absolute top-6 right-6 w-6 h-6 border-r border-t border-border" aria-hidden="true" />
        <div className="hidden lg:block absolute bottom-6 left-6 w-6 h-6 border-l border-b border-border" aria-hidden="true" />
        <div className="hidden lg:block absolute bottom-6 right-6 w-6 h-6 border-r border-b border-border" aria-hidden="true" />

        {/* Keyboard shortcut hint */}
        <div className="absolute top-6 right-6 hidden xl:flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono tracking-wide" aria-hidden="true">
          <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px]">⌘</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px]">↵</kbd>
          <span className="ml-1">to continue</span>
        </div>

        <div className="w-full max-w-[400px] flex flex-col gap-8">

          {/* Step indicator */}
          {stage !== "success" && (
            <div className="flex items-center justify-between animate-fade-in">
              <StepIndicator current={stage === "role" ? 1 : 2} />
              {stage === "credentials" && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 group min-h-[44px] px-1"
                  aria-label="Go back to role selection"
                >
                  <ChevronLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  Back
                </button>
              )}
            </div>
          )}

          {/* ── STAGE: Role Selection ── */}
          {stage === "role" && (
            <div className="flex flex-col gap-6 animate-slide-up">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-balance">
                  Select your role
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  SalaryTracker (web Dream) — where every rupee is accounted for.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <RoleCard
                  role="employer"
                  label="Employer"
                  description="Manage workforce, payroll & compliance."
                  glyph="E/"
                  selected={pendingRole === "employer"}
                  onSelect={() => setPendingRole("employer")}
                />
                <RoleCard
                  role="admin"
                  label="Admin"
                  description="Full system access and configuration."
                  glyph="A/"
                  selected={pendingRole === "admin"}
                  onSelect={() => setPendingRole("admin")}
                />
              </div>

              <button
                onClick={handleRoleConfirm}
                disabled={!pendingRole}
                className={cn(
                  "group flex items-center justify-center gap-2.5 w-full h-12 rounded-lg",
                  "text-sm font-semibold tracking-wide transition-all duration-250",
                  "active:scale-[0.98]",
                  pendingRole
                    ? "bg-foreground text-background hover:bg-foreground/90 shadow-sm hover:shadow-md"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
                aria-label="Continue to login"
              >
                Continue
                <ArrowRight
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    pendingRole ? "group-hover:translate-x-0.5" : ""
                  )}
                />
              </button>
            </div>
          )}

          {/* ── STAGE: Credentials ── */}
          {stage === "credentials" && (
            <div className="flex flex-col gap-7 animate-slide-up">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-foreground text-background text-[11px] font-semibold tracking-wide capitalize">
                    {selectedRole}
                  </div>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Enter credentials
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your session is end-to-end encrypted.
                </p>
              </div>

              <div className="flex flex-col gap-6">
                <UnderlineInput
                  id="userId"
                  label="User ID"
                  type="text"
                  placeholder="e.g. EMP-2024"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); setErrors((p) => ({ ...p, userId: undefined })); }}
                  error={errors.userId}
                  ref={userIdRef}
                  autoComplete="username"
                  spellCheck={false}
                />

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground select-none"
                  >
                    Password
                  </label>
                  <div className="input-underline relative flex items-center">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      className={cn(
                        "flex-1 bg-transparent border-0 border-b border-border pb-2.5 pt-1 pr-10",
                        "text-sm font-medium text-foreground placeholder:text-muted-foreground/40",
                        "focus:outline-none focus:border-foreground transition-colors duration-200",
                        "min-h-[44px]"
                      )}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-0 bottom-1.5 p-1 text-muted-foreground hover:text-foreground transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-destructive animate-fade-in font-medium" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                {errors.form && (
                  <div
                    className="flex items-center gap-2 px-3.5 py-3 rounded-lg bg-destructive/8 border border-destructive/20 animate-fade-in"
                    role="alert"
                  >
                    <div className="w-1 h-full min-h-[16px] rounded-full bg-destructive" aria-hidden="true" />
                    <p className="text-[12px] text-destructive font-medium">{errors.form}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={cn(
                  "relative group flex items-center justify-center gap-2.5 w-full h-12 rounded-lg overflow-hidden",
                  "text-sm font-semibold tracking-wide transition-all duration-250",
                  "active:scale-[0.98] bg-foreground text-background",
                  "hover:bg-foreground/90 shadow-sm hover:shadow-md",
                  isLoading && "cursor-wait"
                )}
                aria-label={isLoading ? "Signing in…" : "Sign in"}
              >
                {isLoading ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 border-background/30 border-t-background animate-spinner"
                      aria-hidden="true"
                    />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              {/* Demo hint */}
              <div className="flex items-start gap-2 p-3.5 rounded-lg bg-muted border border-border">
                <div className="w-1 h-full min-h-[16px] rounded-full bg-muted-foreground/30 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Demo credentials</p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed font-mono">
                    {selectedRole === "employer"
                      ? "ID: EMP-2024  ·  PW: pass123"
                      : "ID: ADM-ROOT  ·  PW: admin@99"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── STAGE: Success ── */}
          {stage === "success" && (
            <div className="flex flex-col items-center gap-6 py-8 animate-slide-up text-center">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-foreground">
                <Check className="w-7 h-7 text-background animate-tick-in" />
                <div
                  className="absolute inset-0 rounded-full border border-foreground/20"
                  style={{ animation: "card-select-pop 0.6s ease forwards" }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Access Granted</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Welcome back. Redirecting to your{" "}
                  <span className="font-semibold text-foreground capitalize">{selectedRole}</span>{" "}
                  salary command center&hellip;
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span
                  className="w-2 h-2 rounded-full bg-foreground"
                  style={{ animation: "dot-breathe 1s ease-in-out infinite" }}
                  aria-hidden="true"
                />
                Establishing secure session
              </div>
              <button
                onClick={() => { setStage("role"); setSelectedRole(null); setPendingRole(null); setUserId(""); setPassword(""); }}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors duration-200 mt-2"
              >
                Return to login
              </button>
            </div>
          )}
        </div>

        {/* Bottom label */}
        {stage !== "success" && (
          <p className="absolute bottom-6 text-[10px] text-muted-foreground/50 font-mono tracking-[0.16em] select-none" aria-hidden="true">
            SalaryTracker (web Dream)
          </p>
        )}
      </section>
    </div>
  );
}
