// Simulating your SQL Database and AI Analytics for the Demo

export const drivers = [
  {
    id: "2vLJR0j5hndUHz6xeHBzXRlF6Vv1",
    name: "Binyam Kebede",
    username: "@BinyamKebede3338",
    phone: "+251947979097",
    vehicle: { color: "Black", model: "Toyota Corolla", plate: "A1234" },
    status: "active",
    tier: "noBenefits",
    rating: 4.8,
    earnings: 0.00,
    location: "Addis Ababa, Bole",
    online: true,
  },
  {
    id: "34genjo6W0OX8NvGMlecPQE3beP2",
    name: "Ab Gidey",
    username: "@AbGidey3031",
    phone: "+251963063640",
    vehicle: { color: "Blue", model: "Vitz", plate: "B4567" },
    status: "available",
    tier: "basic",
    rating: 4.5,
    earnings: 57.30,
    location: "Addis Ababa, Piassa",
    online: true,
  },
  {
    id: "5knFq9fR2FZruWM7UIhbeFdGWup2",
    name: "Aron Samuel",
    username: "Aron Samuel",
    phone: "+251951065623",
    vehicle: { color: "Red", model: "Executive 2020 Avalon TRD", plate: "C7890" },
    status: "suspended",
    tier: "noBenefits",
    rating: 3.9,
    earnings: 0.00,
    location: "Addis Ababa, Kazanchis",
    online: false,
  }
];

export const users = [
  {
    id: "5knFq9fR2FZruWM7UIhbeFdGWup2",
    username: "@MulatuGudisa4343",
    email: "gudisamulatu@gmail.com",
    phone: "0931181017",
    balance: 20.00,
    created_at: "2025-06-21",
    last_active: "Today",
    status: "Active"
  },
  {
    id: "7v2BVyX1VlOxbzKyhKIzfgcsuv53",
    username: "@gtk_mahi",
    email: "mahletgebretekle@gmail.com",
    phone: "0974730457",
    balance: 50.00,
    created_at: "2025-09-10",
    last_active: "2 mins ago",
    status: "Active"
  }
];

export const rides = [
  {
    id: "R-1001",
    driver: "@AbGidey3031",
    user: "@gtk_mahi",
    origin: "Bole International Airport",
    destination: "Hilton Hotel",
    fare: 150.00,
    status: "In Progress",
    type: "Pool",
    seats_filled: 3,
    time: "14:30"
  },
  {
    id: "R-1002",
    driver: "@BinyamKebede3338",
    user: "@MulatuGudisa4343",
    origin: "Meskel Square",
    destination: "4 Kilo",
    fare: 85.50,
    status: "Completed",
    type: "Standard",
    seats_filled: 1,
    time: "12:15"
  }
];

// AI Insights Data
export const revenueData = {
  series: [
    { name: "Total Revenue", data: [4400, 5500, 5700, 5600, 6100, 5800, 6300, 6000, 6600] },
    { name: "Driver Payouts", data: [3600, 4500, 4700, 4600, 5000, 4800, 5300, 5000, 5600] },
  ],
  categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
};

export const poolUtilization = [70, 65, 80, 85, 90, 75, 60]; // % seats filled