import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromCity = searchParams.get("fromCity")?.trim();
  const toCity = searchParams.get("toCity")?.trim();
  const date = searchParams.get("date")?.trim();

  if (!fromCity || !toCity || !date) {
    return Response.json(
      { error: "fromCity, toCity, and date are required" },
      { status: 400 },
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { error: "date must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  if (Number.isNaN(dayStart.getTime())) {
    return Response.json({ error: "date is invalid" }, { status: 400 });
  }

  try {
    const buses = await prisma.bus.findMany({
      where: {
        departureDate: {
          gte: dayStart,
          lt: dayEnd,
        },
        route: {
          origin: { equals: fromCity, mode: "insensitive" },
          destination: { equals: toCity, mode: "insensitive" },
        },
      },
      include: {
        route: true,
        seats: {
          select: { isBooked: true },
        },
      },
      orderBy: { departureDate: "asc" },
    });

    return Response.json({
      buses: buses.map((bus) => ({
        id: bus.id,
        busNumber: bus.busNumber,
        fromCity: bus.route.origin,
        toCity: bus.route.destination,
        departureDate: bus.departureDate.toISOString(),
        totalSeats: bus.seats.length,
        availableSeats: bus.seats.filter((seat) => !seat.isBooked).length,
      })),
    });
  } catch {
    return Response.json({ error: "Could not search buses" }, { status: 500 });
  }
}
