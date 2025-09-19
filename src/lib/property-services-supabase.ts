import { createClient } from '@supabase/supabase-js';
import { PropertyListing } from '@/types/property';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client only if credentials are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface SupabaseProperty {
  id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  country: string;
  city: string;
  suburb: string;
  street_address: string;
  size_sqm: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  price: number;
  currency: string;
  rent_to_buy_deposit?: number;
  monthly_installment?: number;
  payment_duration?: number;
  features: string[];
  amenities: string[];
  status: 'draft' | 'pending' | 'active' | 'under_offer' | 'sold' | 'rented';
  created_at: string;
  updated_at: string;
}

// New function to upload images to Supabase storage
const uploadImagesToSupabase = async (imageFiles: File[]): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  if (!supabase) {
    console.log('Supabase client not available, returning mock URLs');
    return imageFiles.map((_, i) => `https://picsum.photos/seed/mock-${i}/400/300`);
  }
  
  console.log(`Starting upload of ${imageFiles.length} images to Supabase storage...`);
  
  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i];
    
    if (imageFile instanceof File) {
      try {
        console.log(`Processing image ${i + 1}:`, {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        });
        
        // Generate a unique filename
        const fileExtension = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `property-images/${Date.now()}-${i}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        
        console.log(`Uploading to path: ${fileName}`);
        
        // Upload File object directly to Supabase storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error(`Error uploading image ${i + 1}:`, error);
          console.error('Error details:', {
            message: error.message,
            details: error
          });
          continue;
        }

        console.log(`Successfully uploaded image ${i + 1}:`, data);

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
        console.log(`Image ${i + 1} public URL:`, urlData.publicUrl);
      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, error);
        console.error('Full error details:', {
          error,
          stack: error instanceof Error ? error.stack : 'No stack trace',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        continue;
      }
    } else {
      console.warn(`Skipping non-File object at index ${i}:`, imageFile);
    }
  }
  
  console.log(`Upload complete. Total images uploaded: ${uploadedUrls.length}`);
  console.log('Uploaded URLs:', uploadedUrls);
  return uploadedUrls;
};

export const getPropertiesFromSupabase = async (): Promise<PropertyListing[]> => {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning empty array');
      return [];
    }

    // First, get all properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return [];
    }

    console.log('Successfully fetched properties:', properties?.length || 0);
    console.log('Property statuses:', properties?.map(p => ({ id: p.id, status: p.status })));

    // Get all property media for the fetched properties
    const propertyIds = (properties || []).map(prop => prop.id);
    let propertyMedia: any[] = [];
    
    console.log('Fetching media for properties:', propertyIds);
    
    if (propertyIds.length > 0) {
      // First, let's test if we can access the property_images table at all
      const { data: testMedia, error: testError } = await supabase
        .from('property_images')
        .select('count')
        .limit(1);

      if (testError) {
        console.error('Cannot access property_images table at all:', testError);
        console.error('This suggests an RLS policy issue');
      } else {
        console.log('Can access property_images table, proceeding with query');
      }

      const { data: mediaData, error: mediaError } = await supabase
        .from('property_images')
        .select('*')
        .in('property_id', propertyIds)
        .order('image_order', { ascending: true });

      if (mediaError) {
        console.error('Error fetching property media:', mediaError);
        console.error('Media error details:', {
          message: mediaError.message,
          details: mediaError.details,
          hint: mediaError.hint
        });
      } else {
        propertyMedia = mediaData || [];
        console.log('Successfully fetched media records:', propertyMedia.length);
      }
    }

    // Transform Supabase data to PropertyListing format
    return (properties || []).map((prop: SupabaseProperty): PropertyListing => {
      // Find media for this property
      const propertyImages = propertyMedia
        .filter(media => media.property_id === prop.id)
        .sort((a, b) => (a.image_order || 0) - (b.image_order || 0));
      
      const mainImage = propertyImages.find(media => media.is_main_image)?.image_url || '/placeholder-property.jpg';
      const allImages = propertyImages.length > 0 
        ? propertyImages.map(media => media.image_url)
        : ['/placeholder-property.jpg'];

      return {
        id: prop.id,
        title: prop.title,
        description: prop.description,
        propertyType: prop.property_type as any,
        listingType: prop.listing_type as any,
        location: {
          country: prop.country as any,
          city: prop.city,
          suburb: prop.suburb,
          streetAddress: prop.street_address || '',
        },
        details: {
          size: prop.size_sqm,
          type: prop.property_type as any,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          features: prop.features || [],
          amenities: prop.amenities || [],
        },
        financials: {
          price: prop.price,
          currency: prop.currency as any,
        },
        media: {
          mainImage,
          images: allImages,
        },
        seller: {
          id: 'default-seller',
          name: 'Property Owner',
          isVerified: true,
          contactInfo: {
            phone: '',
            email: '',
          },
        },
        status: (prop.status || 'active') as PropertyListing['status'],
        createdAt: new Date(prop.created_at),
        updatedAt: new Date(prop.updated_at),
        views: 0,
        savedBy: 0,
        inquiries: 0,
      };
    });
  } catch (error) {
    console.error('Error in getPropertiesFromSupabase:', error);
    return [];
  }
};

export const createPropertyInSupabase = async (propertyData: any, imageFiles: File[]): Promise<{ propertyId: string; imageUrls: string[] } | null> => {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning mock data');
      return {
        propertyId: 'mock-property-id',
        imageUrls: imageFiles.map((_, i) => `https://picsum.photos/seed/mock-${i}/400/300`)
      };
    }

    // First, upload images to Supabase storage
    const imageUrls = await uploadImagesToSupabase(imageFiles);
    
    if (imageUrls.length === 0) {
      console.error('No images were uploaded successfully');
      return null;
    }
    
    // Since we're a middleman platform, we'll set seller_id to NULL
    // This avoids the need to create admin users in user_profiles table
    const sellerId = null; // Set to null for middleman platform
    console.log('Using seller_id as null for middleman platform');
    
    // Create the property in the database
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        seller_id: sellerId,
        title: propertyData.title,
        description: propertyData.description,
        property_type: propertyData.propertyType,
        listing_type: propertyData.listingType,
        country: propertyData.location.country,
        city: propertyData.location.city,
        suburb: propertyData.location.suburb,
        street_address: propertyData.location.streetAddress || '',
        size_sqm: propertyData.details.size,
        bedrooms: propertyData.details.bedrooms,
        bathrooms: propertyData.details.bathrooms,
        price: propertyData.financials.price,
        currency: propertyData.financials.currency,
        rent_to_buy_deposit: propertyData.financials.rentToBuyDeposit,
        monthly_installment: propertyData.financials.monthlyInstallment,
        payment_duration: propertyData.financials.paymentDuration,
        features: propertyData.details.features || [],
        amenities: propertyData.details.amenities || [],
        status: 'active'
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating property:', error);
      console.error('Property data that failed to insert:', {
        seller_id: sellerId,
        title: propertyData.title,
        property_type: propertyData.propertyType,
        listing_type: propertyData.listingType,
        country: propertyData.location.country,
        city: propertyData.location.city,
        suburb: propertyData.location.suburb,
        street_address: propertyData.location.streetAddress || '',
        size_sqm: propertyData.details.size,
        bedrooms: propertyData.details.bedrooms,
        bathrooms: propertyData.details.bathrooms,
        price: propertyData.financials.price,
        currency: propertyData.financials.currency,
        rent_to_buy_deposit: propertyData.financials.rentToBuyDeposit,
        monthly_installment: propertyData.financials.monthlyInstallment,
        payment_duration: propertyData.financials.paymentDuration,
        status: 'active'
      });
      return null;
    }

    const propertyId = data.id;

            // Now insert the images into the property_images table
    if (imageUrls.length > 0) {
      console.log('Preparing to insert media records for property:', propertyId);
      console.log('Image URLs to insert:', imageUrls);
      
      const mediaRecords = imageUrls.map((url, index) => ({
        property_id: propertyId,
        image_url: url,
        image_order: index,
        is_main_image: index === 0 // First image is the main image
      }));

      console.log('Media records to insert:', mediaRecords);

      const { error: mediaError } = await supabase
        .from('property_images')
        .insert(mediaRecords);

      if (mediaError) {
        console.error('Error inserting property media:', mediaError);
        console.error('Media error details:', {
          message: mediaError.message,
          details: mediaError.details,
          hint: mediaError.hint
        });
        console.error('Media records that failed to insert:', mediaRecords);
        // Don't fail the entire operation, just log the error
      } else {
        console.log('Successfully inserted media records for property:', propertyId);
        console.log('Inserted media count:', mediaRecords.length);
      }
    }

    console.log('Property creation completed successfully');
    console.log('Final result:', { propertyId, imageUrls });
    return { propertyId, imageUrls };
  } catch (error) {
    console.error('Error in createPropertyInSupabase:', error);
    return null;
  }
};

export const getPropertyByIdFromSupabase = async (propertyId: string): Promise<PropertyListing | null> => {
  try {
    if (!supabase) {
      console.log('Supabase client not available, returning null');
      return null;
    }

    console.log('Fetching property by ID:', propertyId);
    
    // Get the specific property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyError) {
      console.error('Error fetching property:', propertyError);
      return null;
    }

    if (!property) {
      console.log('Property not found with ID:', propertyId);
      return null;
    }

    console.log('Found property:', property.title);

    // Get media for this property
    const { data: mediaData, error: mediaError } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .order('image_order', { ascending: true });

    if (mediaError) {
      console.error('Error fetching property media:', mediaError);
    }

    const propertyImages = mediaData || [];
    const mainImage = propertyImages.find(media => media.is_main_image)?.image_url || '/placeholder-property.jpg';
    const allImages = propertyImages.length > 0 
      ? propertyImages.map(media => media.image_url)
      : ['/placeholder-property.jpg'];

    // Transform to PropertyListing format
    const propertyListing: PropertyListing = {
      id: property.id,
      title: property.title,
      description: property.description,
      propertyType: property.property_type as any,
      listingType: property.listing_type as any,
      location: {
        country: property.country as any,
        city: property.city,
        suburb: property.suburb,
        streetAddress: property.street_address || '',
      },
              details: {
          size: property.size_sqm,
          type: property.property_type as any,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          features: property.features || [],
          amenities: property.amenities || [],
        },
      financials: {
        price: property.price,
        currency: property.currency as any,
        rentToBuyDeposit: property.rent_to_buy_deposit,
        monthlyInstallment: property.monthly_installment,
        paymentDuration: property.payment_duration,
      },
      media: {
        mainImage,
        images: allImages,
      },
      seller: {
        id: 'default-seller',
        name: 'Property Owner',
        isVerified: true,
        contactInfo: {
          phone: '',
          email: '',
        },
      },
      status: (property.status || 'active') as PropertyListing['status'],
      createdAt: new Date(property.created_at),
      updatedAt: new Date(property.updated_at),
      views: property.views || 0,
      savedBy: property.saved_by || 0,
      inquiries: property.inquiries || 0,
    };

    console.log('Successfully transformed property to PropertyListing format');
    return propertyListing;
  } catch (error) {
    console.error('Error in getPropertyByIdFromSupabase:', error);
    return null;
  }
};
