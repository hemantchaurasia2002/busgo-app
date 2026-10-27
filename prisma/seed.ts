import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { auth } from "../lib/auth";

const demoUser = {
  name: "Demo Rider",
  email: "demo@busgo.app",
  password: "BusgoDemo1",
};

async function main() {
try {
  const result = await auth.api.signUpEmail({
    body: demoUser,
  });
  console.log(`Seeded ${result.user.email}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!/already|exist/i.test(message)) {
    throw error;
  }
  console.log(`User ${demoUser.email} already exists`);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const trips = [
  {
    origin: "Mumbai",
    destination: "Pune",
    busNumber: "BG-101",
    departureDate: new Date("2026-11-01T08:00:00.000Z"),
    bookedSeats: ["1A", "2C"],
  },
  {
    origin: "Mumbai",
    destination: "Pune",
    busNumber: "BG-102",
    departureDate: new Date("2026-11-01T18:30:00.000Z"),
    bookedSeats: ["3B"],
  },
  {
    origin: "Mumbai",
    destination: "Pune",
    busNumber: "BG-201",
    departureDate: new Date("2026-11-02T08:00:00.000Z"),
    bookedSeats: [],
  },
  {
    origin: "Delhi",
    destination: "Jaipur",
    busNumber: "BG-301",
    departureDate: new Date("2026-11-01T06:00:00.000Z"),
    bookedSeats: ["1C", "1D"],
  },
];

const seatNumbers = ["1A", "1B", "1C", "1D", "2A", "2B", "2C", "2D", "3A", "3B", "3C", "3D"];

await prisma.booking.deleteMany();
await prisma.seat.deleteMany();
await prisma.bus.deleteMany();
await prisma.route.deleteMany();

const routes = new Map<string, string>();

for (const trip of trips) {
  const routeKey = `${trip.origin}|${trip.destination}`;
  let routeId = routes.get(routeKey);

  if (!routeId) {
    const route = await prisma.route.create({
      data: {
        origin: trip.origin,
        destination: trip.destination,
      },
    });
    routeId = route.id;
    routes.set(routeKey, routeId);
  }

  await prisma.bus.create({
    data: {
      busNumber: trip.busNumber,
      departureDate: trip.departureDate,
      routeId,
      seats: {
        create: seatNumbers.map((seatNumber) => ({
          seatNumber,
          isBooked: trip.bookedSeats.includes(seatNumber),
        })),
      },
    },
  });
}

console.log(`Seeded ${trips.length} buses`);
await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
