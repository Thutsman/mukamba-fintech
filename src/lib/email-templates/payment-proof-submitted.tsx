import * as React from 'react';
import { EmailButton, EmailLayout, type EmailCta } from './base';

export interface PaymentProofSubmittedEmailTemplateProps {
  firstName: string;
  offerReference?: string;
  amount?: string;
  cta?: EmailCta;
}

export const PaymentProofSubmittedEmailTemplate: React.FC<PaymentProofSubmittedEmailTemplateProps> = ({
  firstName,
  offerReference,
  amount,
  cta,
}) => {
  return (
    <EmailLayout title="Proof of payment submitted">
      <h2 style={{ marginTop: 0 }}>Hi {firstName}, we've received your proof of payment.</h2>
      <p style={{ marginTop: 0 }}>
        Your proof of payment has been successfully submitted to Mukamba Gateway.
        {amount ? <> Amount: <strong>{amount}</strong>. </> : null}
        {offerReference ? <> Offer: <strong>{offerReference}</strong>. </> : null}
      </p>
      <p style={{ marginTop: 14, color: '#444' }}>
        The Mukamba team will respond and confirm that the payment has been received once it reflects in our bank account. You can track the status in your dashboard.
      </p>
      {cta ? <EmailButton {...cta} /> : null}
    </EmailLayout>
  );
};

