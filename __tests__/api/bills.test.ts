import { createBillFromQuote } from '@/services/api/billService';  // Ton service qui appelle l'API
import fetchMock from 'jest-fetch-mock';

describe('createBillFromQuote service', () => {
  beforeAll(() => {
    fetchMock.enableMocks(); // Activer le mock de fetch
  });

  beforeEach(() => {
    fetchMock.resetMocks(); // Réinitialiser les mocks avant chaque test
  });

  it('devrait créer une facture et retourner une réponse valide', async () => {
    const billData: CreateBillFormValueType = {
        number: "BILL-12345",
        dueDate: new Date("2025-04-15T00:00:00.000Z"),
        natureOfWork: "Travaux de peinture",
        description: "Peinture intérieure",
        issueDate: "2025-04-01T00:00:00.000Z",
        vatAmount: 200,
        totalTtc: 2400,
        totalHt: 2000,
        discountAmount: 50,
        isDiscountFromQuote: true,
        workSiteId: "676583671c8b52e806df4c35",
        quoteId: "5d3bc14e2e68404a8e6a0e2bfa3a72fa",
        clientId: "676583671c8b52e806df4c35",
        services: [
          {
            id: "678e601baa432a928ebcd91e",
            label: "Peinture",
            unitPriceHT: "2000",
            type: "plâtrerie",
            vatRate: "10",
            unit: "forfait",
            selectedFromSuggestions: false,
            quantity: 1,
            detailsService: "Peinture murale",
          },
        ],
        servicesToUnlink: [],
        servicesAdded: [],
        status: "Draft",
        paymentTerms: "30 jours",
        travelCosts: 50,
        travelCostsType: "Forfait",
        workStartDate: new Date("2025-02-13T00:00:00.000Z"),
        workEndDate: new Date("2025-04-17T00:00:00.000Z"),
        workDuration: 45,
        discountReason: "Promotion spéciale",
      };

    // Mock de la réponse fetch
    fetchMock.mockResponseOnce(
        JSON.stringify({
          success: true,
          // On envoie l'objet complet avec un id dans data
          data: {
            id: "bill-id",
            number: "BILL-12345",
            dueDate: "2025-04-15T00:00:00.000Z",
            natureOfWork: "Travaux de peinture",
            description: "Peinture intérieure",
            issueDate: "2025-04-01T00:00:00.000Z",
            vatAmount: 200,
            totalTtc: 2400,
            totalHt: 2000,
            discountAmount: 50,
            isDiscountFromQuote: true,
            workSiteId: "676583671c8b52e806df4c35",
            quoteId: "5d3bc14e2e68404a8e6a0e2bfa3a72fa",
            clientId: "676583671c8b52e806df4c35",
            services: [
              {
                id: "678e601baa432a928ebcd91e",
                label: "Peinture",
                unitPriceHT: "2000",
                type: "plâtrerie",
                vatRate: "10",
                unit: "forfait",
                selectedFromSuggestions: false,
                quantity: 1,
                detailsService: "Peinture murale",
              },
            ],
            servicesToUnlink: [],
            servicesAdded: [],
            status: "Draft",
            paymentTerms: "30 jours",
            travelCosts: 50,
            travelCostsType: "Forfait",
            workStartDate: "2025-02-13T00:00:00.000Z",
            workEndDate: "2025-04-17T00:00:00.000Z",
            workDuration: 45,
            discountReason: "Promotion spéciale",
          }
        })
      );

    // Appel à la fonction de service
    const result = await createBillFromQuote(billData);

    // Vérifications
    console.log("les data renvoyées : "+JSON.stringify(result)); // Ajoute ce log pour voir ce qui est renvoyé

    expect(result.id).toBe("bill-id");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/bills/), // vérifier l'URL
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      })
    );
  });

  it('devrait lever une erreur si la requête échoue', async () => {
    const billData = {
        number: "BILL-12345",
        dueDate: new Date("2025-04-15T00:00:00.000Z"),
        natureOfWork: "Travaux de peinture",
        description: "Peinture intérieure",
        issueDate: "2025-04-01T00:00:00.000Z",
        vatAmount: 200,
        totalTtc: 2400,
        totalHt: 2000,
        discountAmount: 50,
        isDiscountFromQuote: true,
        workSiteId: "676583671c8b52e806df4c35",
        quoteId: "5d3bc14e2e68404a8e6a0e2bfa3a72fa",
        clientId: "676583671c8b52e806df4c35",
        services: [
          {
            id: "678e601baa432a928ebcd91e",
            label: "Peinture",
            unitPriceHT: "2000",
            type: "plâtrerie",
            vatRate: "10",
            unit: "forfait",
            selectedFromSuggestions: false,
            quantity: 1,
            detailsService: "Peinture murale",
          },
        ],
        servicesToUnlink: [],
        servicesAdded: [],
        status: "Draft",
        paymentTerms: "30 jours",
        travelCosts: 50,
        travelCostsType: "Forfait",
        workStartDate: new Date("2025-02-13T00:00:00.000Z"),
        workEndDate: new Date("2025-04-17T00:00:00.000Z"),
        workDuration: 45,
        discountReason: "Promotion spéciale",
      };


    fetchMock.mockRejectOnce(new Error('Erreur réseau'));

    await expect(createBillFromQuote(billData)).rejects.toThrow('Erreur réseau');
  });
});
