import * as React from 'react';

interface PasswordResetEmailTemplateProps {
  firstName: string;
  resetUrl: string;
}

export const PasswordResetEmailTemplate: React.FC<PasswordResetEmailTemplateProps> = ({
  firstName,
  resetUrl,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ backgroundColor: '#7F1518', padding: '40px 20px', textAlign: 'center' }}>
      <h1 style={{ color: 'white', margin: 0 }}>Mukamba Gateway</h1>
    </div>
    <div style={{ padding: '40px 20px', backgroundColor: '#f9f9f9' }}>
      <h2>Password Reset Request</h2>
      <p>Hello {firstName},</p>
      <p>We received a request to reset your password for your Mukamba Gateway account.</p>
      <p style={{ color: '#7F1518', fontWeight: 'bold', fontSize: '14px' }}>
        ⏰ This reset link expires in 1 hour for security reasons.
      </p>
      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a href={resetUrl} style={{
          backgroundColor: '#7F1518',
          color: 'white',
          padding: '12px 30px',
          textDecoration: 'none',
          borderRadius: '5px',
          display: 'inline-block'
        }}>
          Reset Password
        </a>
      </div>
      <p style={{ color: '#666', fontSize: '14px' }}>
        If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
      <p style={{ color: '#666', fontSize: '14px' }}>
        For security reasons, this link can only be used once. If you need to reset your password again, please request a new reset link.
      </p>
    </div>
    <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
      © 2025 Mukamba Gateway. All rights reserved.
    </div>
  </div>
);
