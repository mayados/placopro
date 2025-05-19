// // src/modules/client/clientRepository.ts
// import { db } from "@/lib/db";

// export const clientRepository = {
//   findById: (id: string) => db.client.findUnique({ where: { id } }),
// };

// modules/client/clientRepository.ts
import { PrismaClient, Prisma } from "@prisma/client";

export function clientRepository(tx: PrismaClient | Prisma.TransactionClient) {
  return {
    findById: (id: string) => tx.client.findUnique({ where: { id } }),
  };
}
