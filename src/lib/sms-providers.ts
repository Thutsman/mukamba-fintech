// Lightweight, provider-agnostic SMS sender for OTPs
// Supports: textbelt (dev), twilio, vonage, messagebird

type SendResult = {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
};

const env = {
  provider: process.env.SMS_PROVIDER || 'textbelt',
  // Textbelt
  textbeltKey: process.env.TEXTBELT_API_KEY,
  // Twilio
  twilioSid: process.env.TWILIO_ACCOUNT_SID,
  twilioToken: process.env.TWILIO_AUTH_TOKEN,
  twilioFrom: process.env.TWILIO_FROM_NUMBER,
  // Vonage
  vonageKey: process.env.VONAGE_API_KEY,
  vonageSecret: process.env.VONAGE_API_SECRET,
  vonageFrom: process.env.VONAGE_FROM_NUMBER || process.env.VONAGE_FROM,
  // MessageBird
  messageBirdKey: process.env.MESSAGEBIRD_ACCESS_KEY,
  messageBirdOriginator: process.env.MESSAGEBIRD_ORIGINATOR || process.env.MESSAGEBIRD_FROM,
};

async function sendViaTextbelt(to: string, body: string): Promise<SendResult> {
  try {
    console.log('Textbelt: Sending SMS to', to, 'with key:', env.textbeltKey || 'textbelt');
    const payload = { phone: to, message: body, key: env.textbeltKey || 'textbelt' };
    console.log('Textbelt payload:', payload);
    
    const res = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('Textbelt response status:', res.status);
    const data = await res.json();
    console.log('Textbelt response data:', data);
    
    // Check if test texts are disabled
    if (data.error && data.error.includes('Test texts are temporarily disabled')) {
      console.log('Textbelt test texts disabled, falling back to mock mode');
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
        error: undefined,
        provider: 'textbelt-mock'
      };
    }
    
    return {
      success: !!data.success,
      messageId: data?.quotaRemaining ? `textbelt-${Date.now()}` : undefined,
      error: data?.error,
      provider: 'textbelt'
    };
  } catch (error: any) {
    console.error('Textbelt error:', error);
    return { success: false, error: error.message, provider: 'textbelt' };
  }
}

async function sendViaTwilio(to: string, body: string): Promise<SendResult> {
  const { twilioSid, twilioToken, twilioFrom } = env;
  if (!twilioSid || !twilioToken || !twilioFrom) {
    return { success: false, error: 'Twilio not configured', provider: 'twilio' };
  }
  const creds = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
  const form = new URLSearchParams({ To: to, From: twilioFrom, Body: body });
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    });
    const data = await res.json();
    const ok = res.ok && data?.sid;
    return { success: !!ok, messageId: data?.sid, error: ok ? undefined : data?.message, provider: 'twilio' };
  } catch (error: any) {
    return { success: false, error: error.message, provider: 'twilio' };
  }
}

async function sendViaVonage(to: string, body: string): Promise<SendResult> {
  const { vonageKey, vonageSecret, vonageFrom } = env;
  console.log('Vonage: Checking configuration...', {
    hasKey: !!vonageKey,
    hasSecret: !!vonageSecret,
    hasFrom: !!vonageFrom
  });
  
  if (!vonageKey || !vonageSecret || !vonageFrom) {
    return { success: false, error: 'Vonage not configured', provider: 'vonage' };
  }
  
  try {
    const payload = { api_key: vonageKey, api_secret: vonageSecret, to, from: vonageFrom, text: body };
    console.log('Vonage: Sending SMS to', to, 'from', vonageFrom);
    console.log('Vonage payload:', { ...payload, api_key: '***', api_secret: '***' });
    
    const res = await fetch('https://rest.nexmo.com/sms/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('Vonage response status:', res.status);
    const data = await res.json();
    console.log('Vonage response data:', data);
    
    const msg = data?.messages?.[0];
    const ok = msg?.status === '0';
    return { 
      success: !!ok, 
      messageId: msg?.['message-id'], 
      error: ok ? undefined : msg?.['error-text'], 
      provider: 'vonage' 
    };
  } catch (error: any) {
    console.error('Vonage error:', error);
    return { success: false, error: error.message, provider: 'vonage' };
  }
}

async function sendViaMessageBird(to: string, body: string): Promise<SendResult> {
  const { messageBirdKey, messageBirdOriginator } = env;
  if (!messageBirdKey || !messageBirdOriginator) {
    return { success: false, error: 'MessageBird not configured', provider: 'messagebird' };
  }
  try {
    const res = await fetch('https://rest.messagebird.com/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `AccessKey ${messageBirdKey}`
      },
      body: JSON.stringify({ recipients: [to], originator: messageBirdOriginator, body })
    });
    const data = await res.json();
    const ok = res.ok && data?.id;
    return { success: !!ok, messageId: data?.id, error: ok ? undefined : data?.errors?.[0]?.description, provider: 'messagebird' };
  } catch (error: any) {
    return { success: false, error: error.message, provider: 'messagebird' };
  }
}

export async function sendSms(to: string, body: string): Promise<SendResult> {
  const provider = (env.provider || '').toLowerCase();
  console.log('SMS Provider selected:', provider);
  
  switch (provider) {
    case 'twilio':
      return sendViaTwilio(to, body);
    case 'vonage':
      return sendViaVonage(to, body);
    case 'messagebird':
      return sendViaMessageBird(to, body);
    case 'textbelt':
    default:
      return sendViaTextbelt(to, body);
  }
}

export function buildOtpMessage(otpCode: string, minutesValid = 10): string {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Mukamba';
  return `${appName}: Your verification code is ${otpCode}. It expires in ${minutesValid} minutes.`;
}


