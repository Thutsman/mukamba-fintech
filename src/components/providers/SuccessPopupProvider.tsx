'use client';

import * as React from 'react';
import { useAuthStore } from '@/lib/store';
import { SuccessPopup } from '@/components/ui/SuccessPopup';

export const SuccessPopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showSuccessPopup, successPopupData, handleSuccessPopupClose } = useAuthStore();

  return (
    <>
      {children}
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        email={successPopupData?.email}
        title={successPopupData?.title}
        message={successPopupData?.message}
        showSpamGuidance={true}
        autoCloseDelay={0}
      />
    </>
  );
};
