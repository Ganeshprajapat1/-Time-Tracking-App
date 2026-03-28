import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "../api/authApi";
import { useToast } from "../context/ToastContext";
import AuthLayout from "../components/auth/AuthLayout";
import FormWrapper from "../components/auth/FormWrapper";
import InputField from "../components/auth/InputField";
import Button from "../components/auth/Button";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailError = useMemo(() => {
    if (!email.trim()) return "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter a valid email address.";
  }, [email]);

  const canSubmit = email.trim() && !emailError;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      setSubmitted(true);
      toast(res.data?.message || "If an account exists, instructions were sent.", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Request failed.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <FormWrapper
        eyebrow="Security"
        title="Forgot password?"
        description="We’ll email a secure reset link if this address is registered. Links expire quickly for your safety."
      >
        {submitted ? (
          <div className="space-y-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-5 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
            <div className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-semibold">Check your inbox</p>
                <p className="mt-1 text-sm leading-relaxed opacity-90">
                  If <span className="font-medium">{email}</span> matches an account, you’ll receive reset instructions
                  shortly. Didn’t get it? Look in spam or request again in a few minutes.
                </p>
              </div>
            </div>
            <Button variant="secondary" fullWidth onClick={() => setSubmitted(false)} type="button">
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5" noValidate>
            <InputField
              id="forgot-email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              icon={Mail}
              autoComplete="email"
            />
            {error ? (
              <p className="rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </p>
            ) : null}
            <Button type="submit" fullWidth loading={loading} loadingLabel="Sending…" disabled={!canSubmit}>
              Send reset link
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400" to="/login">
            Back to sign in
          </Link>
        </p>
      </FormWrapper>
    </AuthLayout>
  );
}
