import * as React from 'react';
import { EmailButton, EmailLayout, type EmailCta } from './base';

export interface AdminActionRequiredEmailTemplateProps {
  title: string;
  message: string;
  cta: EmailCta;
}

export const AdminActionRequiredEmailTemplate: React.FC<AdminActionRequiredEmailTemplateProps> = ({
  title,
  message,
  cta,
}) => {
  return (
    <EmailLayout title={title}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ marginTop: 0, whiteSpace: 'pre-wrap' }}>{message}</p>
      <EmailButton {...cta} />
    </EmailLayout>
  );
};

