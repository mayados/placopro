"use client";

import { useState } from "react";
import { formatDate } from '@/lib/utils'
import DownloadPDF from "@/components/DownloadPDF";
import { Field, Input, Label, Legend, Radio, RadioGroup, Select } from "@headlessui/react";
import { sendQuote, updateClassicQuote } from "@/services/api/quoteService";
import { updateClassicQuoteSchema } from "@/validation/quoteValidation";
import { toast } from 'react-hot-toast';
import Breadcrumb from "@/components/BreadCrumb";
import Link from "next/link";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import Button from "./Button";


// import { useRouter } from "next/navigation";


type QuoteProps = {
    csrfToken: string;
    quote: QuoteType;
    company: CompanyType;
};

export default function Quote({ csrfToken, quote: initialQuote, company: initialCompany }: QuoteProps) {
    console.log("token dans le colmposant : " + csrfToken)
    const [quote, setQuote] = useState<QuoteType | null>(initialQuote);
    const [company] = useState<CompanyType | null>(initialCompany);
    const [vatAmountTravelCost] = useState<number>(0)
    const [priceTTCTravelCost] = useState<number>(0)
    const quoteStatusChoices = {
        READY: "Prêt à l'envoi",
        ACCEPTED: "Accepté",
        REFUSED: "Refusé",
        CANCELED: "Clos"
    };
    const isSignedByClientChoices = ["Oui", "Non"];
    const [formValues, setFormValues] = useState<FormValuesUpdateNotDraftQuote>({
        status: null,
        isSignedByClient: null,
        signatureDate: null,
    })
    const [, setErrors] = useState<{ [key: string]: string[] }>({});


    // useEffect(() => {
    //     async function loadQuote() {

    //         try{
    //             const data = await fetchQuote(quoteSlug)
    //             setQuote(data.quote); 
    //             setFormValues({
    //                 ...formValues,
    //                 id: data.quote.id,
    //             });
    //             if(data.quote.travelCosts){
    //                 // travelCosts cost => vatAmount and priceTTC
    //                 setVatAmountTravelCost((data.quote.travelCosts) * (20/100))  
    //                 setPriceTTCTravelCost((data.quote.travelCosts) + vatAmountTravelCost )            
    //             }
    //         }catch (error) {
    //             console.error("Impossible to load the quote :", error);
    //         }
    //     }

    //     async function loadCompany() {
    //         try{
    //             const companySlug = "placopro";
    //             const data = await fetchCompany(companySlug)
    //             setCompany(data.company); 
    //         }catch (error) {
    //             console.error("Impossible to load the quote :", error);
    //         }
    //     }

    //   loadQuote();
    //   loadCompany()
    // }, [quoteSlug, csrfToken]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        console.log("évènement reçu : " + e)
        const { name, value } = e.target;
        console.log("select :" + name + " valeur : " + value)
        setFormValues({
            ...formValues,
            [name]: value,
        });

    };

    const sendQuoteToClient = async (quoteSlug: string, emailClient: string) => {

        try {

            await sendQuote(quoteSlug, emailClient, csrfToken);

            toast.success("Devis envoyé avec succès");

        } catch {
            toast.error("Erreur lors de l'envoi du devis")
        }
    };

    //   Retrieve datas from the radio buttons. Because they are in a RadioGroup, we can't retrieve the value just thanks to an event, we have to get the name (of the group) + the value selected
    const handleRadioChange = (name: string, value: string) => {
        const boolValue = value === "Oui" ? true : false;
        setFormValues((formValues) => ({
            ...formValues,
            [name]: boolValue,
        }));
    };

    const handleQuoteUpdateClassic = async () => {

        if (!quote?.number) {
            return
        }

        console.log("données de formulaire : " + JSON.stringify(formValues))
        try {

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
            const data = await updateClassicQuote(quote.slug, formValues, csrfToken)
            const updatedQuote = data;
            console.log("voici le devis mis à jour : " + updatedQuote.number)
            setQuote(updatedQuote)
            toast.success("Devis mis à jour avec succès");


        } catch (error) {
            toast.error("Erreur lors de la mise à jour du devis ");

            console.error("Erreur lors de la mise à jour du devis :", error);
        }

    };


    if (!quote) return <div>Loading...</div>;

    console.log("backups des elements : " + JSON.stringify(quote.elementsBackup))


    return (
        <>
            <Breadcrumb
                items={[
                    { label: "Tableau de bord", href: "/director" },
                    { label: "Devis", href: "/director/quotes" },
                    { label: `${quote.number}` },
                ]}
            />
            <article className="max-w-5xl mx-auto p-6 bg-custom-white rounded-2xl shadow-md space-y-8">
                <header className="text-center mb-6">

                    <h1 className="text-3xl font-bold text-primary">Devis {quote?.number}</h1>
                </header>
                {/* Boutons de création, téléchargement et envoi repositionnés */}
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                    <Link
                        href={`/director/bills/create/${quote?.number}`}
                        className="py-2 px-3 bg-secondary rounded text-custom-gray hover:bg-secondary/90 transition"
                    >
                        Créer une facture finale
                    </Link>
                    <Link
                        href={`/director/bills/create-deposit/${quote?.number}`}
                        className="py-2 px-3 bg-secondary rounded text-custom-gray hover:bg-secondary/90 transition"
                    >
                        Créer une facture d&apos;acompte
                    </Link>
                    <DownloadPDF
                        quote={quote}
                        company={company as CompanyType}
                        vatAmountTravelCost={vatAmountTravelCost}
                        priceTTCTravelCost={priceTTCTravelCost}
                    />
                    <Button
                        label="Envoyer le devis au client"
                        icon={faPaperPlane}
                        type="button"
                        action={() => sendQuoteToClient(quote.slug, quote.clientBackup!.mail)}
                        specifyBackground="bg-primary text-black"
                    />
                </div>
                <section className="space-y-2">
                    <ul className="text-gray-800">
                        <li>Statut : {quote.status}</li>
                        <li>Signé par le client ? {quote.isSignedByClient ? "Oui" : 'Non'}</li>
                        <li>Date de signature : {quote.signatureDate ? formatDate(quote.signatureDate) : '/'}</li>

                    </ul>
                </section>

                {/* If the quote's status is different from draft, we can display the form */}
                {quote.status !== "DRAFT" && (
                    <section>
                        <h2 className="text-xl font-semibold text-custom-gray mb-3">Modifier les informations</h2>
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
                                        onChange={(value) => handleRadioChange("isSignedByClient", value)}

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

                            <button type="submit" className="mt-3 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition">
                                Modifier
                            </button>
                        </form>
                    </section>

                )}
                {/* <div><Toaster /></div> */}
                <section className="grid sm:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-lg font-semibold text-custom-gray">Émetteur</h2>

                        <p>{company?.name}</p>
                        <p>Téléphone : {company?.phone}</p>
                        <p>Email : {company?.mail}</p>
                        <p>Adresse : {company?.addressNumber} {company?.road} {company?.city} {company?.postalCode} {company?.additionnalAddress}</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-custom-gray">Adressé à</h2>

                        <p>{quote?.clientBackup?.name} {quote?.clientBackup?.firstName}</p>
                        <p>{quote?.clientBackup?.addressNumber} {quote?.clientBackup?.road} {quote?.clientBackup?.postalCode} {quote?.clientBackup?.city} {quote?.clientBackup?.additionalAddress}</p>
                    </div>
                </section>

                <section className="space-y-2">
                    <h2 className="text-lg font-semibold text-custom-gray">Chantier</h2>
                    <p>{quote?.workSiteBackup?.addressNumber} {quote?.workSiteBackup?.road} {quote?.workSiteBackup?.postalCode} {quote?.workSiteBackup?.city} {quote?.workSiteBackup?.additionalAddress}</p>
                    <p>Date de début estimée : {formatDate(quote.workStartDate)}</p>
                    <p>Date de fin estimée : {formatDate(quote.estimatedWorkEndDate)}</p>
                    <p>Durée estimée des travaux : {quote.estimatedWorkDuration} jours</p>
                    {/* Totals */}
                </section>
                <section>
                    <h2 className="text-lg font-semibold text-custom-gray mb-2">Total</h2>
                    {/* Total du devis  */}
                    <table className="w-full table-auto border border-gray-300 text-custom-gray">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2">Total HT</th>
                                <th>TVA totale</th>
                                <th>Total TTC</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t text-center">
                                <td className="p-2">{quote.elementsBackup?.priceHT} €</td>
                                <td>{quote.elementsBackup?.vatAmount} €</td>
                                <td>{quote.elementsBackup?.priceTTC} €</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                <section className="space-y-1 text-gray-800">

                    {/* issuedDate */}
                    <p>Devis créé le {formatDate(quote.issueDate)}</p>

                    {/* Deposit amount (in %) */}
                    <p>Accompte avant le début du chantier : {quote?.depositAmount} %</p>

                    {/* payment terms*/}
                    <p>{quote?.paymentTerms}</p>

                    {/* validityEndDate */}
                    <p>Devis valable jusqu&apos;au {formatDate(quote.validityEndDate)}</p>

                    {/* Recovery fees => fixed by French law at 40€.  */}
                    <p>Frais forfaitaires de recouvrement : {quote.recoveryFee} €</p>


                    {/* right of withdrawal */}
                    {
                        (quote.hasRightOfWithdrawal) && <p>Droit de rétractation : {quote.withdrawalPeriod} jours. </p>
                    }
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-custom-gray mb-2">Factures liées</h2>
                    {quote?.bills?.length > 0 && (
            <table className="w-full table-auto border border-gray-300 text-custom-gray text-center">
            <thead className="bg-gray-100">

                <tr>
                  <th className="p-2">Numéro</th>
                  <th className="p-2">Lien</th>
                </tr>
              </thead>
              <tbody>
                {quote.bills.map((bill, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{bill.number}</td>
                    <td className="p-2">
                      <Link href={`/director/bills/${bill?.number}`} className="text-primary hover:underline">
                        Consulter les détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
)}

                </section>


            </article>
        </>

    );
}