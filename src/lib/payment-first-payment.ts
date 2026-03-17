export type OfferPaymentLike = {
  id: string;
  offer_id: string;
  created_at: string;
};

/**
 * Returns a map of offer_id -> first payment id (earliest created_at).
 * This is a pure helper; callers should ensure they pass *all* payments for the offer
 * if they need a definitive result.
 */
export function getFirstPaymentIdByOffer(
  payments: OfferPaymentLike[]
): Record<string, string> {
  const firstByOffer: Record<string, { id: string; createdAtMs: number }> = {};

  for (const p of payments || []) {
    if (!p?.offer_id || !p?.id || !p?.created_at) continue;
    const ms = Date.parse(p.created_at);
    if (!Number.isFinite(ms)) continue;

    const existing = firstByOffer[p.offer_id];
    if (!existing || ms < existing.createdAtMs) {
      firstByOffer[p.offer_id] = { id: p.id, createdAtMs: ms };
    }
  }

  const out: Record<string, string> = {};
  for (const [offerId, v] of Object.entries(firstByOffer)) {
    out[offerId] = v.id;
  }
  return out;
}

export function isFirstPaymentForOffer(params: {
  paymentId: string;
  offerId: string;
  firstPaymentIdByOffer: Record<string, string>;
}): boolean {
  const firstId = params.firstPaymentIdByOffer[params.offerId];
  return Boolean(firstId && firstId === params.paymentId);
}

