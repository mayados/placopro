import { createBillFromQuote } from '@/services/api/billService';
import fetchMock from 'jest-fetch-mock';
// import { CreateBillFormValueType, BillType } from '@/types/types.ts'; // Assurez-vous d'importer vos types

describe('createBillFromQuote service', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
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

    // Création d'une réponse mockée complète correspondant à l'interface BillType
    const mockResponse = {
      id: "bill-id",
      number: "BILL-12345",
      dueDate: new Date("2025-04-15T00:00:00.000Z"),
      natureOfWork: "Travaux de peinture",
      description: "Peinture intérieure",
      issueDate: new Date("2025-04-01T00:00:00.000Z"),
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
      status: "Draft",
      billType: "Final", 
      paymentTerms: "30 jours",
      travelCosts: 50,
      travelCostsType: "Forfait",
      workStartDate: new Date("2025-02-13T00:00:00.000Z"),
      workEndDate: new Date("2025-04-17T00:00:00.000Z"),
      workDuration: 45,
      discountReason: "Promotion spéciale",
      author: { id: "author-id", name: "Test Author" },
      client: { id: "client-id", name: "Test Client" },
      creditNotes: [],
      workSite: { id: "worksite-id", name: "Test Worksite" },
      quote: { id: "quote-id", number: "QUOTE-123" }
    };

    fetchMock.mockResponseOnce(
      JSON.stringify({
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
        status: "Draft",
        billType: "Final", 
        paymentTerms: "30 jours",
        travelCosts: 50,
        travelCostsType: "Forfait",
        workStartDate: "2025-02-13T00:00:00.000Z",
        workEndDate: "2025-04-17T00:00:00.000Z",
        workDuration: 45,
        discountReason: "Promotion spéciale",
        // Propriétés manquantes
        author: { id: "author-id", name: "Test Author" },
        client: { id: "client-id", name: "Test Client" },
        creditNotes: [],
        workSite: { id: "worksite-id", name: "Test Worksite" },
        quote: { id: "quote-id", number: "QUOTE-123" }
      })
    );

    const result = await createBillFromQuote(billData);

    // Verifications
    expect(result.id).toBe("bill-id");
    expect(result.number).toBe("BILL-12345");
    
    // verify fetch was called with good parameters
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/bills", // URL exacte
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billData),
      })
    );
  });

  it('devrait lever une erreur si la requête échoue', async () => {
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

    // simulates an error 
    fetchMock.mockRejectOnce(new Error('Erreur réseau'));
    // expects to receive the exception
    await expect(createBillFromQuote(billData)).rejects.toThrow('Erreur réseau');
  });
});