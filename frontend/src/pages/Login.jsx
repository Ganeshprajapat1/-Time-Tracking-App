import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { login, googleLogin } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AuthLayout from "../components/auth/AuthLayout";
import FormWrapper from "../components/auth/FormWrapper";
import InputField from "../components/auth/InputField";
import Button from "../components/auth/Button";
import AuthDivider from "../components/auth/AuthDivider";
import SocialLoginButton from "../components/auth/SocialLoginButton";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const emailError = useMemo(() => {
    if (!email.trim()) return "";
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return ok ? "" : "Enter a valid email address.";
  }, [email]);

  const canSubmit = email.trim() && password.length >= 1 && !emailError;

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await login({ email, password, rememberMe });
      loginUser(res.data);
      toast("Signed in successfully.", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed.";
      setFormError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (cred) => {
    setLoading(true);
    setFormError("");
    try {
      const res = await googleLogin({ credential: cred.credential });
      loginUser(res.data);
      toast("Signed in with Google.", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Google sign-in failed.";
      setFormError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      footer={
        <p>
          Protected area — by continuing you agree to our{" "}
          <span className="font-medium text-slate-600 dark:text-slate-400">Terms</span>.
        </p>
      }
    >
      <FormWrapper
        eyebrow="Welcome back"
        title="Sign in to TimeTrack"
        description="Enter your credentials to access your workspace. New teammates register with email verification first."
      >
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <InputField
            id="login-email"
            label="Work email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            icon={Mail}
            autoComplete="email"
          />

          <InputField
            id="login-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            autoComplete="current-password"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
              />
              <span className="font-medium">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
            >
              Forgot password?
            </Link>
          </div>

          {formError ? (
            <p
              className="rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
              role="alert"
            >
              {formError}
            </p>
          ) : null}

          <Button type="submit" fullWidth loading={loading} loadingLabel="Signing in…" disabled={!canSubmit}>
            Sign in
          </Button>
        </form>

        {googleClientId ? (
          <div className="mt-6 space-y-4">
            <AuthDivider label="or" />
            <SocialLoginButton
              disabled={loading}
              text="continue_with"
              onSuccess={onGoogleSuccess}
              onError={() => {
                setFormError("Google sign-in was interrupted.");
                toast("Google sign-in interrupted.", "error");
              }}
            />
          </div>
        ) : null}

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          No account?{" "}
          <Link
            className="font-semibold text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
            to="/register"
          >
            Create one
          </Link>
        </p>
      </FormWrapper>
    </AuthLayout>
  );
}
