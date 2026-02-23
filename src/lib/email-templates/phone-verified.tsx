import * as React from 'react';
import { EmailButton, EmailLayout, type EmailCta } from './base';

export interface PhoneVerifiedEmailTemplateProps {
  firstName: string;
  phoneNumber?: string;
  unlocked?: string[];
  nextSteps?: string[];
  cta?: EmailCta;
}

export const PhoneVerifiedEmailTemplate: React.FC<PhoneVerifiedEmailTemplateProps> = ({
  firstName,
  phoneNumber,
  unlocked = ['Messaging access', 'Notifications for important updates'],
  nextSteps = ['Submit identity verification', 'Make an offer on a property', 'Track your offers and messages in your dashboard'],
  cta,
}) => {
  return (
    <EmailLayout title="Phone verified">
      <h2 style={{ marginTop: 0 }}>Hi {firstName}, your phone number is verified.</h2>
      {phoneNumber ? <p style={{ margin: '8px 0 0' }}>Verified number: <strong>{phoneNumber}</strong></p> : null}

      <h3 style={{ marginBottom: 8, marginTop: 24 }}>What you’ve unlocked</h3>
      <ul style={{ marginTop: 0, paddingLeft: 18 }}>
        {unlocked.map((u) => (
          <li key={u} style={{ marginBottom: 6 }}>{u}</li>
        ))}
      </ul>

      <h3 style={{ marginBottom: 8, marginTop: 20 }}>Recommended next steps</h3>
      <ol style={{ marginTop: 0, paddingLeft: 18 }}>
        {nextSteps.map((s) => (
          <li key={s} style={{ marginBottom: 6 }}>{s}</li>
        ))}
      </ol>

      {cta ? <EmailButton {...cta} /> : null}

      <p style={{ color: '#666', fontSize: 13, marginTop: 18 }}>
        If you didn’t request this verification, please contact support.
      </p>
    </EmailLayout>
  );
};

