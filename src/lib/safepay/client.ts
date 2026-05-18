/**
 * Thin wrapper around the Safepay (https://getsafepay.com) checkout API.
 *
 * Safepay is the leading Pakistani card payments gateway. The flow we use
 * here is the "Embedded Checkout" pattern:
 *
 *   1. Create a payment session by POSTing the order to Safepay (this
 *      function returns a tracker token).
 *   2. Redirect the buyer to Safepay's hosted checkout with that token.
 *   3. Safepay redirects the buyer back to the success/cancel URL we
 *      provided.
 *   4. Safepay also POSTs a webhook to our backend so we can mark the
 *      order as paid even if the buyer closes the tab before the
 *      redirect completes.
 *
 * Docs: https://docs.getsafepay.com/
 */

import crypto from "node:crypto";

export type SafepayEnv = "sandbox" | "production";

// Accept either SAFEPAY_ENVIRONMENT (Safepay's docs naming) or SAFEPAY_ENV.
export function getSafepayEnv(): SafepayEnv {
  const env = process.env.SAFEPAY_ENVIRONMENT ?? process.env.SAFEPAY_ENV;
  return env === "production" ? "production" : "sandbox";
}

// Accept either SAFEPAY_V1_SECRET (Safepay's dashboard naming) or SAFEPAY_API_SECRET.
function getSafepaySecret(): string | undefined {
  return process.env.SAFEPAY_V1_SECRET ?? process.env.SAFEPAY_API_SECRET;
}

export function isSafepayConfigured(): boolean {
  return Boolean(process.env.SAFEPAY_API_KEY && getSafepaySecret());
}

const API_BASES: Record<SafepayEnv, string> = {
  sandbox: "https://sandbox.api.getsafepay.com",
  production: "https://api.getsafepay.com",
};

const CHECKOUT_BASES: Record<SafepayEnv, string> = {
  sandbox: "https://sandbox.api.getsafepay.com/embedded",
  production: "https://getsafepay.com/embedded",
};

export type SafepayInitParams = {
  /** Our own order number — appears on the Safepay dashboard. */
  orderId: string;
  /** Amount in PKR (whole rupees; we convert to paisa for Safepay). */
  amountPkr: number;
  customer: { name: string; phone: string; email?: string };
  successUrl: string;
  cancelUrl: string;
};

export type SafepayInitResult = {
  tracker: string;
  checkoutUrl: string;
};

/**
 * Create a Safepay payment session and return the hosted-checkout URL.
 * Throws when Safepay returns a non-2xx response.
 */
export async function initSafepaySession(
  params: SafepayInitParams,
): Promise<SafepayInitResult> {
  if (!isSafepayConfigured()) {
    throw new Error(
      "Safepay is not configured. Set SAFEPAY_API_KEY and SAFEPAY_V1_SECRET.",
    );
  }

  const env = getSafepayEnv();
  const apiBase = API_BASES[env];
  const checkoutBase = CHECKOUT_BASES[env];

  const res = await fetch(`${apiBase}/order/v1/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Safepay accepts the merchant secret in this header.
      "X-SFPY-MERCHANT-SECRET": getSafepaySecret()!,
    },
    body: JSON.stringify({
      client: process.env.SAFEPAY_API_KEY,
      amount: Math.round(params.amountPkr * 100), // paisa
      currency: "PKR",
      order_id: params.orderId,
      user_data: {
        name: params.customer.name,
        email: params.customer.email ?? undefined,
        phone_number: params.customer.phone,
      },
    }),
    // Safepay's API is fast; bail if it takes more than 15s.
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Safepay init failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    data?: { tracker?: { token?: string } };
    tracker?: { token?: string };
  };
  const tracker = data?.data?.tracker?.token ?? data?.tracker?.token;
  if (!tracker) {
    throw new Error("Safepay did not return a tracker token");
  }

  const checkoutUrl = new URL(checkoutBase);
  checkoutUrl.searchParams.set("env", env);
  checkoutUrl.searchParams.set("tbt", tracker);
  checkoutUrl.searchParams.set("order_id", params.orderId);
  checkoutUrl.searchParams.set("source", "custom");
  checkoutUrl.searchParams.set("redirect_url", params.successUrl);
  checkoutUrl.searchParams.set("cancel_url", params.cancelUrl);

  return { tracker, checkoutUrl: checkoutUrl.toString() };
}

/**
 * Verify a webhook payload using HMAC-SHA256 against SAFEPAY_WEBHOOK_SECRET.
 * Safepay sends the signature in the `X-SFPY-SIGNATURE` header.
 *
 * Returns true if the signature is valid (or if no secret is configured,
 * in which case we log a warning and skip verification — useful in dev).
 */
export function verifySafepayWebhook(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.SAFEPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn(
      "[safepay] SAFEPAY_WEBHOOK_SECRET not set; skipping signature check",
    );
    return true;
  }
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex"),
    );
  } catch {
    return false;
  }
}
