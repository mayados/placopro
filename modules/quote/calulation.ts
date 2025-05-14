export function calculateServiceTotals(service: ServiceAndQuoteServiceType) {
  const quantity = Number(service.quantity);
  const unitPriceHT = Number(service.unitPriceHT);
  const vatRate = parseFloat(service.vatRate);

  const totalHT = unitPriceHT * quantity;
  const vatAmount = totalHT * (vatRate / 100);
  const totalTTC = totalHT + vatAmount;

  return { totalHT, vatAmount, totalTTC, quantity };
}



export function calculateQuoteTotals(
  serviceTotals: { totalHtQuote: number; vatAmountQuote: number; totalTTCQuote: number },
  travelCosts: number
) {
  const vatAmountForTravelCosts = travelCosts * 0.2;

  const totalHtQuote = serviceTotals.totalHtQuote + travelCosts;
  const vatAmountQuote = serviceTotals.vatAmountQuote + vatAmountForTravelCosts;
  const totalTTCQuote = serviceTotals.totalTTCQuote + travelCosts + vatAmountForTravelCosts;

  return {
    totalHtQuote,
    vatAmountQuote,
    totalTTCQuote,
    vatAmountForTravelCosts,
  };
}
