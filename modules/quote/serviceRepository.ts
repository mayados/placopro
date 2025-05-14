
/* eslint-disable */
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// Define exact type of tx object injected by prisma
export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export const serviceRepository = {
    // Util function to execute a transaction
  runInTransaction: <T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> => {
    return db.$transaction(fn); // On utilise bien la bonne surcharge ici
  },

  // Create a tiny repo from a transaction's client
  createServiceRepo: (tx: TransactionClient) => ({
    findUnitByLabel: (label: string) =>
      tx.unit.findUnique({ where: { label } }),

    findVatRateByValue: (rate: number) =>
      tx.vatRate.findUnique({ where: { rate } }),

    findServiceWithRelations: (id: string) =>
      tx.service.findUnique({
        where: { id },
        include: { units: true, vatRates: true },
      }),

    createService: (data: any) =>
      tx.service.create({ data }),

    createServiceUnit: (serviceId: string, unitId: string) =>
      tx.serviceUnit.create({
        data: { serviceId, unitId },
      }),

    createServiceVatRate: (serviceId: string, vatRateId: string) =>
      tx.serviceVatRate.create({
        data: { serviceId, vatRateId },
      }),
  }),
};

export async function findServiceByLabel(label: string) {
  return db.service.findUnique({ where: { label } });
}
