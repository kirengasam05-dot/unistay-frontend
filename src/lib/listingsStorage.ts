export type Listing = {
  id: string;
  title: string;
  location: string;
  price: number;
  availability: boolean;
  verificationStatus: string;
  hostId: string;
  image: string;
  description?: string;
  amenities?: string;
};

const KEY = 'unistay_listings';

export function getListings(): Listing[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Listing[];
  } catch { /* ignore */ }
  return [];
}

export function saveListings(items: Listing[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addListing(listing: Listing) {
  saveListings([listing, ...getListings()]);
}
