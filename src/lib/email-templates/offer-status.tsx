import * as React from 'react';
import { EmailButton, EmailLayout, type EmailCta } from './base';

export interface OfferStatusEmailTemplateProps {
  firstName: string;
  offerReference: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string | null;
  propertyTitle?: string | null;
  propertySuburb?: string | null;
  propertyStreetAddress?: string | null;
  cta?: EmailCta;
}

export const OfferStatusEmailTemplate: React.FC<OfferStatusEmailTemplateProps> = ({
  firstName,
  offerReference,
  status,
  rejectionReason,
  propertyTitle,
  propertySuburb,
  propertyStreetAddress,
  cta,
}) => {
  const hasPropertyDetails = Boolean(propertyTitle || propertySuburb || propertyStreetAddress);
  return (
    <EmailLayout title={status === 'approved' ? 'Offer approved' : 'Offer rejected'}>
      <h2 style={{ marginTop: 0 }}>
        Hi {firstName}, your offer <strong>{offerReference}</strong> was {status}.
      </h2>

      {hasPropertyDetails ? (
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #eee',
            borderRadius: 8,
            padding: 14,
            marginTop: 0,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Property details</div>
          {propertyTitle ? <div style={{ marginBottom: 4 }}><strong>{propertyTitle}</strong></div> : null}
          {propertySuburb ? <div style={{ color: '#444' }}>Suburb: {propertySuburb}</div> : null}
          {propertyStreetAddress ? (
            <div style={{ color: '#444' }}>Street address: {propertyStreetAddress}</div>
          ) : null}
        </div>
      ) : null}

      {status === 'approved' ? (
        <p style={{ marginTop: 0 }}>
          Please proceed to upload your proof of payment from your Verified Dashboard within 7 days.
        </p>
      ) : (
        <>
          <p style={{ marginTop: 0 }}>
            You can submit a new offer when you’re ready.
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

      {status === 'approved' ? (
        <p style={{ color: '#666', fontSize: 13, marginTop: 18 }}>
          Tip: after uploading proof of payment, the admin will verify it in the Payment Tracking tab.
        </p>
      ) : null}
    </EmailLayout>
  );
};

