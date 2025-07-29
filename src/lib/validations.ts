import { z } from 'zod';

// Helper functions for ID validation
export const validateSAID = (id: string): boolean => {
  if (id.length !== 13) return false;
  const digits = id.split('').map(Number);
  
  // Luhn algorithm for SA ID validation
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = digits[i];
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit = digit - 9;
    }
    sum += digit;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[12];
};

export const validateZimID = (id: string): boolean => {
  // Zimbabwean ID validation - supports both formats:
  // Format 1: XX-XXXXXX-X-XX (older format)
  // Format 2: XX-XXXXXXX-X-XX (newer format)
  const zimPattern1 = /^\d{2}-\d{6}-[A-Z]-\d{2}$/;  // XX-XXXXXX-X-XX
  const zimPattern2 = /^\d{2}-\d{7}-[A-Z]-\d{2}$/;  // XX-XXXXXXX-X-XX
  return zimPattern1.test(id) || zimPattern2.test(id);
};

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Step 1: Personal Information
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\+?[\d\s-()]{10,}$/, "Please enter a valid phone number"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  role: z.enum(['tenant', 'landlord']).refine((val) => val !== undefined, {
    message: "Please select your role"
  })
});

// Step 2: Verification
export const verificationSchema = z.object({
  idNumber: z.string()
    .min(1, "ID number is required")
    .refine((id) => validateSAID(id) || validateZimID(id), {
      message: "Please enter a valid South African or Zimbabwean ID number"
    }),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const age = calculateAge(date);
      return age >= 18 && age <= 80;
    }, {
      message: "You must be between 18 and 80 years old"
    }),
  nationality: z.enum(['SA', 'ZIM']).refine((val) => val !== undefined, {
    message: "Please select your nationality"
  })
});

// Step 3: Financial Assessment
export const financialAssessmentSchema = z.object({
  monthlyIncome: z.number()
    .min(1, "Monthly income is required")
    .refine((income) => income >= 5000, {
      message: "Minimum income requirement: R5,000 (SA) / $300 (ZIM)"
    }),
  employmentStatus: z.string().min(1, "Employment status is required"),
  bankName: z.string().min(1, "Bank name is required"),
  creditConsent: z.boolean().refine((consent) => consent === true, {
    message: "Credit consent is required to proceed"
  })
});

// Step 4: KYC Documents
export const kycDocumentsSchema = z.object({
  idDocument: z.instanceof(File, { message: "ID document is required" })
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine((file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), 
      "File must be JPEG, PNG, or PDF"),
  proofOfIncome: z.instanceof(File, { message: "Proof of income is required" })
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine((file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), 
      "File must be JPEG, PNG, or PDF"),
  bankStatement: z.instanceof(File, { message: "Bank statement is required" })
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine((file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), 
      "File must be JPEG, PNG, or PDF")
});

// Login validation
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

// Property Portfolio Schema (for landlords)
export const propertyPortfolioSchema = z.object({
  businessRegistered: z.boolean().optional(),
  businessName: z.string().optional(),
  businessRegistrationNumber: z.string().optional(),
  taxNumber: z.string().min(1, "Tax number is required"),
  properties: z.array(z.object({
    id: z.string(),
    address: z.string().min(5, "Please enter a valid address"),
    propertyType: z.enum(['residential', 'commercial', 'mixed']),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    size: z.number().min(1, "Property size is required"),
    estimatedValue: z.number().min(1000, "Please enter a valid property value"),
    currentStatus: z.enum(['vacant', 'rented', 'owner-occupied']),
    monthlyRental: z.number().optional(),
    description: z.string().min(10, "Please provide a brief description")
  })).min(1, "Please add at least one property")
});

// Property Documents Schema (for landlords)
export const propertyDocumentsSchema = z.object({
  idDocument: z.any().refine((file) => file != null, "ID document is required"),
  titleDeeds: z.array(z.any()).min(1, "At least one title deed is required"),
  propertyTaxCertificates: z.array(z.any()).min(1, "Property tax certificates are required"),
  municipalRatesCertificates: z.array(z.any()).min(1, "Municipal rates certificates are required"),
  propertyInsurance: z.array(z.any()).min(1, "Property insurance documents are required"),
  complianceCertificates: z.array(z.any()).optional(),
  businessRegistrationDoc: z.any().optional(),
  taxClearanceCertificate: z.any().optional()
});

// Combined registration schema
export const getStepSchema = (step: string) => {
  switch (step) {
    case 'personal-info':
      return personalInfoSchema;
    case 'verification':
      return verificationSchema;
    case 'financial-assessment':
      return financialAssessmentSchema;
    case 'kyc-documents':
      return kycDocumentsSchema;
    case 'property-portfolio':
      return propertyPortfolioSchema;
    case 'property-documents':
      return propertyDocumentsSchema;
    default:
      return z.object({});
  }
}; 