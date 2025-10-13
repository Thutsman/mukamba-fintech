import { Resend } from 'resend';
import { render } from '@react-email/render';
import * as React from 'react';
import { ConfirmationEmailTemplate } from './email-templates/confirmation-email';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      from: 'Mukamba Gateway <onboarding@resend.dev>', // Use your domain when verified
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

