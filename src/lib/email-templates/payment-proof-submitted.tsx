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
      <h2 style={{ marginTop: 0 }}>Hi {firstName}, your proof of payment was submitted.</h2>
      <p style={{ marginTop: 0 }}>
        {amount ? <>Amount: <strong>{amount}</strong>. </> : null}
        {offerReference ? <>Offer: <strong>{offerReference}</strong>.</> : null}
      </p>
      <p style={{ color: '#7F1518', fontWeight: 700 }}>
        Your proof will be reviewed within 1–2 business days.
      </p>
      {cta ? <EmailButton {...cta} /> : null}
    </EmailLayout>
  );
};

