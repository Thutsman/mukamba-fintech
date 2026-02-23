import * as React from 'react';
import { EmailButton, EmailLayout, type EmailCta } from './base';

export interface KycStatusEmailTemplateProps {
  firstName: string;
  verificationType: 'identity' | 'financial' | 'address' | 'employment' | 'comprehensive' | string;
  status: 'approved' | 'rejected';
  rejectionReason?: string | null;
  cta?: EmailCta;
}

export const KycStatusEmailTemplate: React.FC<KycStatusEmailTemplateProps> = ({
  firstName,
  verificationType,
  status,
  rejectionReason,
  cta,
}) => {
  const label =
    verificationType === 'identity'
      ? 'Identity verification'
      : verificationType === 'financial'
      ? 'Financial verification'
      : 'KYC verification';

  const title = status === 'approved' ? 'KYC approved' : 'KYC rejected';

  return (
    <EmailLayout title={title}>
      <h2 style={{ marginTop: 0 }}>Hi {firstName}, your {label.toLowerCase()} was {status}.</h2>

      {status === 'approved' ? (
        <p style={{ marginTop: 0 }}>
          You can now access additional platform features. Please refresh your browser to see the update.
        </p>
      ) : (
        <>
          <p style={{ marginTop: 0 }}>
            Unfortunately, we couldn’t approve your submission. Please refresh your browser and resubmit with corrected details.
          </p>
          {rejectionReason ? (
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
              <div style={{ whiteSpace: 'pre-wrap' }}>{rejectionReason}</div>
            </div>
          ) : null}
        </>
      )}

      {cta ? <EmailButton {...cta} /> : null}
    </EmailLayout>
  );
};

