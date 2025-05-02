"use client";

import { useEffect, useState } from "react";
import { formatDate, formatDateToInput } from '@/lib/utils'
import DownloadBillPDF from "@/components/DownloadBillPDF";
import { Field, Input, Select } from "@headlessui/react";
import { fetchBill, updateClassicBill } from "@/services/api/billService";
import { fetchCompany } from "@/services/api/companyService";
import Link from "next/link";
import { updateClassicBillSchema } from "@/validation/billValidation";


// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";


type BillProps = {
    csrfToken: string;
    billSlug: string;
  };

export default function Bill({billSlug,csrfToken}: BillProps){


    const [bill, setBill] = useState<BillType | null>(null);
    const [company, setCompany] = useState<CompanyType | null>(null);
    const [vatAmountTravelCost, setVatAmountTravelCost] = useState<number>(0)
    const [priceTTCTravelCost, setPriceTTCTravelCost] = useState<number>(0)
    const billStatusChoices = 
    {
        READY: "Prêt à l'envoi",
        SENT: "Envoyé",
        CANCELED: "Clos"
    };
    const paymentMethodChoices =
    {
        CREDIT_CARD: "Carte bancaire",
        BANK_TRANSFER: "Virement",
        CASH: "Espèces",
        CHECK: "Chèque"
    };
    const [formValues, setFormValues] = useState<FormValuesUpdateNotDraftBill>({
        id: null,
        status: null,
        paymentDate: null,
        paymentMethod: null,
        canceledAt: null,
    })
    // For zod validation errors
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    

    
        useEffect(() => {
            async function loadBill() {
                // Params is now asynchronous. It's a Promise
                // So we need to await before access its properties
                // const resolvedParams = await params;
                // const billNumber = resolvedParams.billNumber;

                try{
                    const data = await fetchBill(billSlug)
                    setBill(data.bill); 
                    setFormValues({
                        ...formValues,
                        id: data.bill.id,
                    });
                    if(data.bill.travelCosts){
                        // travelCosts cost => vatAmount and priceTTC
                        setVatAmountTravelCost((data.bill.travelCosts) * (20/100))  
                        setPriceTTCTravelCost((data.bill.travelCosts) + vatAmountTravelCost )            
                    }
                }catch (error) {
                    console.error("Impossible to load the bill :", error);
                }
            }

            async function loadCompany() {
                try{
                    const companySlug = "placopro";
                    const data = await fetchCompany(companySlug)
                    setCompany(data); 
                }catch (error) {
                    console.error("Impossible to load the bill :", error);
                }
            }
      
          loadBill();
          loadCompany()
        }, [billSlug, csrfToken]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            console.log("évènement reçu : "+e)
            const { name, value } = e.target;
            console.log("select :"+name+" valeur : "+value)
            setFormValues({
                ...formValues,
                [name]: value,
            });
                  
        };
        

        const handleBillUpdateClassic = async () => {

            if(!bill?.number){
                return
            }        
        
            try{

                            // Validation des données du formulaire en fonction du statut
            const validationResult = updateClassicBillSchema.safeParse(formValues);

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

                const data = await updateClassicBill(bill.slug,formValues, csrfToken)
                const updatedBill = data;
                console.log("voici la facture mis à jour : "+updatedBill.number)
                setBill(updatedBill)
                
            }catch (error) {
                console.error("Erreur lors de la mise à jour du devis :", error);
            }
    
        };
    

        if (!bill) return <div>Loading...</div>;

        bill?.services.map((service) => (
            console.log(  service.service.quotes?.[0]?.totalHT ?? "Pas de totalHT disponible"
            )
        ))



    return (
        <>
            <h1 className="text-3xl text-white ml-3 text-center">  
                {bill.billType === "DEPOSIT" 
                    ? `Facture d'acompte n° ${bill.number}`  
                    : `Facture n° ${bill.number}`}
            </h1>
            
            <ul>
                <li>Statut : {bill.status}</li>
                <li>Date de paiement : {bill.paymentDate ? formatDate(bill.paymentDate) : '/'}</li>

            </ul>
            {/* If the bill's status is different from draft, we can display the form */}
                {bill.status !== "DRAFT" && (
                    <section>
                        <h2>Modifier les informations</h2>
                        <form 
                            autoComplete="off"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleBillUpdateClassic();
                            }}
                        >
                            <div>
                                <Select
                                    name="status"
                                    onChange={handleInputChange}
                                    value={formValues.status ?? bill.status ?? ""}
                                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                                >
                                {/* <option value="" disabled>Statut</option>
                                    {billStatusChoices.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))} */}
                                    <option value="" >Statut de la facture</option>
                                    {Object.entries(billStatusChoices).map(([value, label]) => (
                                        <option key={value} value={value}>
                                        {label}
                                        </option>
                                    ))}
                                </Select>
                                {errors.status && <p style={{ color: "red" }}>{errors.status}</p>}

                            </div>
                            <div>
                                <label htmlFor="paymentDate">Date de paiement facture</label>
                                <Field className="w-full">
                                    <Input type="date" name="paymentDate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                                            value={
                                                formValues.paymentDate 
                                                ? formatDateToInput(formValues.paymentDate) 
                                                : bill.paymentDate 
                                                ? formatDateToInput(bill.paymentDate) 
                                                : ""
                                            }
                                        onChange={handleInputChange}
                                    >
                                    </Input>
                                </Field>
                                {errors.paymentDate && <p style={{ color: "red" }}>{errors.paymentDate}</p>}

                            </div>
                            <div>
                                <Select
                                    name="paymentMethod"
                                    onChange={handleInputChange}
                                    value={formValues.paymentMethod ?? bill.paymentMethod ?? ""}
                                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                                >
                                {/* <option value="" >Méthode de paiement</option>
                                    {paymentMethodChoices.map((methode) => (
                                        <option key={methode} value={methode}>{methode}</option>
                                    ))} */}
                                    <option value="" disabled>-- Sélectionner une méthode de paiement --</option>
                                    {Object.values(paymentMethodChoices).map(([value,label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                    ))}
                                </Select>
                                {errors.paymentMethod && <p style={{ color: "red" }}>{errors.paymentMethod}</p>}

                            </div>
                            <div>
                                <label htmlFor="canceledAt">Clos le (= abandonnée)</label>
                                <Field className="w-full">
                                    <Input type="date" name="canceledAt" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                                            value={
                                                formValues.canceledAt 
                                                ? formatDateToInput(formValues.canceledAt) 
                                                : bill.canceledAt 
                                                ? formatDateToInput(bill.canceledAt) 
                                                : ""
                                            }
                                        onChange={handleInputChange}
                                    >
                                    </Input>
                                </Field>
                                {errors.canceledAt && <p style={{ color: "red" }}>{errors.canceledAt}</p>}
                            </div>
                            <Input type="hidden" name="csrf_token" value={csrfToken} />

                            <button type="submit">Modifier</button>
                        </form>                        
                    </section>

                )}
            <DownloadBillPDF bill={bill} company={company as CompanyType} vatAmountTravelCost={vatAmountTravelCost} priceTTCTravelCost={priceTTCTravelCost} />
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
                        <p>{bill?.clientBackup?.name} {bill?.clientBackup?.firstName}</p>
                        <p>{bill?.clientBackup?.addressNumber} {bill?.clientBackup?.road} {bill?.clientBackup?.postalCode} {bill?.clientBackup?.city} {bill?.clientBackup?.additionalAddress}</p>
                    </div>
                </div>
            </section>
            <section>
                <p>Chantier : {bill?.workSiteBackup?.addressNumber} {bill?.workSiteBackup?.road} {bill?.workSiteBackup?.postalCode} {bill?.workSiteBackup?.city} {bill?.workSiteBackup?.additionalAddress}</p>
                <p>Date de début estimée : {formatDate(bill.workStartDate)}</p>
                <p>Date de fin estimée : {formatDate(bill.workEndDate)}</p>
                <p>Durée estimée des travaux : {bill.workDuration} jours</p>

                {/* Vérifier si la facture est de type DEPOSIT ou non */}
                {bill?.billType === "DEPOSIT" ? (
                // Afficher le tableau pour une facture d'acompte
                <table>
                    <thead>
                    <tr>
                            <th>Service</th>
                        <th>Description</th>
                        <th>Quantité</th>
                        <th>Prix Unitaire</th>
                        <th>taux TVA</th>
                        <th>Montant de tva sur l&aposacompte</th>
                        <td>Total Ht service</td>

                    </tr>
                    </thead>
                    <tbody>
                    {/* bill.services => billService */}
                    {(bill?.servicesBackup)?.map((service, index) => (
                        <tr key={index}>
                        <td>{service.label} - {service.type}</td>
                        <td>{service.detailsService}</td>
                        <td>{service.quantity} {service.unit}</td>
                        <td>{service.unitPriceHT}</td>
                        <td>{service.vatRate} %</td>
                        <td>{service.vatAmount}</td>
                        <td>
                            {service.totalHT} €
                        </td>

                        </tr>
                    ))}
                    </tbody>
                </table>
                ) : (
                // Afficher le tableau pour une facture normale
                <table>
                    <thead>
                    <tr>
                        <th>Service</th>
                        <th>Description</th>
                        <th>Quantité</th>
                        <th>Prix Unitaire</th>
                        <th>TVA</th>
                        <th>Montant TVA</th>
                        <th>Prix HT</th>
                        <th>Prix TTC</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* bill.services => billService */}
                    {bill?.servicesBackup?.map((service, index) => {

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
                )}
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
                                {bill?.travelCosts} €
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
                {/* Total facture  */}
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
                                    {bill.elementsBackup?.totalHt} €
                                </td>
                                <td>
                                    {bill.elementsBackup?.vatAmount} €
                                </td>
                                <td>
                                    {bill.elementsBackup?.totalTtc} €
                                </td>
                            </tr>
                        </tbody>
                    </table>


            </section>
            <section>
                {/* issuedDate */}
                <p>Facture créée le {formatDate(bill.issueDate)}</p>

                {/* Deposit amount (in %) */}
                <p>Accompte avant le début du chantier : {bill?.quote.depositAmount} €</p>

                {/* payment terms*/}
                <p>{bill?.paymentTerms}</p>

                {/* validityEndDate */}
                <p>Facture à payer avant le {formatDate(bill.dueDate)}</p>

        

              
            </section>
        <section>
            <table>
                <tbody>
                    {bill?.creditNotes.map((creditNote, index) => (
                                <tr key={index}>
                                <td>{creditNote.reason}</td>
                                <td>{creditNote.isSettled}</td>
                                <td>
                                    <Link href={`/director/creditNotes/${creditNote?.number}`}>
                                                    Consulter les détails
                                    </Link>
                                </td>

                                </tr>
                            ))}                    
                </tbody>
            </table>

        </section>



 
        </>
    );
};


