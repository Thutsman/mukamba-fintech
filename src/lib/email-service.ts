import { Resend } from 'resend';
import { render } from '@react-email/render';
import * as React from 'react';
import { ConfirmationEmailTemplate } from './email-templates/confirmation-email';
import { PasswordResetEmailTemplate } from './email-templates/password-reset-email';

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM = 'Mukamba Gateway <noreply@mukambagateway.com>';

export type SendEmailResult =
  | { success: true; data: unknown }
  | { success: false; error: string };

export async function sendEmail(params: {
  to: string[];
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const to = (params.to || []).map((e) => e?.trim()).filter(Boolean);
  if (to.length === 0) {
    return { success: false, error: 'No recipients provided' };
  }
  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject: params.subject,
      html: params.html,
    });
    return { success: true, data };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Transactional email sending failed:', error);
    return { success: false, error: msg };
  }
}

export async function sendConfirmationEmail(
  email: string,
  firstName: string,
  confirmationToken: string
) {
  const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?token=${confirmationToken}`;

  try {
    const emailHtml = await render(
      React.createElement(ConfirmationEmailTemplate, { firstName, confirmationUrl })
    );

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [email],
      subject: 'Confirm your Mukamba Gateway account',
      html: emailHtml,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetToken: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

  try {
    const emailHtml = await render(
      React.createElement(PasswordResetEmailTemplate, { firstName, resetUrl })
    );

    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [email],
      subject: 'Reset your Mukamba Gateway password',
      html: emailHtml,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Password reset email sending failed:', error);
    return { success: false, error };
  }
}

