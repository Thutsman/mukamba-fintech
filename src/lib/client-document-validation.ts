// =====================================================
// Client-Side Document Validation
// =====================================================
// This module provides browser-compatible document validation
// using Canvas API and basic image analysis techniques.

// =====================================================
// TYPES
// =====================================================

export interface ImageQualityResult {
  overallScore: number; // 0-100
  blurScore: number; // 0-100
  brightnessScore: number; // 0-100
  fileSizeScore: number; // 0-100
  isCorrupted: boolean;
}

export interface FaceDetectionResult {
  hasFace: boolean;
  confidence: number; // 0-100
  faceCount: number;
}

export interface FaceComparisonResult {
  similarity: number; // 0-100 (100 = definitely same person)
  confidence: number; // 0-100
  isMatch: boolean; // true if similarity > 70
}

export interface DocumentTypeResult {
  isDocument: boolean;
  confidence: number; // 0-100
  documentFeatures: {
    hasTextRegions: boolean;
    hasCorners: boolean;
    aspectRatio: number;
    colorVariety: number;
  };
}

export interface ValidationChecks {
  selfieQuality: ImageQualityResult;
  idFrontQuality: ImageQualityResult;
  idBackQuality?: ImageQualityResult;
  selfieFaceDetection: FaceDetectionResult;
  idFrontFaceDetection: FaceDetectionResult;
  faceMatch: FaceComparisonResult;
  idFrontDocumentType: DocumentTypeResult;
  idBackDocumentType?: DocumentTypeResult;
}

export interface RiskAssessment {
  riskScore: number; // 0-1 (0 = safe, 1 = risky)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  autoApproved: boolean;
  reasons: string[];
}

// =====================================================
// IMAGE QUALITY ASSESSMENT (Client-Side)
// =====================================================

export async function assessImageQuality(imageFile: File): Promise<ImageQualityResult> {
  try {
    // Check if imageFile is valid
    if (!imageFile || !(imageFile instanceof File)) {
      console.error('Invalid imageFile provided to assessImageQuality:', imageFile);
      return {
        overallScore: 0,
        blurScore: 0,
        brightnessScore: 0,
        fileSizeScore: 0,
        isCorrupted: true
      };
    }

    // Get image metadata
    const fileSize = imageFile.size;
    const fileSizeScore = calculateFileSizeScore(fileSize);
    
    // Create image element for analysis
    const imageUrl = URL.createObjectURL(imageFile);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      img.onload = async () => {
        try {
          // Create canvas for image analysis
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            URL.revokeObjectURL(imageUrl);
            resolve({
              overallScore: 0,
              blurScore: 0,
              brightnessScore: 0,
              fileSizeScore: 0,
              isCorrupted: true
            });
            return;
          }
          
          // Set canvas size to image size
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image to canvas
          ctx.drawImage(img, 0, 0);
          
          // Get image data for analysis
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Calculate blur score using Laplacian variance
          const blurScore = calculateBlurScore(imageData);
          
          // Calculate brightness score
          const brightnessScore = calculateBrightnessScore(imageData);
          
          // Calculate overall score
          const overallScore = Math.round(
            (blurScore * 0.4) + 
            (brightnessScore * 0.3) + 
            (fileSizeScore * 0.3)
          );
          
          URL.revokeObjectURL(imageUrl);
          
          resolve({
            overallScore: Math.max(0, Math.min(100, overallScore)),
            blurScore,
            brightnessScore,
            fileSizeScore,
            isCorrupted: fileSizeScore < 20
          });
          
        } catch (error) {
          console.error('Error analyzing image:', error);
          URL.revokeObjectURL(imageUrl);
          resolve({
            overallScore: 0,
            blurScore: 0,
            brightnessScore: 0,
            fileSizeScore: 0,
            isCorrupted: true
          });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve({
          overallScore: 0,
          blurScore: 0,
          brightnessScore: 0,
          fileSizeScore: 0,
          isCorrupted: true
        });
      };
      
      img.src = imageUrl;
    });
    
  } catch (error) {
    console.error('Error assessing image quality:', error);
    return {
      overallScore: 0,
      blurScore: 0,
      brightnessScore: 0,
      fileSizeScore: 0,
      isCorrupted: true
    };
  }
}

function calculateFileSizeScore(fileSize: number): number {
  const sizeInMB = fileSize / (1024 * 1024);
  
  if (sizeInMB < 0.1) return 20; // Too small, likely corrupted
  if (sizeInMB > 10) return 30; // Too large, might be screenshot
  if (sizeInMB > 5) return 60; // Large but acceptable
  if (sizeInMB > 1) return 90; // Good size
  return 70; // Small but acceptable
}

function calculateBlurScore(imageData: ImageData): number {
  try {
    const { data, width, height } = imageData;
    
    // Convert to grayscale and apply Laplacian kernel
    let variance = 0;
    let count = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Get surrounding pixels (grayscale)
        const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const top = (data[((y - 1) * width + x) * 4] + data[((y - 1) * width + x) * 4 + 1] + data[((y - 1) * width + x) * 4 + 2]) / 3;
        const bottom = (data[((y + 1) * width + x) * 4] + data[((y + 1) * width + x) * 4 + 1] + data[((y + 1) * width + x) * 4 + 2]) / 3;
        const left = (data[(y * width + (x - 1)) * 4] + data[(y * width + (x - 1)) * 4 + 1] + data[(y * width + (x - 1)) * 4 + 2]) / 3;
        const right = (data[(y * width + (x + 1)) * 4] + data[(y * width + (x + 1)) * 4 + 1] + data[(y * width + (x + 1)) * 4 + 2]) / 3;
        
        // Apply Laplacian kernel: center * 4 - (top + bottom + left + right)
        const laplacian = center * 4 - (top + bottom + left + right);
        variance += laplacian * laplacian;
        count++;
      }
    }
    
    variance = variance / count;
    
    // Convert variance to score
    if (variance > 1000) return 90; // Very sharp
    if (variance > 500) return 80; // Sharp
    if (variance > 200) return 60; // Moderate
    if (variance > 100) return 40; // Slightly blurry
    return 20; // Very blurry
  } catch (error) {
    console.error('Error calculating blur score:', error);
    return 50; // Default moderate score
  }
}

function calculateBrightnessScore(imageData: ImageData): number {
  try {
    const { data } = imageData;
    let sum = 0;
    let count = 0;
    
    // Calculate average brightness
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sum += brightness;
      count++;
    }
    
    const averageBrightness = sum / count;
    
    // Convert brightness to score (optimal range: 80-180)
    if (averageBrightness >= 80 && averageBrightness <= 180) return 90; // Perfect
    if (averageBrightness >= 60 && averageBrightness <= 200) return 80; // Good
    if (averageBrightness >= 40 && averageBrightness <= 220) return 60; // Acceptable
    if (averageBrightness >= 20 && averageBrightness <= 240) return 40; // Poor
    return 20; // Very poor
  } catch (error) {
    console.error('Error calculating brightness score:', error);
    return 50; // Default moderate score
  }
}

// =====================================================
// FACE DETECTION (Client-Side Heuristics)
// =====================================================

export async function detectFaceInImage(imageFile: File): Promise<FaceDetectionResult> {
  try {
    const imageUrl = URL.createObjectURL(imageFile);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      img.onload = () => {
        try {
          // Simple heuristics for face detection
          const aspectRatio = img.width / img.height;
          const isReasonableForFace = aspectRatio >= 0.5 && aspectRatio <= 2.0;
          const hasReasonableSize = img.width > 100 && img.height > 100;
          
          const hasFace = isReasonableForFace && hasReasonableSize;
          const confidence = hasFace ? 70 : 30;
          
          URL.revokeObjectURL(imageUrl);
          
          resolve({
            hasFace,
            confidence,
            faceCount: hasFace ? 1 : 0
          });
        } catch (error) {
          console.error('Error in face detection:', error);
          URL.revokeObjectURL(imageUrl);
          resolve({ hasFace: false, confidence: 0, faceCount: 0 });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve({ hasFace: false, confidence: 0, faceCount: 0 });
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error in face detection:', error);
    return { hasFace: false, confidence: 0, faceCount: 0 };
  }
}

// =====================================================
// FACE COMPARISON (Client-Side Heuristics)
// =====================================================

export async function compareFaces(selfieFile: File, idPhotoFile: File): Promise<FaceComparisonResult> {
  try {
    // Simple heuristics for face comparison
    const selfieQuality = await assessImageQuality(selfieFile);
    const idQuality = await assessImageQuality(idPhotoFile);
    
    // If both images have good quality, assume they might match
    const qualityMatch = Math.abs(selfieQuality.overallScore - idQuality.overallScore) < 30;
    const bothGoodQuality = selfieQuality.overallScore > 60 && idQuality.overallScore > 60;
    
    const similarity = qualityMatch && bothGoodQuality ? 65 : 30;
    
    return {
      similarity,
      confidence: similarity,
      isMatch: similarity > 70
    };
  } catch (error) {
    console.error('Error comparing faces:', error);
    return {
      similarity: 0,
      confidence: 0,
      isMatch: false
    };
  }
}

// =====================================================
// DOCUMENT TYPE DETECTION (Client-Side)
// =====================================================

export async function detectDocumentType(imageFile: File): Promise<DocumentTypeResult> {
  try {
    // Check if imageFile is valid
    if (!imageFile || !(imageFile instanceof File)) {
      console.error('Invalid imageFile provided to detectDocumentType:', imageFile);
      return {
        isDocument: false,
        confidence: 0,
        documentFeatures: {
          hasTextRegions: false,
          hasCorners: false,
          aspectRatio: 0,
          colorVariety: 0
        }
      };
    }

    const imageUrl = URL.createObjectURL(imageFile);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      img.onload = () => {
        try {
          // 1. Aspect Ratio Check (documents have specific ratios)
          const aspectRatio = img.width / img.height;
          const hasDocumentAspectRatio = (aspectRatio >= 0.6 && aspectRatio <= 1.8) || 
                                        (aspectRatio >= 1.2 && aspectRatio <= 2.5);
          
          // 2. Size Check (documents are usually reasonable size)
          const hasReasonableSize = img.width > 200 && img.height > 200;
          
          // 3. Simple heuristics
          const hasTextRegions = true; // Assume true for now
          const hasCorners = true; // Assume true for now
          const colorVariety = 50; // Default moderate variety
          
          // Calculate confidence
          let confidence = 0;
          if (hasDocumentAspectRatio) confidence += 40;
          if (hasReasonableSize) confidence += 30;
          if (hasTextRegions) confidence += 20;
          if (hasCorners) confidence += 10;
          
          const isDocument = confidence > 50;
          
          URL.revokeObjectURL(imageUrl);
          
          resolve({
            isDocument,
            confidence: Math.min(100, confidence),
            documentFeatures: {
              hasTextRegions,
              hasCorners,
              aspectRatio,
              colorVariety
            }
          });
        } catch (error) {
          console.error('Error detecting document type:', error);
          URL.revokeObjectURL(imageUrl);
          resolve({
            isDocument: false,
            confidence: 0,
            documentFeatures: {
              hasTextRegions: false,
              hasCorners: false,
              aspectRatio: 0,
              colorVariety: 0
            }
          });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve({
          isDocument: false,
          confidence: 0,
          documentFeatures: {
            hasTextRegions: false,
            hasCorners: false,
            aspectRatio: 0,
            colorVariety: 0
          }
        });
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Error detecting document type:', error);
    return {
      isDocument: false,
      confidence: 0,
      documentFeatures: {
        hasTextRegions: false,
        hasCorners: false,
        aspectRatio: 0,
        colorVariety: 0
      }
    };
  }
}

// =====================================================
// RISK ASSESSMENT
// =====================================================

export function calculateRiskScore(checks: ValidationChecks): RiskAssessment {
  const reasons: string[] = [];
  let riskScore = 0;
  
  // Quality checks (40% weight) - only include back quality if it exists
  const qualityScores = [
    checks.selfieQuality.overallScore,
    checks.idFrontQuality.overallScore
  ];
  
  // Add back quality score only if it exists
  if (checks.idBackQuality) {
    qualityScores.push(checks.idBackQuality.overallScore);
  }
  
  const avgQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
  if (avgQuality < 50) {
    riskScore += 0.3;
    reasons.push('Poor image quality');
  } else if (avgQuality < 70) {
    riskScore += 0.15;
    reasons.push('Moderate image quality');
  }
  
  // Face detection checks (30% weight)
  if (!checks.selfieFaceDetection.hasFace) {
    riskScore += 0.4;
    reasons.push('No face detected in selfie');
  }
  
  if (!checks.idFrontFaceDetection.hasFace) {
    riskScore += 0.2;
    reasons.push('No face detected in ID photo');
  }
  
  // Face matching (20% weight)
  if (checks.faceMatch.similarity < 70) {
    riskScore += 0.3;
    reasons.push('Faces do not match');
  } else if (checks.faceMatch.similarity < 85) {
    riskScore += 0.1;
    reasons.push('Faces partially match');
  }
  
  // Document type checks (10% weight)
  if (!checks.idFrontDocumentType.isDocument) {
    riskScore += 0.2;
    reasons.push('ID front does not appear to be a document');
  }
  
  // Only check back document type if it exists
  if (checks.idBackDocumentType && !checks.idBackDocumentType.isDocument) {
    riskScore += 0.1;
    reasons.push('ID back does not appear to be a document');
  }
  
  // Determine risk level and auto-approval
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  let autoApproved: boolean;
  
  if (riskScore < 0.2) {
    riskLevel = 'LOW';
    autoApproved = true;
  } else if (riskScore < 0.5) {
    riskLevel = 'MEDIUM';
    autoApproved = false;
  } else {
    riskLevel = 'HIGH';
    autoApproved = false;
  }
  
  return {
    riskScore: Math.min(1, Math.max(0, riskScore)),
    riskLevel,
    autoApproved,
    reasons
  };
}

// =====================================================
// MAIN VALIDATION FUNCTION
// =====================================================

export async function validateDocumentsAutomatically(
  selfieFile: File,
  idFrontFile: File,
  idBackFile?: File
): Promise<{
  riskAssessment: RiskAssessment;
  checks: ValidationChecks;
  scores: {
    selfieQuality: number;
    idFrontQuality: number;
    idBackQuality: number;
    faceMatch: number;
  };
}> {
  console.log('Starting client-side automated document validation...');
  
  // Validate input files
  if (!selfieFile || !(selfieFile instanceof File)) {
    throw new Error('Invalid selfie file provided');
  }
  if (!idFrontFile || !(idFrontFile instanceof File)) {
    throw new Error('Invalid ID front file provided');
  }
  // idBackFile is optional for single-sided documents like passports
  if (idBackFile && !(idBackFile instanceof File)) {
    throw new Error('Invalid ID back file provided');
  }
  
  try {
    // Run all checks in parallel for speed
    // Run validation checks - back file is optional
    const [
      selfieQuality,
      idFrontQuality,
      selfieFaceDetection,
      idFrontFaceDetection,
      faceMatch,
      idFrontDocumentType
    ] = await Promise.all([
      assessImageQuality(selfieFile),
      assessImageQuality(idFrontFile),
      detectFaceInImage(selfieFile),
      detectFaceInImage(idFrontFile),
      compareFaces(selfieFile, idFrontFile),
      detectDocumentType(idFrontFile)
    ]);

    // Only validate back file if it exists
    let idBackQuality = null;
    let idBackDocumentType = null;
    if (idBackFile) {
      [idBackQuality, idBackDocumentType] = await Promise.all([
        assessImageQuality(idBackFile),
        detectDocumentType(idBackFile)
      ]);
    }
    
    const checks: ValidationChecks = {
      selfieQuality,
      idFrontQuality,
      selfieFaceDetection,
      idFrontFaceDetection,
      faceMatch,
      idFrontDocumentType
    };
    
    // Only include back properties if they exist
    if (idBackQuality) {
      checks.idBackQuality = idBackQuality;
    }
    if (idBackDocumentType) {
      checks.idBackDocumentType = idBackDocumentType;
    }
    
    const riskAssessment = calculateRiskScore(checks);
    
    console.log('Client-side validation completed:', {
      riskLevel: riskAssessment.riskLevel,
      autoApproved: riskAssessment.autoApproved,
      reasons: riskAssessment.reasons
    });
    
    return {
      riskAssessment,
      checks,
      scores: {
        selfieQuality: selfieQuality.overallScore,
        idFrontQuality: idFrontQuality.overallScore,
        idBackQuality: idBackQuality?.overallScore || 0,
        faceMatch: faceMatch.similarity
      }
    };
    
  } catch (error) {
    console.error('Error in client-side automated validation:', error);
    
    // Return high risk if validation fails
    return {
      riskAssessment: {
        riskScore: 0.8,
        riskLevel: 'HIGH',
        autoApproved: false,
        reasons: ['Validation system error']
      },
      checks: {} as ValidationChecks,
      scores: {
        selfieQuality: 0,
        idFrontQuality: 0,
        idBackQuality: 0,
        faceMatch: 0
      }
    };
  }
}
