// src/modules/workSite/workSiteRepository.ts
import { db } from "@/lib/db";

export const workSiteRepository = {
  findById: (id: string) => db.workSite.findUnique({ where: { id } }),
};
