import * as React from 'react';
import { EmailButton, EmailLayout, type EmailCta } from './base';

export interface KycSubmittedEmailTemplateProps {
  firstName: string;
  verificationType: 'identity' | 'financial' | 'address' | 'employment' | 'comprehensive' | string;
  cta?: EmailCta;
}

export const KycSubmittedEmailTemplate: React.FC<KycSubmittedEmailTemplateProps> = ({
  firstName,
  verificationType,
  cta,
}) => {
  const label =
    verificationType === 'identity'
      ? 'Identity verification'
      : verificationType === 'financial'
      ? 'Financial verification'
      : 'KYC verification';

  return (
    <EmailLayout title="KYC submission received">
      <h2 style={{ marginTop: 0 }}>Hi {firstName}, we’ve received your submission.</h2>
      <p style={{ marginTop: 0 }}>
        <strong>{label}</strong> has been successfully submitted to the Mukamba team.
      </p>

      <p style={{ color: '#7F1518', fontWeight: 700 }}>
        You should expect a response within 24 hours.
      </p>

      {cta ? <EmailButton {...cta} /> : null}

      <p style={{ color: '#666', fontSize: 13, marginTop: 18 }}>
        If you need to update your documents, submit a new verification from your profile.
      </p>
    </EmailLayout>
  );
};

