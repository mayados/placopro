"use client";

import { useEffect, useState } from "react";
import { formatDate } from '@/lib/utils'
import DownloadPDF from "@/components/DownloadPDF";
import { Field, Input, Label, Legend, Radio, RadioGroup, Select } from "@headlessui/react";
import { fetchQuote, sendQuote, updateClassicQuote } from "@/services/api/quoteService";
import { fetchCompany } from "@/services/api/companyService";
import { updateClassicQuoteSchema } from "@/validation/quoteValidation";
import { toast } from 'react-hot-toast';
import Breadcrumb from "@/components/BreadCrumb";
import Link from "next/link";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Button from "./Button";


// import { useRouter } from "next/navigation";


type QuoteProps = {
    csrfToken: string;
    quoteSlug: string;
  };

export default function Quote({csrfToken, quoteSlug}: QuoteProps){

    const [quote, setQuote] = useState<QuoteType | null>(null);
    const [company, setCompany] = useState<CompanyType | null>(null);
    const [vatAmountTravelCost, setVatAmountTravelCost] = useState<number>(0)
    const [priceTTCTravelCost, setPriceTTCTravelCost] = useState<number>(0)
    const quoteStatusChoices = {
        READY: "Prêt à l'envoi",
        ACCEPTED: "Accepté",
        REFUSED: "Refusé",
        CANCELED: "Clos"
    };
    const isSignedByClientChoices = ["Oui","Non"];
    const [formValues, setFormValues] = useState<FormValuesUpdateNotDraftQuote>({
        id: null,
        status: null,
        isSignedByClient: null,
        signatureDate: null,
    })
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    
        useEffect(() => {
            async function loadQuote() {

                try{
                    const data = await fetchQuote(quoteSlug)
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
                }catch (error) {
                    console.error("Impossible to load the quote :", error);
                }
            }

            async function loadCompany() {
                try{
                    const companySlug = "placopro";
                    const data = await fetchCompany(companySlug)
                    setCompany(data.company); 
                }catch (error) {
                    console.error("Impossible to load the quote :", error);
                }
            }
      
          loadQuote();
          loadCompany()
        }, [quoteSlug, csrfToken]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            console.log("évènement reçu : "+e)
            const { name, value } = e.target;
            console.log("select :"+name+" valeur : "+value)
            setFormValues({
                ...formValues,
                [name]: value,
            });
                  
        };

        const sendQuoteToClient = async(quoteSlug: string, emailClient: string) => {
          
              try {

                const data = await sendQuote(quoteSlug, emailClient, csrfToken);

                toast.success("Devis envoyé avec succès");

              } catch (error) {
                toast.error("Erreur lors de l'envoi du devis")
              }
        };
    
        //   Retrieve datas from the radio buttons. Because they are in a RadioGroup, we can't retrieve the value just thanks to an event, we have to get the name (of the group) + the value selected
        const handleRadioChange = (name: string, value: string) => {
            setFormValues((formValues) => ({
              ...formValues,
              [name]: value,
            }));
          };

        const handleQuoteUpdateClassic = async () => {

            if(!quote?.number){
                return
            }        
        
            try{

                // Validation des données du formulaire en fonction du statut
                const validationResult = updateClassicQuoteSchema.safeParse(formValues);

                if (!validationResult.success) {
                    // Si la validation échoue, afficher les erreurs
                    console.error("Erreurs de validation :", validationResult.error.errors);
                        // Transformer les erreurs Zod en un format utilisable dans le JSX
                    const formattedErrors = validationResult.error.flatten().fieldErrors;

                    // Afficher les erreurs dans la console pour débogage
                    console.log(formattedErrors);
                
                    // Mettre à jour l'état avec les erreurs
                    setErrors(formattedErrors);
                    return;  // Ne pas soumettre si la validation échoue
                }

                // Delete former validation errors
                setErrors({})

                const data = await updateClassicQuote(quote.slug,formValues, csrfToken)
                const updatedQuote = data;
                console.log("voici le devis mis à jour : "+updatedQuote.number)
                setQuote(updatedQuote)
                toast.success("Devis mis à jour avec succès");
       
                
            }catch (error) {
                toast.error("Erreur lors de la mise à jour du devis ");
                
                console.error("Erreur lors de la mise à jour du devis :", error);
            }
    
        };
    

        if (!quote) return <div>Loading...</div>;

        console.log("backups des elements : "+JSON.stringify(quote.elementsBackup))


        return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Devis {quote?.number}</h1>
                <Breadcrumb
                    items={[
                        { label: "Tableau de bord", href: "/director" },
                        { label: "Devis", href: "/director/quotes" },
                        { label: `${quote.number}` }, 
                    ]}
                />
            <ul>
                <li>Statut : {quote.status}</li>
                <li>Signé par le client ? {quote.isSignedByClient ? "Oui" : 'Non'}</li>
                <li>Date de signature : {quote.signatureDate ? formatDate(quote.signatureDate) : '/'}</li>

            </ul>
            {/* If the quote's status is different from draft, we can display the form */}
                {quote.status !== "DRAFT" && (
                    <section>
                        <h2>Modifier les informations</h2>
                        <form 
                            autoComplete="off"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleQuoteUpdateClassic();
                            }}
                        >
                            <div>
                                <Select
                                    name="status"
                                    onChange={handleInputChange}
                                    value={formValues.status || ""}
                                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                                >
                                    <option value="" >Statut du devis</option>
                                    {Object.entries(quoteStatusChoices).map(([value, label]) => (
                                        <option key={value} value={value}>
                                        {label}
                                        </option>
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
                            <Input type="hidden" name="csrf_token" value={csrfToken} />
                            
                            <button type="submit">Modifier</button>
                        </form>                        
                    </section>

                )}
            <Link href={`/director/bills/create/${quote?.number}`}>
                Créer une facture finale
            </Link>
            <Link href={`/director/bills/create-deposit/${quote?.number}`}>
                Créer une facture d'acompte
            </Link>
            <DownloadPDF quote={quote} company={company as CompanyType} vatAmountTravelCost={vatAmountTravelCost} priceTTCTravelCost={priceTTCTravelCost} />
            <Button label="Envoyer le devis au client" icon={faPaperPlane} type="button" action={() => sendQuoteToClient(quote.slug, quote.client.mail)} specifyBackground="text-red-500" />

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
                        <p>{quote?.clientBackup?.name} {quote?.clientBackup?.firstName}</p>
                        <p>{quote?.clientBackup?.addressNumber} {quote?.clientBackup?.road} {quote?.clientBackup?.postalCode} {quote?.clientBackup?.city} {quote?.clientBackup?.additionalAddress}</p>
                    </div>
                </div>
            </section>
            <section>
                <p>Chantier : {quote?.workSiteBackup?.addressNumber} {quote?.workSiteBackup?.road} {quote?.workSiteBackup?.postalCode} {quote?.workSiteBackup?.city} {quote?.workSiteBackup?.additionalAddress}</p>
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
                        {quote?.servicesBackup?.map((service, index) => {


                            return (
                                <tr key={index}>
                                    <td>{service.label} - {service.type}</td>
                                    <td>{service.detailsService}</td>
                                    <td>{service.quantity} {service.unit}</td>
                                    <td>{service.unitPriceHT}</td>
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
                                {quote.elementsBackup?.priceHT} €
                            </td>
                            <td>
                                {quote.elementsBackup?.vatAmount} €
                            </td>
                            <td>
                                {quote.elementsBackup?.priceTTC} €
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
}