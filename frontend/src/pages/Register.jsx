import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { register, googleLogin } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { isStrongPassword } from "../lib/passwordStrength";
import AuthLayout from "../components/auth/AuthLayout";
import FormWrapper from "../components/auth/FormWrapper";
import InputField from "../components/auth/InputField";
import Button from "../components/auth/Button";
import AuthDivider from "../components/auth/AuthDivider";
import SocialLoginButton from "../components/auth/SocialLoginButton";
import PasswordStrengthMeter from "../components/auth/PasswordStrengthMeter";

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const emailOk = useMemo(() => {
    if (!email.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const confirmError =
    confirmPassword.length > 0 && password !== confirmPassword ? "Passwords do not match." : "";

  const canSubmit =
    name.trim().length >= 2 &&
    email.trim() &&
    emailOk &&
    isStrongPassword(password) &&
    password === confirmPassword &&
    termsAccepted;

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setTouched({ name: true, email: true, password: true, confirm: true, terms: true });
    if (!canSubmit) {
      setFormError("Fix the highlighted fields before continuing.");
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        name,
        email,
        password,
        confirmPassword,
        termsAccepted
      });
      const devOtp = res.data?.devOtp;
      toast("Account created. Check your email for the verification code.", "success");
      navigate("/verify-email", {
        state: { email, devOtp },
        replace: true
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed.";
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
      toast("Account ready. Signed in with Google.", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Google sign-up failed.";
      setFormError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <FormWrapper
        eyebrow="Get started"
        title="Create your account"
        description="You’ll verify your email before signing in. Your organization role is assigned by an admin after onboarding."
      >
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <InputField
            id="reg-name"
            label="Full name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            error={
              touched.name && name.trim().length < 2 ? "Please enter at least 2 characters." : ""
            }
            icon={User}
            autoComplete="name"
          />

          <InputField
            id="reg-email"
            label="Work email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={touched.email && !emailOk ? "Enter a valid email address." : ""}
            icon={Mail}
            autoComplete="email"
          />

          <div className="space-y-2">
            <InputField
              id="reg-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              error={
                touched.password && password && !isStrongPassword(password)
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
            id="reg-confirm"
            label="Confirm password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            error={touched.confirm ? confirmError : ""}
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

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-300">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              onBlur={() => setTouched((t) => ({ ...t, terms: true }))}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
            />
            <span>
              I agree to the{" "}
              <span className="font-semibold text-slate-900 dark:text-white">Terms &amp; Conditions</span> and privacy
              practices.
            </span>
          </label>
          {touched.terms && !termsAccepted ? (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">You must accept the terms to continue.</p>
          ) : null}

          {formError ? (
            <p
              className="rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
              role="alert"
            >
              {formError}
            </p>
          ) : null}

          <Button type="submit" fullWidth loading={loading} loadingLabel="Creating account…" disabled={!canSubmit}>
            Create account
          </Button>
        </form>

        {googleClientId ? (
          <div className="mt-6 space-y-4">
            <AuthDivider label="or" />
            <SocialLoginButton
              disabled={loading}
              text="signup_with"
              onSuccess={onGoogleSuccess}
              onError={() => {
                setFormError("Google sign-up was interrupted.");
                toast("Google sign-up interrupted.", "error");
              }}
            />
          </div>
        ) : null}

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            className="font-semibold text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      </FormWrapper>
    </AuthLayout>
  );
}
