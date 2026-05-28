export type MockProject = {
  id: string;
  name: string;
  category: string;
  ratingSystem: string;
  constructionType: string;
  city: string;
  owner: string;
  ownerMobile: string;
  ownerEmail: string;
  ownerOrg: string;
  paymentMode: string;
  status: string;
  area: string;
  submitted: string;
  invoiceNo: string;
};

export const MOCK_PROJECTS: MockProject[] = [
  { id: "IGBCGFB260001", name: "CII GBC New Test 2", category: "Industrial", ratingSystem: "IGBC Green Factory Buildings", constructionType: "New / Upcoming", city: "Hyderabad", owner: "Rishav Kumar", ownerMobile: "9424858879", ownerEmail: "rishav.kumar@cii.in", ownerOrg: "CII IGBC", paymentMode: "offline", status: "pending", area: "1,00,000 sq ft", submitted: "Mar 2026", invoiceNo: "PI-20260301" },
  { id: "IGBCGI260002", name: "SBI GHAZIPUR DAIRY FARM BRANCH NEW DELHI", category: "Commercial", ratingSystem: "IGBC Green Interiors", constructionType: "Existing", city: "New Delhi", owner: "NAVIN KUMAR", ownerMobile: "9430966364", ownerEmail: "agmpre.lhodel@sbi.co.in", ownerOrg: "STATE BANK OF INDIA", paymentMode: "offline", status: "pending", area: "65,000 sq ft", submitted: "Feb 2026", invoiceNo: "PI-20260215" },
  { id: "IGBCGH260003", name: "Conscient 4, Residential Development at Sector-106, Gurugram", category: "Residential", ratingSystem: "IGBC Green Homes", constructionType: "New / Upcoming", city: "Gurugram", owner: "Sanjay Rastogi", ownerMobile: "9810030139", ownerEmail: "sanjay.rastogi@conscient.in", ownerOrg: "Prime Infradevelopers Pvt. Ltd.", paymentMode: "offline", status: "pending", area: "3,50,000 sq ft", submitted: "Jan 2026", invoiceNo: "PI-20260110" },
  { id: "IGBCGNB260004", name: "Green Heights Commercial", category: "Commercial", ratingSystem: "IGBC Green New Buildings", constructionType: "New / Upcoming", city: "Mumbai", owner: "Rajesh Sharma", ownerMobile: "9876543210", ownerEmail: "rajesh@greenheights.com", ownerOrg: "GreenHeights Corp", paymentMode: "online", status: "approved", area: "1,20,000 sq ft", submitted: "Dec 2025", invoiceNo: "PI-20251201" },
  { id: "IGBCGH260005", name: "Sunrise Residences Phase 2", category: "Residential", ratingSystem: "IGBC Green Homes", constructionType: "New / Upcoming", city: "Bangalore", owner: "Priya Mehta", ownerMobile: "9988776655", ownerEmail: "priya@sunrise.in", ownerOrg: "Sunrise Developers", paymentMode: "online", status: "approved", area: "85,000 sq ft", submitted: "Nov 2025", invoiceNo: "PI-20251115" },
  { id: "IGBCGEB260006", name: "Heritage Green Campus", category: "Education", ratingSystem: "IGBC Green Existing Buildings", constructionType: "Existing", city: "Delhi", owner: "Dr. Sunita Rao", ownerMobile: "9112233445", ownerEmail: "sunita@heritagecampus.edu", ownerOrg: "Heritage Foundation", paymentMode: "offline", status: "in-review", area: "3,50,000 sq ft", submitted: "Oct 2025", invoiceNo: "PI-20251005" },
];

export function findMockProjectById(id: string | undefined): MockProject | undefined {
  if (!id) return undefined;
  return MOCK_PROJECTS.find((p) => p.id === id);
}
