"use client";

import { useEffect, useState } from "react";
import { Field,Input,Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
// import { fetchbill, updateInvoiceDraftBill } from "@/services/api/bill/Service";
import { fetchVatRates } from "@/services/api/vatRateService";
import { fetchUnits } from "@/services/api/unitService";
import { fetchSuggestions } from "@/services/api/suggestionService";
import { fetchBill, updateDraftBill } from "@/services/api/billService";
import { updateDraftBillSchema, updateDraftFinalBillSchema } from "@/validation/billValidation";
import { toast } from 'react-hot-toast';
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type UpdateBillProps = {
    csrfToken: string;
    billSlug: string;
  };

export default function UpdateBill({csrfToken, billSlug}: UpdateBillProps){

    const [bill, setBill] = useState<BillType>();
    const [updateBillFormValues, setUpdateBillFormValues] = useState<UpdatedBillFormValueType>({
        dueDate: null,
        natureOfWork: null,
        paymentTerms: "Le paiement doit être effectué dans les 30 jours suivant la réception de la facture.",
        travelCosts: null,
        travelCostsType: null,
        description: null,
        vatAmount: null,
        totalTtc: null,
        totalHt: null,
        clientId: null as string | null,
        services: [],
        servicesToUnlink: [],
        servicesAdded: [],
        serviceType: null,
        workSiteId: null as string | null,
        // client: null,
        billId: null as string | null,
        status: null,
        number: null,
        discountAmount: null,
        workStartDate: null,
        workEndDate: null,
        workDuration: null,
        // isDiscountFromQuote: false,
        quoteId: null,
        discountReason: null,
    })
    // Define options for select for services
    const serviceTypeChoices = ["plâtrerie","Peinture"];
    const travelCostsTypeChoices = ["forfait unique","forfait journalier"];
    const discountReasonChoices = ["fidélité","offre spéciale"];
    const [vatRateChoices, setVatRateChoices] = useState<VatRateChoiceType[]>([])
    const [unitChoices, setUnitChoices] = useState<UnitChoiceType[]>([])
    // Allows to know if a bill is registered as a draft or ready (to be send)
    // const [status, setStatus] = useState<"Draft" | "Ready">("Draft");
    const [isOpen, setIsOpen] = useState(false);
    // for zod validation errors
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    

    // cont which allows redirection
    const router = useRouter();
    // Display suggestions for : service, unit, vatRate, client, worksite 
    // const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestionType[] | null>(null)
    const [servicesSuggestions, setServiceSuggestions] = useState<ServiceSuggestionType[] | null>(null)
    // text visible in the client field
    // const [clientInput, setClientInput] = useState(""); 
    const [, setUnitInput] = useState(""); 
    const [, setVatRateInput] = useState(""); 
    // const [serviceInput, setServiceInput] = useState(""); 


    useEffect(() => {
        console.log("Mon composant est monté !");

        // The Bill here is generated from a bill?, so we need to get the bill?
        async function loadBill() {

                try{
                    const data = await fetchBill(billSlug)
                    // let isDiscountFrombill = false
                  
                    setUpdateBillFormValues({
                        ...updateBillFormValues,
                        number: data.bill.number,
                        totalTtc: data.bill.totalTtc,
                        totalHt: data.bill.totalHt,
                        clientId: data.bill.client.id,
                        workSiteId: data.bill.workSite.id,
                        billId: data.bill.id,
                        // isDiscountFromQuote: data.bill.isDiscountFromQuote,
                        discountReason: data.bill.discountReason,
                        discountAmount: data.bill.discountAmount,
                        travelCosts: data.bill.travelCosts,
                        travelCostsType: data.bill.travelCostsType,
                        vatAmount: data.bill.vatAmount,
                        natureOfWork: data.bill.natureOfWork,
                        description: data.bill.description,
                        // services: data.bill.services
                        services: data.bill.services.map(service => ({
                            id: service.id,
                            label: service.service.label, // Accès à `label` à l'intérieur de `service`
                            unitPriceHT: service.service.unitPriceHT?.toString() || "", // Assurer que c'est une string
                            type: service.service.type || "",
                            unit: service.unit || "",
                            vatRate: service.vatRate || "",
                            selectedFromSuggestions: false, // Ajout d'un champ par défaut si nécessaire
                            quantity: service.quantity || 0,
                            detailsService: service.detailsService || "",

    
                        }))
                    });
                      setBill(data.bill);

                }catch (error) {
                    console.error("Impossible to load the bill :", error);
                }
        }

        const loadVatRates = async () => {
                try{
                    const data = await fetchVatRates();
                    setVatRateChoices(data)

                }catch (error) {
                    console.error("Impossible to load VAT rates :", error);
                    }
        };

        const loadUnits = async () => {
                try{
                    const data = await fetchUnits();
                    setUnitChoices(data)
            
                }catch (error) {
                    console.error("Impossible to load units :", error);
                }     
        };

        loadBill();
        loadVatRates();
        loadUnits();
    },[billSlug, csrfToken]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        console.log("évènement reçu : "+e)
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setUpdateBillFormValues({
            ...updateBillFormValues,
            // Allow to delete completely the value contained in the field 
            [name]:value === "" ? "" : value
        });

        if(name === "unit"){
            setUnitInput(value)
        }else if(name === "vatRate"){
            setVatRateInput(value)
        }
    }

    //   Retrieve datas from the radio buttons. Because they are in a RadioGroup, we can't retrieve the value just thanks to an event, we have to get the name (of the group) + the value selected
    // const handleRadioChange = (name: string, value: string) => {
    //     setUpdateBillFormValues({
    //         ...updateBillFormValues,
    //         [name]: value,
    //     });
    // }


    const handleBillUpdate = async (statusReady?: string) => {
        console.log("La facture crééé : "+JSON.stringify(updateBillFormValues.servicesToUnlink))
        console.log("Le bill? intial : "+JSON.stringify(bill?.services))        
        console.log("lors du submit, le status est : "+statusReady)

        const status = statusReady ? "READY": "DRAFT"
        const billId = bill?.id

        try{
            const updateBillWithStatus = {
                ...updateBillFormValues,
                status,
                billId,
            };

            if(!bill?.number){
                return
            }

            // Choisir le schéma de validation en fonction du statut
            const schema = statusReady === "READY" ? updateDraftFinalBillSchema : updateDraftBillSchema;

            // Validation des données du formulaire en fonction du statut
            const validationResult = schema.safeParse(updateBillFormValues);

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

            const data = await updateDraftBill(bill.slug,updateBillWithStatus,csrfToken)
            console.log("data renvoyés : "+data)
            const createdBill = data;
            console.log("voici la bill crééé : "+createdBill.number)
            console.log("status du devis updaté "+createdBill.status)
            toast.success("Facture mise à jour avec succès");
            
            try {
                if(createdBill.status === "DRAFT"){
                    // Redirect to the page of bill's update
                    router.push(`/director/bills/${createdBill.number}/update`);                        
                }else{
                    router.push(`/director/bills/${createdBill.number}`);                        
                }

            } catch (err) {
                console.error("Redirection failed :", err);
            }

        }catch(error){
            toast.error("Erreur lors de la modification de la facture");
            console.error("Impossible to create the bill :", error);
        }
    }

    // console.log("Les services de la facture à créer : "+JSON.stringify(updateBillFormValues.services))

    // console.log("Les services du bill? : "+JSON.stringify(updateBillFormValues.services))


    const openChoiceDialog = () => {
        setIsOpen(true);  
        console.log("la fenetre de dialog devrait être ouverte")
        
    };

    const closeChoiceDialog = () => {
        setIsOpen(false);  
    };


    const addServiceToUnlink = (billService: ServiceFormBillType, index: number) => {
        console.log("Le service à unlink : "+JSON.stringify(billService))
        // Like we have to delete bill?Service (=link to bill? and service), we pass the bill?Service Id
        setUpdateBillFormValues({
            ...updateBillFormValues,
            servicesToUnlink: [
            ...updateBillFormValues.servicesToUnlink,
            {
                // Pass the datas from the service
                id : billService.id,
                label: billService.label,
                unitPriceHT: billService.unitPriceHT,
                type: billService.type,
                unit: billService.unit,
                vatRate: billService.vatRate,
                selectedFromSuggestions: false,
                quantity: billService.quantity,
                detailsService: billService.detailsService,
            },
            ],
        });

        removeService(index)

    };

    const removeService = (index: number) => {
        if(bill){
            console.log("j'entre dans removeService")
            const newServices = updateBillFormValues.services.filter((_, i) => i !== index);
            setUpdateBillFormValues({
                ...updateBillFormValues,
                services: newServices,
            });            
        }

    };

    // We search services suggestions with the letters the user submit (= the query)
    // We don't search if the query is less than 2 characters
 
 
    const fetchServiceSuggestions = async (value: string) => {
        if (value.length < 2) return; 
        try {
            console.log("le nombre de caractères dans le champ label est supérieur à 2")
            const data = await fetchSuggestions("service", value);
            console.log("API response data for services :", data); 
            console.log("Longueur des datas du tableau de datas de services : "+data.suggestions.length)
            if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
                setServiceSuggestions(data.suggestions as ServiceSuggestionType[]); 
                console.log("Les datas reçues sont supérieures à 0 pour les suggestions de services")
            } else {
                setServiceSuggestions([]); 
                console.log("Pas de datas reçues")

            }
        } catch (error) {
            console.error("Erreur lors de la récupération des suggestions de services :", error);
        }
    };
 



  /////////////////////
  const handleClickServiceSuggestion = (index: number, suggestion: ServiceSuggestionType) => {
    const newService = {
        id: suggestion.id,
        label: suggestion.label,
        unitPriceHT: suggestion.unitPriceHT,
        type: suggestion.type,
        unit: "",
        vatRate: "",
        selectedFromSuggestions: true,
        quantity: 0,
        detailsService: "",
    };

    const newServices = [...updateBillFormValues.services];
    newServices[index] = newService;

    // Nettoyons servicesAdded des services partiels
    let updatedServicesAdded = [...updateBillFormValues.servicesAdded];
    // Supprimer tout service partiel à cet index
    updatedServicesAdded = updatedServicesAdded.filter(service => 
        service.label !== updateBillFormValues.services[index].label || 
        service.selectedFromSuggestions
    );
    
    // Ajouter le nouveau service
    updatedServicesAdded.push(newService);

    setUpdateBillFormValues({
        ...updateBillFormValues,
        services: newServices,
        servicesAdded: updatedServicesAdded,
    });

    setServiceSuggestions([]);
};

const handleServiceFieldChange = (
    index: number,
    fieldName: string,
    value: string 
) => {
    const newServices = [...updateBillFormValues.services];
    const currentService = newServices[index];
    
    // Update the service with new value
    newServices[index] = {
        ...currentService,
        [fieldName]: value,
    };

    // Only update servicesAdded if:
    // 1. It's a new service (no id) AND all required fields are filled
    // 2. OR it's a service from suggestions that's being modified
    if (currentService.selectedFromSuggestions || 
        (!currentService.id && isServiceComplete(newServices[index]))) {
        const updatedServicesAdded = [...updateBillFormValues.servicesAdded];
        
        // Find if this service is already in servicesAdded
        const existingIndex = updatedServicesAdded.findIndex(
            s => (s.id === currentService.id) || 
                 (s.label === currentService.label && !s.id && !currentService.id)
        );

        if (existingIndex !== -1) {
            // Update existing service
            updatedServicesAdded[existingIndex] = {
                ...updatedServicesAdded[existingIndex],
                [fieldName]: value,
            };
        } else if (isServiceComplete(newServices[index])) {
            // Add new service only if it's complete
            updatedServicesAdded.push(newServices[index]);
        }

        setUpdateBillFormValues({
            ...updateBillFormValues,
            services: newServices,
            servicesAdded: updatedServicesAdded,
        });
    } else {
        // For existing services that aren't from suggestions, just update services array
        setUpdateBillFormValues({
            ...updateBillFormValues,
            services: newServices,
        });
    }

    // Handle service suggestions if label is being changed
    if (fieldName === "label") {
        fetchServiceSuggestions(value);
    }
};

// Fonction utilitaire pour vérifier si un service est complet
const isServiceComplete = (service: ServiceFormBillType) => {
    return service.label &&
           service.unitPriceHT &&
           service.type &&
           service.unit &&
           service.vatRate &&
           service.quantity;
};

const addService = () => {
    const newService = {
        id: null,
        label: "",
        unitPriceHT: "",
        type: "",
        unit: "",
        vatRate: "",
        selectedFromSuggestions: false,
        quantity: 0,
        detailsService: "",
    };

    setUpdateBillFormValues(prevValues => ({
        ...prevValues,
        services: [...prevValues.services, newService],
    }));
};
      
    if (!bill) return <div>Loading...</div>;

    console.log("Les services contenus dans bill :", JSON.stringify(updateBillFormValues.services));
    console.log("Les services ajoutés dans bill :", JSON.stringify(updateBillFormValues.servicesAdded));
    console.log("Les services enlevés de bill :", JSON.stringify(updateBillFormValues.servicesToUnlink));

    console.log("les erreurs zod : "+console.log(errors))
    return (
        <div className="relative">
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Modification de facture n°{bill?.number}</h1>
            {/* <div><Toaster /></div> */}
            <form 
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleBillUpdate();
                }}
            >
                {/* Client of the bill */}
                <div>
                    <label htmlFor="client">Client</label>
                    <Field className="w-full">
                        <Input type="text" name="client" 
                            value={bill?.client.name+" "+bill?.client.firstName}
                            className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            readOnly
                        >
                        </Input>
                    </Field>   
                    {errors.clientId && <p style={{ color: "red" }}>{errors.clientId}</p>}
             
                </div>
                {/* WorkSite of the bill? */}
                <div>
                    <label htmlFor="workSite">Chantier</label>
                    <Field className="w-full">
                        <Input type="text" name="workSite" 
                            value={`${bill?.workSite.addressNumber} ${bill?.workSite.road} ${bill?.workSite.additionalAddress ? bill?.workSite.additionalAddress + " " : ""}${bill?.workSite.postalCode} ${bill?.workSite.city}`}
                            className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            readOnly
                        >
                        </Input>
                    </Field>    
                    {errors.workSiteId && <p style={{ color: "red" }}>{errors.workSiteId}</p>}
            
                </div>
                {/* Nature of work */}
                <div>
                    <label htmlFor="natureOfWork">Nature des travaux</label>
                    <Field className="w-full">
                        <Input type="text" name="natureOfWork" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updateBillFormValues.natureOfWork !== null
                                ? updateBillFormValues.natureOfWork
                                : bill?.natureOfWork ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.natureOfWork && <p style={{ color: "red" }}>{errors.natureOfWork}</p>}

                </div>
                {/* Work description */}
                <div>
                    <label htmlFor="description">Description</label>
                    <Field className="w-full">
                        <Textarea name="description" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updateBillFormValues.description !== null
                                ? updateBillFormValues.description
                                : bill?.description ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Textarea>
                    </Field>
                    {errors.description && <p style={{ color: "red" }}>{errors.description}</p>}

                </div>
                {/* Work start date */}
                <div>
                    <label htmlFor="workStartDate">Date de début des travaux</label>
                    <Field className="w-full">
                        <Input type="date" name="workStartDate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.workStartDate && <p style={{ color: "red" }}>{errors.workStartDate}</p>}

                </div>
                {/* work end date */}
                <div>
                    <label htmlFor="workEndDate">Date de fin des travaux</label>
                    <Field className="w-full">
                        <Input type="date" name="workEndDate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.workEndDate && <p style={{ color: "red" }}>{errors.workEndDate}</p>}

                </div>
                {/* work duration */}
                <div>
                    <label htmlFor="workDuration">Durée des travaux (en jours)</label>
                    <Field className="w-full">
                        <Input type="number" name="workDuration" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.workDuration && <p style={{ color: "red" }}>{errors.workDuration}</p>}

                </div>
                    {/* Sélection du type de frais de déplacements */}
                    <Select
                    name="travelCostsType"
                    value={updateBillFormValues.travelCostsType || ""}
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                    disabled
                    >
                    <option value="">Type de frais de déplacement</option>
                    {travelCostsTypeChoices.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                    </Select>
                    {errors.travelCostsType && <p style={{ color: "red" }}>{errors.travelCostsTypeChoices}</p>}

                {/* travelCosts */}
                <div>
                    <label htmlFor="travelCosts">Frais de déplacement</label>
                    <Field className="w-full">
                        <Input type="text" name="travelCosts" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={updateBillFormValues.travelCosts !== null
                                ? updateBillFormValues.travelCosts
                                : bill?.travelCosts ?? ""} 
                            readOnly
                        >
                        </Input>
                    </Field>
                    {errors.travelCosts && <p style={{ color: "red" }}>{errors.travelCosts}</p>}

                </div>
            <h2>Services</h2>
            {updateBillFormValues.services.map((service, index) => (
                
  <div key={index} className="p-4 border border-gray-600 rounded-md mb-4">
    {/* Label : Lecture seule pour services existants, modifiable pour nouveaux services */}
    <Input
      type="text"
      name="label"
      placeholder="Label du service"
      value={service.label}
      onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
      className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
      disabled={!!service.id} // Si le service a un id, le label est en lecture seule
    />
    
{/* Suggestions de services (uniquement pour les nouveaux services) */}
{!service.id && Array.isArray(servicesSuggestions) && servicesSuggestions.length > 0 && ( 
  <ul className="bg-gray-800 text-white rounded-md p-2">
    {servicesSuggestions.map((suggestion) => (
      <li
        key={suggestion.id}
        onClick={() => handleClickServiceSuggestion(index, suggestion)}
        className="cursor-pointer hover:text-blue-400"
      >
        {suggestion.label}
      </li>
    ))}
  </ul>
)}


    {/* Détails du service */}
    <Input
      type="text"
      name="detailsService"
      placeholder="Détails du service"
      value={service.detailsService}
      onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
      className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
      disabled={!!service.id && !service.selectedFromSuggestions} // Désactivé si c'est un service existant ET qui n'a pas été selectionné des suggestions
    />

    {/* Prix unitaire */}
    <Input
      type="number"
      name="unitPriceHT"
      placeholder="Prix unitaire"
      value={service.unitPriceHT || ""}
      onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
      className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
      disabled={!!service.id || !!service.selectedFromSuggestions} // Désactivé si existant ou sélectionné via suggestion
    />

    {/* Sélection du type */}
    <Select
      name="type"
      onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
      value={service.type || ""}
      className="w-full rounded-md bg-gray-700 text-white pl-3"
      disabled={!!service.id} // Désactivé si c'est un service existant
    >
      <option value="">Type de service</option>
      {serviceTypeChoices.map((type) => (
        <option key={type} value={type}>{type}</option>
      ))}
    </Select>

    {/* Quantité */}
    <Input
      type="number"
      name="quantity"
      placeholder="Quantité"
      value={service.quantity || ""}
      onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
      className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
      disabled={!!service.id && !service.selectedFromSuggestions} // Désactivé si c'est un service existant ET qui n'a pas été selectionné des suggestions
    />

    {/* Sélection de l'unité */}
    <Select
      name="unit"
      onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
      value={service.unit || ""}
      className="w-full rounded-md bg-gray-700 text-white pl-3"
      disabled={!!service.id && !service.selectedFromSuggestions} // Désactivé si c'est un service existant ET qui n'a pas été selectionné des suggestions
    >
      <option value="">Unité</option>
      {unitChoices.map((unit) => (
        <option key={unit.id} value={unit.label}>{unit.label}</option>
      ))}
    </Select>

    {/* Sélection du taux de TVA */}
    <Select
      name="vatRate"
      onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
      value={service.vatRate || ""}
      className="w-full rounded-md bg-gray-700 text-white pl-3"
      disabled={!!service.id && !service.selectedFromSuggestions} // Désactivé si c'est un service existant ET qui n'a pas été selectionné des suggestions
    >
      <option value="">Taux de TVA</option>
      {vatRateChoices.map((vatRate) => (
        <option key={vatRate.id} value={vatRate.rate}>{vatRate.rate}</option>
      ))}
    </Select>

    {/* Bouton de suppression du service */}
    <Button
      label="Supprimer le service"
      icon={faXmark}
      type="button"
      action={() => addServiceToUnlink(service, index)}
      specifyBackground="text-red-500"
    />
  </div>
))}

{/* Bouton d'ajout d'un service */}
<Button
  label="Ajouter un service"
  icon={faXmark}
  type="button"
  action={() => addService()}
  specifyBackground="text-green-500"
/>
{/* work duration */}
    <div>
        <label htmlFor="discountAmount">Montant remise</label>
        <Field className="w-full">
            <Input type="number" name="discountAmount" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                value={updateBillFormValues.discountAmount || ""}
                onChange={handleInputChange}
            >
            </Input>
        </Field>
    </div>
    {/* Sélection du type de remise */}
    <Select
        name="discountReason"
        value={updateBillFormValues.discountReason || ""}
        onChange={handleInputChange}
        className="w-full rounded-md bg-gray-700 text-white pl-3"
        >
        <option value="">Type de remise</option>
        {discountReasonChoices.map((type) => (
            <option key={type} value={type}>{type}</option>
        ))}
        {errors.discountReason && <p style={{ color: "red" }}>{errors.discountReason}</p>}

    </Select>
                {/* payment Terms */}
                <div>
                    <label htmlFor="paymentTerms">Conditions de paiement</label>
                    <Field className="w-full">
                        <Textarea name="paymentTerms" 
                            defaultValue={"Le paiement doit être effectué dans les 30 jours suivant la réception de la facture."} className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Textarea>
                    </Field>
                    {errors.paymentTerms && <p style={{ color: "red" }}>{errors.paymentTerms}</p>}
                </div>



                {/* Bill : due date payment */}
                <div>
                    <label htmlFor="dueDate">Date limite de paiement</label>
                    <Field className="w-full">
                        <Input type="date" name="dueDate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.dueDate && <p style={{ color: "red" }}>{errors.dueDate}</p>}

                </div>
                <Input type="hidden" name="csrf_token" value={csrfToken} />
                
                <button 
                    className="bg-red-400"
                    type="submit"
                    onClick={() => {
                        handleBillUpdate(); 
                    }}
                    >Enregistrer à l&aposétat de brouillon
                </button>
                <button
                    // type="button" avoid the form to be automatically submitted
                    type="button"
                    onClick={openChoiceDialog}
                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                >
                    Finaliser la facture 
                </button>
            </form>
            {/* Dialog to save as final version of bill*/}
            {/* className=" top-[50%] left-[25%]" */}
            {/* {isOpen ?? ( */}
                <Dialog open={isOpen} onClose={closeChoiceDialog}  className="fixed top-[50%] left-[25%]" >
                    <DialogPanel className="bg-gray-300 p-5 rounded-md shadow-lg text-black">
                    <DialogTitle>Etes-vous sûr de vouloir enregistrer la facture en version finale ?</DialogTitle>
                    <Description>Cette action est irréversible</Description>
                    <p>La facture ne pourra plus être modifiée ultérieurement. </p>
                        <div className="flex justify-between mt-4">
                        <button
                        // choice to to finalize bill?
                            onClick={() => {
                                handleBillUpdate("READY"); 
                                closeChoiceDialog(); 
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-md"
                        >
                            Finaliser la facture
                        </button>
                            <button onClick={closeChoiceDialog} className="bg-gray-300 text-black px-4 py-2 rounded-md">Annuler</button>
                        </div>
                    </DialogPanel>
                </Dialog>
            {/* )}  */}

        </div>
    );

};
