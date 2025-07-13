// import { PrismaClient } from "@/generated/prisma";


// export const db = globalThis.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== "production") globalThis.prisma = db;


// import { PrismaClient } from "@prisma/client";
 import { PrismaClient } from "@/generated/prisma";
 
// 👇 Extend globalThis to include prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 👇 Prevent multiple instances in dev (important for hot reload)
export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
