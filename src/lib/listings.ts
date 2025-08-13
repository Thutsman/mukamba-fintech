export const createListing = async (listingData: any) => {
  console.log('Creating listing:', listingData);
  // Mock database insert
  return { id: Date.now(), ...listingData, status: 'pending' } as any;
};

export const updateListingStatus = async (id: string | number, status: string) => {
  console.log(`Updating listing ${id} to ${status}`);
  // Mock update
  return { success: true };
};


