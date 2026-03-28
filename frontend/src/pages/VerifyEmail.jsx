import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Shield } from "lucide-react";
import { verifyEmail, resendVerification } from "../api/authApi";
import { useToast } from "../context/ToastContext";
import AuthLayout from "../components/auth/AuthLayout";
import FormWrapper from "../components/auth/FormWrapper";
import InputField from "../components/auth/InputField";
import Button from "../components/auth/Button";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const initialEmail = location.state?.email || "";
  const devOtp = location.state?.devOtp;

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(devOtp || "");
  const [message, setMessage] = useState(
    devOtp ? `Development OTP prefilled: ${devOtp}` : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await verifyEmail({ email, otp });
      setMessage("Email verified. Redirecting to sign in…");
      toast("Email verified successfully.", "success");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      const msg = err?.response?.data?.message || "Verification failed.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setMessage("");
    try {
      const res = await resendVerification({ email });
      if (res.data?.devOtp) setMessage(`Development OTP: ${res.data.devOtp}`);
      else setMessage("If eligible, a new code was sent.");
      toast("Verification code sent.", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not resend.";
      setError(msg);
      toast(msg, "error");
    }
  };

  return (
    <AuthLayout>
      <FormWrapper
        eyebrow="Verify"
        title="Check your inbox"
        description="Enter the one-time code we sent to your email. Codes expire after a short time for security."
      >
        <form onSubmit={submit} className="space-y-5">
          <InputField
            id="verify-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            autoComplete="email"
          />
          <div>
            <InputField
              id="verify-otp"
              label="Verification code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              icon={Shield}
              autoComplete="one-time-code"
              inputClassName="tracking-widest"
            />
          </div>
          {error ? (
            <p className="rounded-2xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
              {message}
            </p>
          ) : null}

          <Button type="submit" fullWidth loading={loading} loadingLabel="Verifying…">
            Verify email
          </Button>
        </form>

        <Button type="button" variant="secondary" fullWidth className="mt-3" onClick={resend}>
          Resend code
        </Button>

        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400" to="/login">
            Back to sign in
          </Link>
        </p>
      </FormWrapper>
    </AuthLayout>
  );
}
