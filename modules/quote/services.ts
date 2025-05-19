// modules/quote/services.ts
import { serviceRepository } from "./serviceRepository";
import type { Prisma, Service as PrismaService } from "@prisma/client";

export async function createOrUpdateService(
  service: ServiceType,
  repo: ReturnType<typeof serviceRepository.createServiceRepo>
): Promise<PrismaService | null> {
  const [unitEntity, vatRateEntity] = await Promise.all([
    repo.findUnitByLabel(service.unit),
    repo.findVatRateByValue(parseFloat(service.vatRate)),
  ]);

  if (service.id) {
    const existing = await repo.findServiceWithRelations(service.id);
    if (!existing) return null;

    const ops = [];
    if (unitEntity && !existing.units.some(u => u.id === unitEntity.id)) {
      ops.push(repo.createServiceUnit(existing.id, unitEntity.id));
    }
    if (vatRateEntity && !existing.vatRates.some(v => v.id === vatRateEntity.id)) {
      ops.push(repo.createServiceVatRate(existing.id, vatRateEntity.id));
    }
    await Promise.all(ops);
    return existing;
  }

  const created = await repo.createService({
    label: service.label,
    unitPriceHT: parseFloat(service.unitPriceHT),
    type: service.type,
  });

  const ops = [];
  if (unitEntity) ops.push(repo.createServiceUnit(created.id, unitEntity.id));
  if (vatRateEntity) ops.push(repo.createServiceVatRate(created.id, vatRateEntity.id));
  await Promise.all(ops);
  return created;
}

export async function createOrUpdateServices(
  services: ServiceType[],
  tx: Prisma.TransactionClient
): Promise<Array<PrismaService | null>> {
  // return serviceRepository.runInTransaction(async (tx) => {
  //   const repo = serviceRepository.createServiceRepo(tx);
  //   return Promise.all(services.map(service => createOrUpdateService(service, repo)));
  // });
   const repo = serviceRepository.createServiceRepo(tx); // create repo with existing tx
  return Promise.all(services.map(service => createOrUpdateService(service, repo)));
}
