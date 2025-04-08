/**
 * @jest-environment node
 */
import { POST as createClientHandler } from '@/app/api/clients/create';
import { NextRequest, NextResponse } from 'next/server';
import { prismaMock } from '../../__mocks__/prisma';
import { ClientOrProspectEnum } from '@prisma/client';

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => ({ body, init })),
  },
}));

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn().mockResolvedValue({ id: 'user_123', emailAddresses: [{ emailAddress: 'test@example.com' }] }),
}));

// Mock la base de données pour rediriger les appels db.client.create vers prismaMock.client.create
jest.mock('@/lib/db', () => ({
  __esModule: true,
  db: {
    client: {
      create: jest.fn().mockImplementation((args) => prismaMock.client.create(args)),

      // findFirst: jest.fn().mockImplementation((...args) => prismaMock.client.findFirst(...args)),
      // count: jest.fn().mockImplementation((...args) => prismaMock.client.count(...args)),
    },
  },
}));

describe('API Client Creation Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait créer un client avec succès', async () => {
    // Données client complètes
    const clientData = {
      // id: '5f63a7bf4b0a8c001c4e8df8',
      clientNumber: 'C123456789',
      name: 'Dupont',
      firstName: 'Jean',
      mail: 'jean.dupont@example.com',
      phone: '0102030405',
      road: 'Rue de Paris',
      addressNumber: '12B',
      postalCode: '75001',
      city: 'Paris',
      additionalAddress: 'Appartement 5, 3ème étage',
      slug: 'jean-dupont',
      isAnonymized: false,
      convertedAt: null,
      status: ClientOrProspectEnum.CLIENT,
      // createdAt: new Date(),
      // updatedAt: new Date(),
    };

    // Configurer le mock pour retourner les données attendues
    prismaMock.client.count.mockResolvedValue(5); // Pour générer un numéro séquentiel
    prismaMock.client.create.mockResolvedValue({
      ...clientData,
      id: '5f63a7bf4b0a8c001c4e8df8',
      clientNumber: 'CL-000006',
      slug: 'dupont-jean-cl-000006',
    });

    // Vérifier que le client n'existe pas déjà
    prismaMock.client.findFirst.mockResolvedValue(null);

    // Créer une requête avec la méthode JSON qui retourne les données client
    const request = new Request('http://localhost:3000/api/clients/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    // Mocker la méthode json sur Request
    const jsonMock = jest.fn().mockResolvedValue(clientData);
    Object.defineProperty(request, 'json', {
      value: jsonMock,
      configurable: true,
    });

    // Appeler le handler
    await createClientHandler(request as unknown as NextRequest);

    // Vérifier que Prisma a été appelé correctement
    expect(prismaMock.client.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.client.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        // id: '5f63a7bf4b0a8c001c4e8df8',

        clientNumber: expect.stringMatching(/^CL-\d+$/),
        slug: expect.stringMatching(/dupont-jean-cl-\d+/),
        name: 'Dupont',
        firstName: 'Jean',
        mail: 'jean.dupont@example.com',
        phone: '0102030405',
        road: 'Rue de Paris',
        addressNumber: '12B',
        postalCode: '75001',
        city: 'Paris',
        additionalAddress: 'Appartement 5, 3ème étage',
        isAnonymized: false,
        convertedAt: null,
        status: ClientOrProspectEnum.CLIENT,
        // createdAt: new Date(),
        // updatedAt: new Date(),
      })
    }));

    // Vérifier la réponse
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        success: true, 
        data: expect.anything() 
      }),
      // expect.objectContaining({ status: 200 })
    );
  });

  // it('devrait rejeter un client avec email déjà existant', async () => {
  //   const existingClientData = {
  //     id: '5f63a7bf4b0a8c001c4e8df9',
  //     clientNumber: 'CL-000005',
  //     name: 'Dupont',
  //     firstName: 'Jean',
  //     mail: 'jean.dupont@example.com',
  //     phone: '0102030405',
  //     road: 'Rue de Paris',
  //     addressNumber: '12B',
  //     postalCode: '75001',
  //     city: 'Paris',
  //     additionalAddress: 'Appartement 5, 3ème étage',
  //     slug: 'dupont-jean-cl-000005',
  //     isAnonymized: false,
  //     convertedAt: null,
  //     status: ClientOrProspectEnum.CLIENT,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //     userId: 'user_123'
  //   };

  //   // Configurer le mock pour simuler qu'un client avec cet email existe déjà
  //   prismaMock.client.findFirst.mockResolvedValue(existingClientData);

  //   const newClientData = {
  //     id: '5f63a7bf4b0a8c001c4e8df8',
  //     clientNumber: 'C123456789',
  //     name: 'Martin', // Différent nom mais même email
  //     firstName: 'Pierre',
  //     mail: 'jean.dupont@example.com', // Email déjà existant
  //     phone: '0607080910',
  //     road: 'Avenue des Champs-Élysées',
  //     addressNumber: '5',
  //     postalCode: '75008',
  //     city: 'Paris',
  //     additionalAddress: 'Appartement 2, 3ème étage',
  //     slug: 'pierre-martin',
  //     isAnonymized: false,
  //     convertedAt: null,
  //     status: ClientOrProspectEnum.CLIENT
  //   };

  //   // Créer la requête
  //   const request = new Request('http://localhost:3000/api/clients/create', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(newClientData),
  //   });

  //   // Mocker la méthode json
  //   const jsonMock = jest.fn().mockResolvedValue(newClientData);
  //   Object.defineProperty(request, 'json', {
  //     value: jsonMock,
  //     configurable: true,
  //   });

  //   // Appeler le handler
  //   await createClientHandler(request as unknown as NextRequest);

  //   // Vérifier que create n'a pas été appelé mais findFirst oui
  //   expect(prismaMock.client.findFirst).toHaveBeenCalledTimes(1);
  //   expect(prismaMock.client.create).not.toHaveBeenCalled();

  //   // Vérifier que NextResponse.json a été appelé avec un message d'erreur
  //   expect(NextResponse.json).toHaveBeenCalledWith(
  //     expect.objectContaining({ 
  //       success: false,
  //       error: expect.stringContaining('existe déjà')
  //     }),
  //     expect.objectContaining({ status: 400 })
  //   );
  // });

  it('devrait gérer une erreur serveur', async () => {
    const clientData = {
      id: '5f63a7bf4b0a8c001c4e8df8',
      clientNumber: 'C123456789',
      name: 'Dupont',
      firstName: 'Jean',
      mail: 'jean.dupont@example.com',
      phone: '0102030405',
      road: 'Rue de Paris',
      addressNumber: '15',
      postalCode: '75001',
      city: 'Paris',
      additionalAddress: 'Appartement 5, 3ème étage',
      slug: 'jean-dupont',
      isAnonymized: false,
      convertedAt: null,
      status: ClientOrProspectEnum.CLIENT
    };

    // Configurer le mock pour simuler qu'aucun client n'existe avec cet email
    prismaMock.client.findFirst.mockResolvedValue(null);
    
    // Mais une erreur se produit lors de la création
    prismaMock.client.create.mockRejectedValue(new Error('Erreur DB'));

    // Créer la requête
    const request = new Request('http://localhost:3000/api/clients/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });

    // Mocker la méthode json
    const jsonMock = jest.fn().mockResolvedValue(clientData);
    Object.defineProperty(request, 'json', {
      value: jsonMock,
      configurable: true,
    });

    // Appeler le handler
    await createClientHandler(request as unknown as NextRequest);

    // Vérifier que NextResponse.json a été appelé avec un message d'erreur
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        success: false,
        error: expect.anything()
      }),
      expect.objectContaining({ status: 500 })
    );
  });
});