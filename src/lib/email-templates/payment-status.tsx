import * as React from 'react';
import { EmailButton, EmailLayout, type EmailCta } from './base';

export interface PaymentStatusEmailTemplateProps {
  firstName: string;
  status: 'verified' | 'rejected';
  amount?: string;
  offerReference?: string;
  reason?: string | null;
  cta?: EmailCta;
}

export const PaymentStatusEmailTemplate: React.FC<PaymentStatusEmailTemplateProps> = ({
  firstName,
  status,
  amount,
  offerReference,
  reason,
  cta,
}) => {
  return (
    <EmailLayout title={status === 'verified' ? 'Payment verified' : 'Payment proof rejected'}>
      <h2 style={{ marginTop: 0 }}>
        Hi {firstName}, your payment was {status === 'verified' ? 'verified' : 'rejected'}.
      </h2>
      <p style={{ marginTop: 0 }}>
        {amount ? <>Amount: <strong>{amount}</strong>. </> : null}
        {offerReference ? <>Offer: <strong>{offerReference}</strong>.</> : null}
      </p>

      {status === 'verified' ? (
        <p style={{ marginTop: 0 }}>
          Thank you. Your payment has been confirmed by the Mukamba admin team.
        </p>
      ) : (
        <>
          <p style={{ marginTop: 0 }}>
            Please resubmit a valid proof of payment from your dashboard.
          </p>
          {reason ? (
            <div
              style={{
                backgroundColor: 'white',
                border: '1px solid #eee',
                borderRadius: 8,
                padding: 14,
                marginTop: 14,
              }}
            >
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Reason</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{reason}</div>
            </div>
          ) : null}
        </>
      )}

      {cta ? <EmailButton {...cta} /> : null}
    </EmailLayout>
  );
};

