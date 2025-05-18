
'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// Dynamically import the CookieConsentPopup component
const DynamicCookieConsentPopup: ComponentType = dynamic(() =>
  import('@/components/cookie-consent-popup').then(mod => mod.CookieConsentPopup),
  { ssr: false }
);

export default function ClientCookieConsentWrapper() {
  return <DynamicCookieConsentPopup />;
}
