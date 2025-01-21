"use client";

import { useEffect, useState, use } from "react";
import { formatDate } from '@/lib/utils'
// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

const Quote = ({ params }: { params: Promise<{ quoteNumber: string }>}) => {

    const [quote, setQuote] = useState<QuoteType | null>(null);
    const [company, setCompany] = useState<CompanyType | null>(null);
    const [vatAmountTravelCost, setVatAmountTravelCost] = useState<number>(0)
    const [priceTTCTravelCost, setPriceTTCTravelCost] = useState<number>(0)

    
        useEffect(() => {
          async function fetchQuote() {
            // Params is now asynchronous. It's a Promise
            // So we need to await before access its properties
            const resolvedParams = await params;
            const quoteNumber = resolvedParams.quoteNumber;
      
            const response = await fetch(`/api/director/quotes/${quoteNumber}`);
            const data: QuoteTypeSingle = await response.json();
            setQuote(data.quote); 
            if(data.quote.travelCosts){
                // travelCosts cost => vatAmount and priceTTC
                setVatAmountTravelCost((data.quote.travelCosts) * (20/100))  
                setPriceTTCTravelCost((data.quote.travelCosts) + vatAmountTravelCost )            
            }
        }

        async function fetchCompany(){
            const companySlug = "placopro";
      
            const response = await fetch(`/api/director/companies/${companySlug}`);
            const data: CompanyTypeSingle = await response.json();
            setCompany(data.company); 
        }

        
      
          fetchQuote();
          fetchCompany()
        }, [params]);

        if (!quote) return <div>Loading...</div>;
      
    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Devis {quote?.number}</h1>
            {/* <div><Toaster /></div> */}
            <section>
                <div>
                    <h2>Emetteur</h2>
                    <div>
                        <p>{company?.name}</p>
                        <p>Téléphone : {company?.phone}</p>
                        <p>Email : {company?.mail}</p>
                        <p>Adresse : {company?.addressNumber} {company?.road} {company?.city} {company?.postalCode} {company?.additionnalAddress}</p>
                    </div>
                </div>
                <div>
                    <h2>Addressé à</h2>
                    <div>
                        <p>{quote?.client.name} {quote?.client.firstName}</p>
                        <p>{quote?.client.addressNumber} {quote?.client.road} {quote?.client.postalCode} {quote?.client.city} {quote?.client.additionalAddress}</p>
                    </div>
                </div>
            </section>
            <section>
                <p>Chantier : {quote?.workSite.addressNumber} {quote?.workSite.road} {quote?.workSite.postalCode} {quote?.workSite.city} {quote?.workSite.additionnalAddress}</p>
                <p>Date de début estimée : {formatDate(quote.workStartDate)}</p>
                <p>Date de fin estimée : {formatDate(quote.estimatedWorkEndDate)}</p>
                <p>Durée estimée des travaux : {quote.estimatedWorkDuration} jours</p>
                {/* Table about quote details */}
                <table>
                    <thead>
                        <tr>
                            <th>
                                Service
                            </th>
                            <th>
                                Description 
                            </th>
                            <th>
                                Quantité
                            </th>
                            <th>
                                Prix Unitaire
                            </th>
                            <th>
                                TVA
                            </th>
                            <th>
                                Montant TVA
                            </th>
                            <th>
                                Prix HT
                            </th>
                            <th>
                                Prix TTC
                            </th>
                        </tr>                        
                    </thead>
                    <tbody>
                        {/* quote.services => quoteService */}
                        {quote?.services.map((service, index) => {

                            return (
                                <tr key={index}>
                                    <td>{service.service.label} - {service.type}</td>
                                    <td>{service.detailsService}</td>
                                    <td>{service.quantity} {service.unit}</td>
                                    <td>{service.service.unitPriceHT}</td>
                                    <td>{service.vatRate}</td>
                                    <td>{service.vatAmount}</td>
                                    <td>{service.totalHT}</td>
                                    <td>{service.totalTTC}</td>
                                </tr>
                            );
                        })}                      
                    </tbody>
                </table>
                {/* Travel costs */} 
                <table>
                    <thead>
                        <tr>
                            <th>
                                Frais de déplacement HT
                            </th>
                            <th>
                                Type de forfait
                            </th>
                            <th>
                                TVA
                            </th>
                            <th>
                                Montant de la TVA
                            </th>
                            <th>
                                Frais TTC
                            </th>
                        </tr>                        
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {quote?.travelCosts} €
                            </td>
                            <td>
                                Forfait unique 
                            </td>
                            <td>
                                20%
                            </td>
                            <td>
                                {vatAmountTravelCost} €
                            </td>
                            <td>
                                {priceTTCTravelCost} €
                            </td>
                        </tr>                        
                    </tbody>
                </table>
                {/* Total du devis  */}
                <table>
                    <thead>
                        <tr>
                            <th>
                                Total HT
                            </th>
                            <th>
                                Montant total de la TVA
                            </th>
                            <th>
                                Montant TTC
                            </th>
                        </tr>                        
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {quote.priceHT} €
                            </td>
                            <td>
                                {quote.vatAmount} €
                            </td>
                            <td>
                                {quote.priceTTC} €
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
            <section>
                {/* issuedDate */}
                <p>Devis créé le {formatDate(quote.issueDate)}</p>

                {/* Deposit amount (in %) */}
                <p>Accompte avant le début du chantier : {quote?.depositAmount} %</p>

                {/* payment terms*/}
                <p>{quote?.paymentTerms}</p>

                {/* validityEndDate */}
                <p>Devis valable jusqu'au {formatDate(quote.validityEndDate)}</p>

                {/* Recovery fees => fixed by French law at 40€.  */}
                <p>Frais forfaitaires de recouvrement : {quote.recoveryFee} €</p>


                {/* right of withdrawal */} 
                {
                    (quote.hasRightOfWithdrawal) && <p>Droit de rétractation : {quote.withdrawalPeriod} jours. </p>
                }               
            </section>




 
        </>
    );
};

export default Quote;
