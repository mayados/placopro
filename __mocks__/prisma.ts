// import { PrismaClient } from '@prisma/client';
// import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// // Réinitialiser le mock avant chaque test
// beforeEach(() => {
//   mockReset(prismaMock);
// });

// // Remplacer le module Prisma réel par notre mock
// jest.mock('@prisma/client', () => ({
//   __esModule: true,
//   default: prismaMock,
// }));

//////

// import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
// import { PrismaClient } from '@prisma/client';
// // import { db } from '@/lib/db'; // Importer le db que tu utilises dans ta route API

// const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>;

// // Mock de l'instance db en renvoyant le mock PrismaClient
// export const db = prismaMock;
// // Créer un mock pour PrismaClient
// // export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>;

// // Réinitialiser le mock avant chaque test
// beforeEach(() => {
//   mockReset(prismaMock);
// });

// // Mock le module PrismaClient pour renvoyer un constructeur
// jest.mock('@/lib/db', () => {
//   return {
//     __esModule: true,
//     db: jest.fn(() => prismaMock),  // Utilisation de jest.fn() pour simuler PrismaClient comme constructeur
//   };
// });

//////////////

import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
// import { db } from "@/lib/db";


// Créer un mock pour PrismaClient
export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>;

// Réinitialiser le mock avant chaque test
beforeEach(() => {
  mockReset(prismaMock);
});

// Mock le module db pour utiliser prismaMock
jest.mock('@/lib/db', () => {
  return {
    __esModule: true,
    db: prismaMock,  // Utilisation directe de prismaMock pour db
  };
});
