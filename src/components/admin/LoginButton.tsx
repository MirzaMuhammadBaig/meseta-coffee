"use client";

import { useFormStatus } from "react-dom";
import { Loader2, LogIn } from "lucide-react";

/**
 * Submit button for the admin login form.
 *
 * `useFormStatus` reads the pending state of the parent <form>, so the
 * button shows a spinner + "Signing in…" the moment it's clicked and
 * stays disabled until the sign-in server action finishes (or redirects).
 */
export default function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="btn-primary mt-7 w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in…
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Sign in
        </>
      )}
    </button>
  );
}
