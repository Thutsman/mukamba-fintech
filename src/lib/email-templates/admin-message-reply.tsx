import * as React from 'react';
import { EmailButton, EmailLayout, type EmailCta } from './base';

export interface AdminMessageReplyEmailTemplateProps {
  firstName: string;
  propertyTitle?: string;
  preview: string;
  cta: EmailCta;
}

export const AdminMessageReplyEmailTemplate: React.FC<AdminMessageReplyEmailTemplateProps> = ({
  firstName,
  propertyTitle,
  preview,
  cta,
}) => {
  return (
    <EmailLayout title="New reply from Mukamba">
      <h2 style={{ marginTop: 0 }}>Hi {firstName}, you have a new message.</h2>
      {propertyTitle ? (
        <p style={{ marginTop: 0 }}>
          Property: <strong>{propertyTitle}</strong>
        </p>
      ) : null}

      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #eee',
          borderRadius: 8,
          padding: 14,
          marginTop: 14,
        }}
      >
        <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Preview</div>
        <div style={{ whiteSpace: 'pre-wrap' }}>{preview}</div>
      </div>

      <EmailButton {...cta} />

      <p style={{ color: '#666', fontSize: 13, marginTop: 18 }}>
        For your privacy, we only include a short preview in email. Open your inbox to view the full conversation.
      </p>
    </EmailLayout>
  );
};

