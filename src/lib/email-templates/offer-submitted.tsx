import * as React from 'react';
import { EmailButton, EmailLayout, type EmailCta } from './base';

export interface OfferSubmittedEmailTemplateProps {
  firstName: string;
  offerReference: string;
  offerAmount: string;
  cta?: EmailCta;
}

export const OfferSubmittedEmailTemplate: React.FC<OfferSubmittedEmailTemplateProps> = ({
  firstName,
  offerReference,
  offerAmount,
  cta,
}) => {
  return (
    <EmailLayout title="Offer submitted">
      <h2 style={{ marginTop: 0 }}>Hi {firstName}, we’ve received your offer.</h2>
      <p style={{ marginTop: 0 }}>
        Your offer <strong>{offerReference}</strong> valued at <strong>{offerAmount}</strong> has been submitted to the Mukamba team.
      </p>
      <p style={{ color: '#7F1518', fontWeight: 700 }}>
        You should get a response within the next 48 hours.
      </p>
      {cta ? <EmailButton {...cta} /> : null}
    </EmailLayout>
  );
};

