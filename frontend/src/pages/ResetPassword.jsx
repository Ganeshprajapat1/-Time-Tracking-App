import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../api/authApi";
import { useToast } from "../context/ToastContext";
import { isStrongPassword } from "../lib/passwordStrength";
import AuthLayout from "../components/auth/AuthLayout";
import FormWrapper from "../components/auth/FormWrapper";
import InputField from "../components/auth/InputField";
import Button from "../components/auth/Button";
import PasswordStrengthMeter from "../components/auth/PasswordStrengthMeter";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [formError, setFormError] = useState("");

  const confirmError =
    confirmPassword.length > 0 && password !== confirmPassword ? "Passwords do not match." : "";

  const canSubmit =
    Boolean(token) && isStrongPassword(password) && password === confirmPassword && !confirmError;

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    setTouched(true);
    if (!canSubmit) {
      setFormError("Fix password requirements and matching fields.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, password, confirmPassword });
      toast("Password updated. Sign in with your new password.", "success");
      setTimeout(() => navigate("/login", { replace: true }), 800);
    } catch (err) {
      const msg = err?.response?.data?.message || "Reset failed.";
      setFormError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <FormWrapper
        eyebrow="Almost there"
        title="Set a new password"
        description="Choose a strong password you haven’t used elsewhere. Reset links are single-use and time-limited."
      >
        {!token ? (
          <p className="rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
            Missing or invalid reset token. Request a new link from the forgot password page.
          </p>
        ) : null}

        <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
          <div className="space-y-2">
            <InputField
              id="reset-pass"
              label="New password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched(true)}
              error={
                touched && password && !isStrongPassword(password)
                  ? "Use 8+ characters with upper, lower, number, and symbol."
                  : ""
              }
              icon={Lock}
              autoComplete="new-password"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <PasswordStrengthMeter password={password} />
          </div>

          <InputField
            id="reset-confirm"
            label="Confirm password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched(true)}
            error={touched ? confirmError : ""}
            icon={Lock}
            autoComplete="new-password"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          {formError ? (
            <p className="rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              {formError}
            </p>
          ) : null}

          <Button type="submit" fullWidth loading={loading} loadingLabel="Updating…" disabled={!token || !canSubmit}>
            Reset password
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400" to="/login">
            Back to sign in
          </Link>
        </p>
      </FormWrapper>
    </AuthLayout>
  );
}
