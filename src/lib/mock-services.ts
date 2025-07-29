import type { RegistrationData, CreditScoreData, OTPVerification } from '@/types/auth';
import { calculateAge, validateSAID, validateZimID } from './validations';

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ID Validation Service
export const idValidationService = {
  async validateID(idNumber: string, nationality: 'SA' | 'ZIM'): Promise<{
    isValid: boolean;
    details?: {
      dateOfBirth: string;
      gender: 'M' | 'F';
      citizenship: 'SA' | 'ZIM' | 'Foreign';
    };
    error?: string;
  }> {
    await delay(1500); // Simulate API call

    let isValid = false;
    let details;

    if (nationality === 'SA') {
      isValid = validateSAID(idNumber);
      if (isValid) {
        // Extract info from SA ID (YYMMDDGGGGSAZ)
        const year = parseInt(idNumber.substring(0, 2));
        const month = parseInt(idNumber.substring(2, 4));
        const day = parseInt(idNumber.substring(4, 6));
        const gender: 'M' | 'F' = parseInt(idNumber.substring(6, 10)) >= 5000 ? 'M' : 'F';
        const citizenship = parseInt(idNumber.substring(10, 11)) === 0 ? 'SA' : 'Foreign';
        
        const fullYear = year > 21 ? 1900 + year : 2000 + year;
        
        details = {
          dateOfBirth: `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
          gender,
          citizenship: citizenship as 'SA' | 'Foreign'
        };
      }
    } else {
      isValid = validateZimID(idNumber);
      if (isValid) {
        // Mock Zimbabwean ID details
        details = {
          dateOfBirth: '1990-01-01', // Mock date
          gender: Math.random() > 0.5 ? 'M' : 'F' as 'M' | 'F',
          citizenship: 'ZIM' as const
        };
      }
    }

    return {
      isValid,
      details,
      error: isValid ? undefined : 'Invalid ID number format'
    };
  }
};

// Credit Score Calculation Service
export const creditScoreService = {
  async calculateCreditScore(data: RegistrationData): Promise<CreditScoreData> {
    await delay(2000); // Simulate API call

    let score = 600; // Base score
    const factors = {
      income: 0,
      age: 0,
      employment: 0,
      random: 0
    };

    // Only calculate credit score for tenants
    if (data.role === 'tenant') {
      const tenantData = data as any; // Type assertion for tenant-specific properties

      // Income factor
      if (tenantData.monthlyIncome > 50000) {
        factors.income = 100;
      } else if (tenantData.monthlyIncome > 20000) {
        factors.income = 75;
      } else if (tenantData.monthlyIncome > 10000) {
        factors.income = 50;
      } else if (tenantData.monthlyIncome > 5000) {
        factors.income = 25;
      }

      // Employment stability
      if (tenantData.employmentStatus === 'permanent') {
        factors.employment = 75;
      } else if (tenantData.employmentStatus === 'contract') {
        factors.employment = 50;
      } else if (tenantData.employmentStatus === 'self-employed') {
        factors.employment = 40;
      } else {
        factors.employment = 20;
      }
    } else {
      // For landlords, base score on property portfolio value
      const landlordData = data as any;
      if (landlordData.properties && landlordData.properties.length > 0) {
        const totalValue = landlordData.properties.reduce((sum: number, prop: any) => sum + (prop.estimatedValue || 0), 0);
        if (totalValue > 5000000) {
          factors.income = 100;
        } else if (totalValue > 2000000) {
          factors.income = 75;
        } else if (totalValue > 1000000) {
          factors.income = 50;
        } else {
          factors.income = 25;
        }
        factors.employment = 60; // Property ownership provides stability
      }
    }

    // Age factor (calculated from DOB) - applies to both roles
    const age = calculateAge(data.dateOfBirth);
    if (age >= 25 && age <= 45) {
      factors.age = 75;
    } else if (age >= 18 && age <= 65) {
      factors.age = 50;
    } else {
      factors.age = 25;
    }

    // Random factor for realism
    factors.random = Math.floor(Math.random() * 50);

    // Calculate final score
    const finalScore = Math.min(850, score + factors.income + factors.age + factors.employment + factors.random);

    // Determine rating
    let rating: CreditScoreData['rating'];
    if (finalScore >= 800) rating = 'Excellent';
    else if (finalScore >= 740) rating = 'Very Good';
    else if (finalScore >= 670) rating = 'Good';
    else if (finalScore >= 580) rating = 'Fair';
    else rating = 'Poor';

    return {
      score: finalScore,
      factors,
      rating
    };
  }
};

// Document Processing Service
export const documentService = {
  async processDocument(file: File, documentType: 'id' | 'income' | 'bank'): Promise<{
    success: boolean;
    confidence: number;
    extractedData?: any;
    error?: string;
  }> {
    await delay(3000); // Simulate processing time

    // Mock success rate (90% success)
    const success = Math.random() > 0.1;
    const confidence = success ? Math.random() * 0.3 + 0.7 : Math.random() * 0.5; // 70-100% or 0-50%

    if (!success) {
      return {
        success: false,
        confidence,
        error: 'Document quality too low or unreadable'
      };
    }

    // Mock extracted data based on document type
    let extractedData;
    switch (documentType) {
      case 'id':
        extractedData = {
          idNumber: '9001011234567',
          fullName: 'John Doe',
          dateOfBirth: '1990-01-01'
        };
        break;
      case 'income':
        extractedData = {
          monthlyIncome: Math.floor(Math.random() * 50000) + 10000,
          employer: 'ABC Company',
          position: 'Software Developer'
        };
        break;
      case 'bank':
        extractedData = {
          accountNumber: '1234567890',
          bankName: 'Standard Bank',
          balance: Math.floor(Math.random() * 100000) + 5000
        };
        break;
    }

    return {
      success: true,
      confidence,
      extractedData
    };
  }
};

// OTP Verification Service
export const otpService = {
  async sendOTP(phone: string, email: string, type: 'phone' | 'email'): Promise<{
    success: boolean;
    otpId: string;
    expiresIn: number; // seconds
    error?: string;
  }> {
    await delay(1000);

    // Mock 95% success rate
    const success = Math.random() > 0.05;

    if (!success) {
      return {
        success: false,
        otpId: '',
        expiresIn: 0,
        error: `Failed to send OTP to ${type}`
      };
    }

    return {
      success: true,
      otpId: Math.random().toString(36).substring(2, 15),
      expiresIn: 300 // 5 minutes
    };
  },

  async verifyOTP(otpId: string, code: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    await delay(500);

    // Mock verification - accept any 6-digit code
    const isValidFormat = /^\d{6}$/.test(code);
    
    if (!isValidFormat) {
      return {
        success: false,
        error: 'Invalid OTP format'
      };
    }

    // Mock 90% success rate for valid format
    const success = Math.random() > 0.1;

    return {
      success,
      error: success ? undefined : 'Invalid or expired OTP'
    };
  }
};

// Bank Verification Service
export const bankVerificationService = {
  async verifyBankAccount(accountNumber: string, bankName: string): Promise<{
    success: boolean;
    accountDetails?: {
      accountHolder: string;
      accountType: string;
      isActive: boolean;
    };
    error?: string;
  }> {
    await delay(2500);

    // Mock 85% success rate
    const success = Math.random() > 0.15;

    if (!success) {
      return {
        success: false,
        error: 'Unable to verify bank account details'
      };
    }

    return {
      success: true,
      accountDetails: {
        accountHolder: 'John Doe',
        accountType: 'Savings',
        isActive: true
      }
    };
  }
};

// Biometric Verification Service (Mock)
export const biometricService = {
  async captureBiometric(): Promise<{
    success: boolean;
    confidence: number;
    livenessScore: number;
    error?: string;
  }> {
    await delay(4000); // Simulate capture and processing

    const success = Math.random() > 0.1; // 90% success rate
    const confidence = success ? Math.random() * 0.2 + 0.8 : Math.random() * 0.6; // 80-100% or 0-60%
    const livenessScore = success ? Math.random() * 0.3 + 0.7 : Math.random() * 0.5; // 70-100% or 0-50%

    return {
      success,
      confidence,
      livenessScore,
      error: success ? undefined : 'Biometric capture failed. Please ensure good lighting and face the camera directly.'
    };
  }
}; 