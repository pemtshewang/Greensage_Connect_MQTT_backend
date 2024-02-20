
import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | null = null;

// Export a function instead of the variable for better control
export const getPrismaClient = (): PrismaClient => {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }
  return prismaClient;
};
