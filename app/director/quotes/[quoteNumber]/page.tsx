"use client";

import { useEffect, useState, use } from "react";
import { formatDate } from '@/lib/utils'
import DownloadPDF from "@/components/DownloadPDF";
import { Field, Input, Label, Legend, Radio, RadioGroup, Select } from "@headlessui/react";

// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

const Quote = ({ params }: { params: Promise<{ quoteNumber: string }>}) => {

    const [quote, setQuote] = useState<QuoteType | null>(null);
    const [company, setCompany] = useState<CompanyType | null>(null);
    const [vatAmountTravelCost, setVatAmountTravelCost] = useState<number>(0)
    const [priceTTCTravelCost, setPriceTTCTravelCost] = useState<number>(0)
    const quoteStatusChoices = ["Prêt à l'envoi","Envoyé","Accepté","Refusé"];
    const isSignedByClientChoices = ["Oui","Non"];
    const [formValues, setFormValues] = useState<FormValuesUpdateNotDraftQuote>({
        id: null,
        status: null,
        isSignedByClient: null,
        signatureDate: null,
    })

    
        useEffect(() => {
          async function fetchQuote() {
            // Params is now asynchronous. It's a Promise
            // So we need to await before access its properties
            const resolvedParams = await params;
            const quoteNumber = resolvedParams.quoteNumber;
      
            const response = await fetch(`/api/director/quotes/${quoteNumber}`);
            const data: QuoteTypeSingle = await response.json();
            setQuote(data.quote); 
            setFormValues({
                ...formValues,
                id: data.quote.id,
            });
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

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            console.log("évènement reçu : "+e)
            const { name, value } = e.target;
            console.log("select :"+name+" valeur : "+value)
            setFormValues({
                ...formValues,
                [name]: value,
            });
                  
        };
    
        //   Retrieve datas from the radio buttons. Because they are in a RadioGroup, we can't retrieve the value just thanks to an event, we have to get the name (of the group) + the value selected
        const handleRadioChange = (name: string, value: string) => {
            setFormValues((formValues) => ({
              ...formValues,
              [name]: value,
            }));
          };

        const handleSubmit = async () => {
        try{
    
            const response = await fetch(`/api/director/quotes/update/${quote?.number}`, {
                method: "PUT",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(formValues),
            });
            if (response.ok) {
                const data = await response.json();
                console.log("data renvoyés : "+data.updatedQuote)
                const updatedQuote = data.updatedQuote;
                console.log("voici le devis mis à jour : "+updatedQuote.number)
                setQuote(updatedQuote)
            }
            }catch (error) {
                console.error("Erreur lors de la mise à jour du devis :", error);
            }
    
        };
    

        if (!quote) return <div>Loading...</div>;
      
    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Devis {quote?.number}</h1>
            
            <ul>
                <li>Statut : {quote.status}</li>
                <li>Signé par le client ? {quote.isSignedByClient ? "Oui" : 'Non'}</li>
                <li>Date de signature : {quote.signatureDate ? formatDate(quote.signatureDate) : '/'}</li>

            </ul>
            {/* If the quote's status is different from draft, we can display the form */}
                {quote.status !== "draft" && (
                    <section>
                        <h2>Modifier les informations</h2>
                        <form 
                            autoComplete="off"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}
                        >
                            <div>
                                <Select
                                    name="status"
                                    onChange={handleInputChange}
                                    value={formValues.status || ""}
                                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                                >
                                <option value="">Statut</option>
                                    {quoteStatusChoices.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Field>
                                    <Legend>Le devis a t-il été signé par le client ?</Legend>
                                    <RadioGroup 
                                        name="isSignedByClient"
                                        onChange={(value)=> handleRadioChange("isSignedByClient",value)}

                                    >
                                        {isSignedByClientChoices.map((choice) => (
                                            <Field key={choice} className="flex gap-2 items-center">
                                                <Radio value={choice} className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-pink-600" />
                                                <Label>{choice}</Label>
                                            </Field>
                                        ))}
                                    </RadioGroup>
                                </Field>
                            </div>
                            <div>
                                <label htmlFor="signatureDate">Date de signature</label>
                                <Field className="w-full">
                                    <Input type="date" name="signatureDate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                                        onChange={handleInputChange}
                                    >
                                    </Input>
                                </Field>
                            </div>
                            <button type="submit">Modifier</button>
                        </form>                        
                    </section>

                )}
            <DownloadPDF quote={quote} company={company} vatAmountTravelCost={vatAmountTravelCost} priceTTCTravelCost={priceTTCTravelCost} />
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
                            console.log("taux de tva du service "+service.service.vatRate)

                            return (
                                <tr key={index}>
                                    <td>{service.service.label} - {service.service.type}</td>
                                    <td>{service.detailsService}</td>
                                    <td>{service.quantity} {service.unit}</td>
                                    <td>{service.service.unitPriceHT}</td>
                                    <td>{service.vatRate} %</td>
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
