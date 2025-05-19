
/* eslint-disable */
import { Prisma, PrismaClient } from "@prisma/client";
const db = new PrismaClient();



export const serviceRepository = {
  createServiceRepo: (tx: Prisma.TransactionClient) => ({
    findUnitByLabel: (label: string) =>
      tx.unit.findUnique({ where: { label } }),

    findVatRateByValue: (rate: number) =>
      tx.vatRate.findUnique({ where: { rate } }),

    findServiceWithRelations: (id: string) =>
      tx.service.findUnique({
        where: { id },
        include: { units: true, vatRates: true },
      }),

    createService: (data: Prisma.ServiceCreateInput) =>
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

// export async function findServiceByLabelFactory(label: string) {
//   return db.service.findUnique({ where: { label } });
// }

export function findServiceByLabelFactory(tx: PrismaClient | Prisma.TransactionClient) {
  return (label: string) => {
    return tx.service.findUnique({ where: { label } });
  };
}
