// Mock data — replace with API responses when backend is ready

export const MOCK_VEHICLES = [
  {
    id: "v1",
    title: "2021 BMW X5 xDrive40i",
    make: "BMW",
    model: "X5",
    year: 2021,
    price: 45500,
    mileage: 32000,
    fuel: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    location: "Paris, France",
    verified: true,
    status: "active",
    sellerId: "s1",
    sellerName: "Jean Dupont",
    description: "Immaculate condition, full service history, premium package with panoramic roof and leather interior.",
    specs: { engine: "3.0L Turbo", power: "340 HP", color: "Black", doors: 5 },
    images: [],
    createdAt: "2024-01-15",
  },
  {
    id: "v2",
    title: "2020 Mercedes-Benz GLE 350",
    make: "Mercedes-Benz",
    model: "GLE",
    year: 2020,
    price: 52900,
    mileage: 28500,
    fuel: "Diesel",
    transmission: "Automatic",
    bodyType: "SUV",
    location: "Lyon, France",
    verified: true,
    status: "active",
    sellerId: "s2",
    sellerName: "Marie Laurent",
    description: "Luxury SUV with AMG line package, adaptive cruise control, and premium sound system.",
    specs: { engine: "2.0L Diesel", power: "272 HP", color: "Silver", doors: 5 },
    images: [],
    createdAt: "2024-02-01",
  },
  {
    id: "v3",
    title: "2022 Audi Q7 55 TFSI",
    make: "Audi",
    model: "Q7",
    year: 2022,
    price: 58200,
    mileage: 18200,
    fuel: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    location: "Marseille, France",
    verified: true,
    status: "active",
    sellerId: "s1",
    sellerName: "Jean Dupont",
    description: "Quattro AWD, virtual cockpit, matrix LED headlights, 7-seat configuration.",
    specs: { engine: "3.0L TFSI", power: "340 HP", color: "White", doors: 5 },
    images: [],
    createdAt: "2024-02-10",
  },
  {
    id: "v4",
    title: "2019 Porsche Cayenne S",
    make: "Porsche",
    model: "Cayenne",
    year: 2019,
    price: 67800,
    mileage: 41000,
    fuel: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    location: "Nice, France",
    verified: true,
    status: "active",
    sellerId: "s3",
    sellerName: "Pierre Martin",
    description: "Sport Chrono package, air suspension, Bose surround sound, certified pre-owned.",
    specs: { engine: "2.9L V6", power: "440 HP", color: "Grey", doors: 5 },
    images: [],
    createdAt: "2024-01-20",
  },
  {
    id: "v5",
    title: "2023 Tesla Model 3 Long Range",
    make: "Tesla",
    model: "Model 3",
    year: 2023,
    price: 42000,
    mileage: 12000,
    fuel: "Electric",
    transmission: "Automatic",
    bodyType: "Sedan",
    location: "Bordeaux, France",
    verified: true,
    status: "active",
    sellerId: "s2",
    sellerName: "Marie Laurent",
    description: "Full self-driving capability, white interior, supercharger access included.",
    specs: { engine: "Dual Motor", power: "450 HP", color: "Blue", doors: 4 },
    images: [],
    createdAt: "2024-03-01",
  },
  {
    id: "v6",
    title: "2021 Volkswagen Golf GTI",
    make: "Volkswagen",
    model: "Golf",
    year: 2021,
    price: 28500,
    mileage: 35000,
    fuel: "Petrol",
    transmission: "Manual",
    bodyType: "Hatchback",
    location: "Toulouse, France",
    verified: false,
    status: "pending",
    sellerId: "s1",
    sellerName: "Jean Dupont",
    description: "Performance hatchback, DCC suspension, digital cockpit.",
    specs: { engine: "2.0L TSI", power: "245 HP", color: "Red", doors: 5 },
    images: [],
    createdAt: "2024-03-05",
  },
];

export const MOCK_OFFERS = [
  { id: "o1", vehicleId: "v1", vehicleTitle: "2021 BMW X5 xDrive40i", amount: 44000, status: "pending", createdAt: "2024-03-10", buyerId: "b1" },
  { id: "o2", vehicleId: "v2", vehicleTitle: "2020 Mercedes-Benz GLE 350", amount: 51000, status: "accepted", createdAt: "2024-03-05", buyerId: "b1" },
  { id: "o3", vehicleId: "v4", vehicleTitle: "2019 Porsche Cayenne S", amount: 65000, status: "rejected", createdAt: "2024-02-28", buyerId: "b1" },
];

export const MOCK_VENDOR_OFFERS = [
  { id: "o1", vehicleId: "v1", vehicleTitle: "2021 BMW X5 xDrive40i", buyerName: "Ahmed Hassan", amount: 44000, status: "pending", createdAt: "2024-03-10" },
  { id: "o4", vehicleId: "v3", vehicleTitle: "2022 Audi Q7 55 TFSI", buyerName: "Sarah Mitchell", amount: 56000, status: "pending", createdAt: "2024-03-12" },
];

export const MOCK_PURCHASES = [
  { id: "p1", vehicleTitle: "2020 Mercedes-Benz GLE 350", amount: 51000, date: "2024-03-08", status: "completed", invoiceId: "INV-2024-001" },
  { id: "p2", vehicleTitle: "2018 Audi A4 Avant", amount: 24500, date: "2023-11-15", status: "completed", invoiceId: "INV-2023-089" },
];

export const MOCK_PAYMENTS = [
  { id: "pay1", description: "Mercedes-Benz GLE 350", amount: 51000, date: "2024-03-08", status: "paid", method: "Escrow" },
  { id: "pay2", description: "Deposit — BMW X5", amount: 5000, date: "2024-03-10", status: "pending", method: "Escrow" },
];

export const MOCK_VENDOR_LISTINGS = MOCK_VEHICLES.filter((v) => v.sellerId === "s1").map((v) => ({
  ...v,
  views: Math.floor(Math.random() * 500) + 50,
  offers: v.id === "v1" ? 2 : 0,
}));

export const MOCK_WALLET = {
  balance: 12450,
  pending: 3200,
  totalEarnings: 45800,
  currency: "EUR",
};

export const MOCK_TRANSACTIONS = [
  { id: "t1", type: "credit", description: "Sale — Mercedes GLE 350", amount: 51000, date: "2024-03-08", status: "completed" },
  { id: "t2", type: "debit", description: "Platform Commission (5%)", amount: -2550, date: "2024-03-08", status: "completed" },
  { id: "t3", type: "credit", description: "Sale — Audi A4", amount: 24500, date: "2023-11-15", status: "completed" },
  { id: "t4", type: "debit", description: "Withdrawal to Bank", amount: -15000, date: "2023-12-01", status: "completed" },
];

export const MOCK_BANK = {
  accountName: "Jean Dupont",
  bankName: "BNP Paribas",
  iban: "FR76 3000 4000 0500 0000 1234 567",
  swift: "BNPAFRPP",
  country: "France",
};

export const MOCK_BUYERS = [
  { id: "b1", name: "Ahmed Hassan", email: "ahmed@email.com", phone: "+33 612345678", status: "active", joined: "2023-06-15", purchases: 2 },
  { id: "b2", name: "Sarah Mitchell", email: "sarah@email.com", phone: "+33 698765432", status: "active", joined: "2023-08-20", purchases: 1 },
  { id: "b3", name: "Marco Rossi", email: "marco@email.com", phone: "+33 655443322", status: "inactive", joined: "2024-01-10", purchases: 0 },
];

export const MOCK_SELLERS = [
  { id: "s1", name: "Jean Dupont", email: "jean@email.com", phone: "+33 611223344", status: "active", joined: "2023-05-01", listings: 3, sales: 5 },
  { id: "s2", name: "Marie Laurent", email: "marie@email.com", phone: "+33 622334455", status: "active", joined: "2023-07-12", listings: 2, sales: 3 },
  { id: "s3", name: "Pierre Martin", email: "pierre@email.com", phone: "+33 633445566", status: "pending", joined: "2024-02-28", listings: 1, sales: 0 },
];

export const MOCK_ADMIN_LISTINGS = MOCK_VEHICLES.map((v) => ({
  ...v,
  submittedAt: v.createdAt,
  approvalStatus: v.status === "pending" ? "pending" : "approved",
}));

export const MOCK_WITHDRAWALS = [
  { id: "w1", seller: "Jean Dupont", amount: 15000, date: "2024-03-01", status: "pending", bank: "BNP Paribas" },
  { id: "w2", seller: "Marie Laurent", amount: 8500, date: "2024-02-15", status: "completed", bank: "Crédit Agricole" },
  { id: "w3", seller: "Pierre Martin", amount: 5000, date: "2024-03-10", status: "pending", bank: "Société Générale" },
];

export const MOCK_MAKES = ["BMW", "Mercedes-Benz", "Audi", "Porsche", "Tesla", "Volkswagen", "Toyota", "Ford"];
export const MOCK_MODELS = {
  BMW: ["X5", "X3", "3 Series", "5 Series"],
  "Mercedes-Benz": ["GLE", "GLC", "C-Class", "E-Class"],
  Audi: ["Q7", "Q5", "A4", "A6"],
  Porsche: ["Cayenne", "Macan", "911", "Panamera"],
  Tesla: ["Model 3", "Model Y", "Model S"],
  Volkswagen: ["Golf", "Tiguan", "Passat"],
  Toyota: ["Corolla", "RAV4", "Camry"],
  Ford: ["Focus", "Mustang", "Explorer"],
};

export const MOCK_ADMIN_STATS = {
  totalUsers: 7200,
  totalListings: 10450,
  totalRevenue: 2840000,
  commissionEarned: 142000,
  pendingApprovals: 23,
  pendingWithdrawals: 5,
};

export const MOCK_REVENUE_CHART = [
  { month: "Jan", revenue: 180000, commission: 9000 },
  { month: "Feb", revenue: 220000, commission: 11000 },
  { month: "Mar", revenue: 195000, commission: 9750 },
  { month: "Apr", revenue: 250000, commission: 12500 },
  { month: "May", revenue: 280000, commission: 14000 },
  { month: "Jun", revenue: 310000, commission: 15500 },
];

export const MOCK_COMMISSION = { rate: 5, lastUpdated: "2024-01-01" };

export const FILTER_OPTIONS = {
  makes: MOCK_MAKES,
  bodyTypes: ["Sedan", "SUV", "Hatchback", "Coupe", "Electric", "Luxury"],
  fuelTypes: ["Petrol", "Diesel", "Electric", "Hybrid"],
  transmissions: ["Automatic", "Manual"],
  years: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
};
