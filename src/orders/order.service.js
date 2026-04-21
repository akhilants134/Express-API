import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query"], // Leaves query logging on to expose the N+1 crime
});

export async function getOrders() {
  // Use include+select to fetch user in a single query, excluding passwordHash
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
  return orders;
}

export async function getOrderById(id) {
  // Use include+select to fetch user in a single query, excluding passwordHash
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
  return order;
}
