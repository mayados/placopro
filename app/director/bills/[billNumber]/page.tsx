"use client";

import { useEffect, useState, use } from "react";
import { formatDate } from '@/lib/utils'
import DownloadBillPDF from "@/components/DownloadBillPDF";
import { Field, Input, Label, Legend, Radio, RadioGroup, Select } from "@headlessui/react";
import { fetchBill, updateClassicBill } from "@/services/api/billService";
import { fetchCompany } from "@/services/api/companyService";

// import toast, { Toaster } from 'react-hot-toast';
// import { useRouter } from "next/navigation";

const Bill = ({ params }: { params: Promise<{ billNumber: string }>}) => {

    const [bill, setBill] = useState<BillType | null>(null);
    const [company, setCompany] = useState<CompanyType | null>(null);
    const [vatAmountTravelCost, setVatAmountTravelCost] = useState<number>(0)
    const [priceTTCTravelCost, setPriceTTCTravelCost] = useState<number>(0)
    const billStatusChoices = ["Prêt à l'envoi","Envoyé","Clos","Payé"];
    const isPaidByClientChoices = ["Oui","Non"];
    const [formValues, setFormValues] = useState<FormValuesUpdateNotDraftBill>({
        id: null,
        status: null,
        paymentDate: null,
    })

    
        useEffect(() => {
            async function loadBill() {
                // Params is now asynchronous. It's a Promise
                // So we need to await before access its properties
                const resolvedParams = await params;
                const billNumber = resolvedParams.billNumber;

                try{
                    const data = await fetchBill(billNumber)
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
                    setCompany(data.company); 
                }catch (error) {
                    console.error("Impossible to load the bill :", error);
                }
            }
      
          loadBill();
          loadCompany()
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

        const handleBillUpdateClassic = async () => {

            if(!bill?.number){
                return
            }        
        
            try{

                const data = await updateClassicBill(bill.number,formValues)
                const updatedBill = data;
                console.log("voici la facture mis à jour : "+updatedBill.number)
                setBill(updatedBill)
                
            }catch (error) {
                console.error("Erreur lors de la mise à jour du devis :", error);
            }
    
        };
    

        if (!bill) return <div>Loading...</div>;

        bill?.services.map((service, index) => (
            console.log(  service.service.quotes?.[0]?.totalHT ?? "Pas de totalHT disponible"
            )
        ))

    return (
        <>
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Facture {bill?.number}</h1>
            
            <ul>
                <li>Statut : {bill.status}</li>
                <li>Date de paiement : {bill.paymentDate ? formatDate(bill.paymentDate) : '/'}</li>

            </ul>
            {/* If the bill's status is different from draft, we can display the form */}
                {bill.status !== "draft" && (
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
                                    value={formValues.status || ""}
                                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                                >
                                <option value="">Statut</option>
                                    {billStatusChoices.map((status) => (
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
                                        {isPaidByClientChoices.map((choice) => (
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
            <DownloadBillPDF bill={bill} company={company} vatAmountTravelCost={vatAmountTravelCost} priceTTCTravelCost={priceTTCTravelCost} />
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
                        <p>{bill?.client.name} {bill?.client.firstName}</p>
                        <p>{bill?.client.addressNumber} {bill?.client.road} {bill?.client.postalCode} {bill?.client.city} {bill?.client.additionalAddress}</p>
                    </div>
                </div>
            </section>
            <section>
                <p>Chantier : {bill?.workSite.addressNumber} {bill?.workSite.road} {bill?.workSite.postalCode} {bill?.workSite.city} {bill?.workSite.additionnalAddress}</p>
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
                        <th>Montant de tva sur l'acompte</th>
                        <td>Total Ht service</td>
                        {/* <th>Acompte HT sur service</th>
                        <th>Acompte TTC sur service</th> */}

                    </tr>
                    </thead>
                    <tbody>
                    {/* bill.services => billService */}
                    {bill?.services.map((service, index) => (
                        <tr key={index}>
                        <td>{service.service.label} - {service.service.type}</td>
                        <td>{service.detailsService}</td>
                        <td>{service.quantity} {service.unit}</td>
                        <td>{service.service.unitPriceHT}</td>
                        <td>{service.vatRate} %</td>
                        <td>{service.vatAmount}</td>
                        <td>
                            {service.service.quotes
                                ?.find(qs => qs.id === bill.quote.id)?.totalHT ?? "N/A"} €
                        </td>
                        {/* <td>{service.totalHT}</td>
                        <td>{service.totalTTC}</td> */}
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
                    {bill?.services.map((service, index) => {
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
                                    {bill.totalHt} €
                                </td>
                                <td>
                                    {bill.vatAmount} €
                                </td>
                                <td>
                                    {bill.totalTtc} €
                                </td>
                            </tr>
                        </tbody>
                    </table>


            </section>
            <section>
                {/* issuedDate */}
                <p>Devis créé le {formatDate(bill.issueDate)}</p>

                {/* Deposit amount (in %) */}
                <p>Accompte avant le début du chantier : {bill?.quote.depositAmount} €</p>

                {/* payment terms*/}
                <p>{bill?.paymentTerms}</p>

                {/* validityEndDate */}
                <p>Devis valable jusqu'au {formatDate(bill.dueDate)}</p>

        

              
            </section>




 
        </>
    );
};

export default Bill;
