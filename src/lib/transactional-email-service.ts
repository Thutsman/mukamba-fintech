import 'server-only';

import { render } from '@react-email/render';
import * as React from 'react';
import { sendEmail, type SendEmailResult } from '@/lib/email-service';

export type TransactionalTemplateSendInput = {
  to: string[];
  subject: string;
  react: React.ReactElement;
  tags?: string[];
  metadata?: Record<string, string>;
};

export async function sendTransactionalTemplateEmail(
  input: TransactionalTemplateSendInput
): Promise<SendEmailResult> {
  const html = await render(input.react);
  return await sendEmail({
    to: input.to,
    subject: input.subject,
    html,
  });
}

export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error('Missing required env var: NEXT_PUBLIC_APP_URL');
  return url.replace(/\/+$/, '');
}

export function safePreview(text: string, maxLen = 220): string {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

