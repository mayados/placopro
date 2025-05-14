// src/modules/client/clientRepository.ts
import { db } from "@/lib/db";

export const clientRepository = {
  findById: (id: string) => db.client.findUnique({ where: { id } }),
};