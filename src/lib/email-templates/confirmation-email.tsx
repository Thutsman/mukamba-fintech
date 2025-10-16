import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  confirmationUrl: string;
}

export const ConfirmationEmailTemplate: React.FC<EmailTemplateProps> = ({
  firstName,
  confirmationUrl,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ backgroundColor: '#7F1518', padding: '40px 20px', textAlign: 'center' }}>
      <h1 style={{ color: 'white', margin: 0 }}>Mukamba Gateway</h1>
    </div>
    <div style={{ padding: '40px 20px', backgroundColor: '#f9f9f9' }}>
      <h2>Welcome to Mukamba Gateway, {firstName}!</h2>
      <p>Thank you for signing up. Please confirm your email address to get started.</p>
      <p style={{ color: '#7F1518', fontWeight: 'bold', fontSize: '14px' }}>
        ⏰ This confirmation link expires in 1 hour for security reasons.
      </p>
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a href={confirmationUrl} style={{
          backgroundColor: '#7F1518',
          color: 'white',
          padding: '12px 30px',
          textDecoration: 'none',
          borderRadius: '5px',
          display: 'inline-block'
        }}>
          Confirm Email Address
        </a>
      </div>
      <p style={{ color: '#666', fontSize: '14px' }}>
        If you didn't create this account, you can safely ignore this email.
      </p>
    </div>
    <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
      © 2025 Mukamba Gateway. All rights reserved.
    </div>
  </div>
);

