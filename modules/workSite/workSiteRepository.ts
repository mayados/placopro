// // src/modules/workSite/workSiteRepository.ts
// import { db } from "@/lib/db";

// export const workSiteRepository = {
//   findById: (id: string) => db.workSite.findUnique({ where: { id } }),
// };


// modules/workSite/workSiteRepository.ts
import { PrismaClient, Prisma } from "@prisma/client";

export function workSiteRepository(tx: PrismaClient | Prisma.TransactionClient) {
  return {
    findById: (id: string) => tx.workSite.findUnique({ where: { id } }),
  };
}
