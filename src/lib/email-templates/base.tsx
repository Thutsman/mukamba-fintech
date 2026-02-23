import * as React from 'react';

export type EmailCta = {
  label: string;
  url: string;
};

export function EmailLayout(props: {
  title?: string;
  children: React.ReactNode;
  footerText?: string;
}) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#7F1518', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ color: 'white', margin: 0, fontSize: 22, fontWeight: 700 }}>
          Mukamba Gateway
        </div>
        {props.title ? (
          <div style={{ color: 'white', marginTop: 8, fontSize: 14, opacity: 0.95 }}>{props.title}</div>
        ) : null}
      </div>
      <div style={{ padding: '32px 20px', backgroundColor: '#f9f9f9' }}>
        {props.children}
      </div>
      <div style={{ padding: '18px 20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
        {props.footerText || `© ${new Date().getFullYear()} Mukamba Gateway. All rights reserved.`}
      </div>
    </div>
  );
}

export function EmailButton(props: EmailCta) {
  return (
    <div style={{ textAlign: 'center', margin: '26px 0' }}>
      <a
        href={props.url}
        style={{
          backgroundColor: '#7F1518',
          color: 'white',
          padding: '12px 26px',
          textDecoration: 'none',
          borderRadius: '6px',
          display: 'inline-block',
          fontWeight: 700,
        }}
      >
        {props.label}
      </a>
    </div>
  );
}

