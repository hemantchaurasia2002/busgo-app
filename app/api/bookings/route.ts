import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Sign in to continue" }, { status: 401 });
  }

  const body = (await request.json()) as { seatId?: string };
  if (!body.seatId) {
    return Response.json({ error: "seatId is required" }, { status: 400 });
  }

  try {
    const seat = await prisma.seat.findUnique({
      where: { id: body.seatId },
      include: { bus: { include: { route: true } } },
    });

    if (!seat) {
      return Response.json({ error: "Seat not found" }, { status: 404 });
    }

    if (seat.isBooked) {
      return Response.json({ error: "That seat is already booked" }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        seatId: seat.id,
        userId: session.user.id,
        bookingDate: new Date(),
        status: "CONFIRMED",
      },
    });

    await prisma.seat.update({
      where: { id: seat.id },
      data: { isBooked: true },
    });

    return Response.json({
      booking: {
        id: booking.id,
        status: booking.status,
        seatNumber: seat.seatNumber,
        busNumber: seat.bus.busNumber,
        fromCity: seat.bus.route.origin,
        toCity: seat.bus.route.destination,
      },
    });
  } catch {
    return Response.json({ error: "Could not complete booking" }, { status: 500 });
  }
}
