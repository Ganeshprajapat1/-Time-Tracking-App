import { GoogleLogin } from "@react-oauth/google";
import { cn } from "../../lib/cn";

/**
 * Wraps Google Identity button with consistent full-width SaaS styling.
 * Must render under GoogleOAuthProvider when clientId is set.
 */
export default function SocialLoginButton({ onSuccess, onError, disabled, text = "signup_with" }) {
  return (
    <div
      className={cn(
        "flex w-full justify-center rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-sm transition hover:border-slate-300 hover:shadow-md",
        "dark:border-slate-600 dark:bg-slate-900",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <div className="flex min-h-[52px] w-full max-w-full items-center justify-center overflow-hidden [&>div]:flex [&>div]:w-full [&>div]:justify-center">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          theme="outline"
          size="large"
          text={text}
          shape="pill"
          width={340}
        />
      </div>
    </div>
  );
}
