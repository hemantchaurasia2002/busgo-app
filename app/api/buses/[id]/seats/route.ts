import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const bus = await prisma.bus.findUnique({
      where: { id },
      include: {
        seats: {
          orderBy: { seatNumber: "asc" },
        },
      },
    });

    if (!bus) {
      return Response.json({ error: "Bus not found" }, { status: 404 });
    }

    return Response.json({
      busId: bus.id,
      seats: bus.seats.map((seat) => ({
        id: seat.id,
        seatNumber: seat.seatNumber,
        isBooked: seat.isBooked,
      })),
    });
  } catch {
    return Response.json({ error: "Could not load seats" }, { status: 500 });
  }
}
