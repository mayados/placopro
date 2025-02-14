"use client";

import { useEffect, useState, use } from "react";
import { Field,Input, Label, Legend, Radio, RadioGroup, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { CirclePlus, CircleX } from "lucide-react";
import { capitalizeFirstLetter } from "@/lib/utils";
import { formatDateForInput } from '@/lib/utils'
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import { fetchQuote, updateDraftQuote } from "@/services/api/quoteService";
import { fetchVatRates } from "@/services/api/vatRateService";
import { fetchUnits } from "@/services/api/unitService";
import { fetchSuggestions } from "@/services/api/suggestionService";
import { createBillFromQuote } from "@/services/api/billService";

// import toast, { Toaster } from 'react-hot-toast';

const CreationBillFromQuote = ({ params }: { params: Promise<{ quoteNumber: string }>}) => {

    const [quote, setQuote] = useState<QuoteType>();
    const [createBillFormValues, setCreateBillFormValues] = useState<CreateBillFormValueType>({
        dueDate: null,
        natureOfWork: null,
        description: null,
        issueDate: null,
        vatAmount: null,
        totalTtc: null,
        totalHt: null,
        clientId: null as string | null,
        services: [],
        servicesToUnlink: [],
        servicesAdded: [],
        serviceType: null,
        workSiteId: null,
        // client: null,
        quoteId: null as string | null,
        status: null,
        number: null,
    })
    // Define options for select for services
    const serviceTypeChoices = ["plâtrerie","Peinture"];
    const [vatRateChoices, setVatRateChoices] = useState<VatRateChoiceType[]>([])
    const [unitChoices, setUnitChoices] = useState<UnitChoiceType[]>([])
    // Allows to know if a bill is registered as a draft or ready (to be send)
    const [status, setStatus] = useState<"Draft" | "Ready">("Draft");
    const [isOpen, setIsOpen] = useState(false);


    // cont which allows redirection
    const router = useRouter();
    // Display suggestions for : service, unit, vatRate, client, worksite 
    // const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestionType[] | null>(null)
    const [servicesSuggestions, setServiceSuggestions] = useState<ServiceSuggestionType[] | null>(null)
    // text visible in the client field
    const [clientInput, setClientInput] = useState(""); 
    const [unitInput, setUnitInput] = useState(""); 
    const [vatRateInput, setVatRateInput] = useState(""); 
    const [serviceInput, setServiceInput] = useState(""); 


    useEffect(() => {
        console.log("Mon composant est monté !");

        // The Bill here is generated from a Quote, so we need to get the Quote
        async function loadQuote() {
                // Params is now asynchronous. It's a Promise
                // So we need to await before access its properties
                const resolvedParams = await params;
                const quoteNumber = resolvedParams.quoteNumber;

                try{
                    const data = await fetchQuote(quoteNumber)
                    setCreateBillFormValues({
                        ...createBillFormValues,
                        number: data.quote.number,
                        totalTtc: data.quote.priceHT,
                        totalHt: data.quote.priceTTC,
                        clientId: data.quote.client.id,
                        workSiteId: data.quote.workSite.id,
                        quoteId: data.quote.id,
                        vatAmount: data.quote.vatAmount,
                        natureOfWork: data.quote.natureOfWork,
                        description: data.quote.description
                    });
                      setQuote(data.quote);

                }catch (error) {
                    console.error("Impossible to load the quote :", error);
                }
        }

        const loadVatRates = async () => {
                try{
                    const data = await fetchVatRates();
                    setVatRateChoices(data.vatRates)

                }catch (error) {
                    console.error("Impossible to load VAT rates :", error);
                    }
        };

        const loadUnits = async () => {
                try{
                    const data = await fetchUnits();
                    setUnitChoices(data.units)
            
                }catch (error) {
                    console.error("Impossible to load units :", error);
                }     
        };

        loadQuote();
        loadVatRates();
        loadUnits();
    },[params]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        console.log("évènement reçu : "+e)
        const { name, value } = e.target;
        console.log("select :"+name+" valeur : "+value)
        setCreateBillFormValues({
            ...createBillFormValues,
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
    const handleRadioChange = (name: string, value: string) => {
        setCreateBillFormValues({
            ...createBillFormValues,
            [name]: value,
        });
    }

    const handleClickServiceSuggestion = (
        index: number,
        suggestion: ServiceSuggestionType
      ) => {
        const newServices = [...createBillFormValues.services];
        newServices[index] = {
          ...newServices[index],
          id: suggestion.id,
          label: suggestion.label,
          // Fil unitPriceHT and type fields with the values of the suggestion
          unitPriceHT: suggestion.unitPriceHT, 
          type: capitalizeFirstLetter(suggestion.type),
          // Allows to know if a service comes from a suggestion to manage automatic fill fields
          selectedFromSuggestions: true, 
        };
      
        console.log("le type de la suggestion est "+suggestion.type)

        setCreateBillFormValues({
          ...createBillFormValues,
          services: newServices,
        });


        // Delete suggestions after the clic
        setServiceSuggestions([]);
      };

    const handleBillCreation = async (statusReady?: string) => {
        console.log("La facture crééé : "+JSON.stringify(createBillFormValues.servicesToUnlink))
        console.log("Le quote intial : "+JSON.stringify(quote?.services))        
        console.log("lors du submit, le status est : "+statusReady)

        const status = statusReady ? "Ready": "Draft"
        const quoteId = quote?.id

        try{
            const createBillWithStatus = {
                ...createBillFormValues,
                status,
                quoteId,
            };

            if(!quote?.number){
                return
            }

            const data = await createBillFromQuote(createBillWithStatus)
            console.log("data renvoyés : "+data)
            const createdBill = data;
            console.log("voici la bill crééé : "+createdBill.number)
            console.log("status du devis updaté "+createdBill.status)
            try {
                if(createdBill.status === "Draft"){
                    // Redirect to the page of bill's update
                    router.push(`/director/bills/${createdBill.number}/update`);                        
                }else{
                    router.push(`/director/bills/${createdBill.number}`);                        
                }

            } catch (err) {
                console.error("Redirection failed :", err);
            }

        }catch(error){
            console.error("Impossible to create the bill :", error);
        }
    }


    const openChoiceDialog = () => {
        setIsOpen(true);  
        console.log("la fenetre de dialog devrait être ouverte")
        
    };

    const closeChoiceDialog = () => {
        setIsOpen(false);  
    };

    const addService = () => {
        setCreateBillFormValues({
          ...createBillFormValues,
          services: [
            ...createBillFormValues.services,
            {
                id : null,
              label: "",
              unitPriceHT: "",
              type: "",
              unit: "",
              vatRate: "",
              selectedFromSuggestions: false,
              quantity: 0,
              detailsService: "",
            },
          ],
          servicesAdded: [
            ...createBillFormValues.servicesAdded,
            {
                id : null,
              label: "",
              unitPriceHT: "",
              type: "",
              unit: "",
              vatRate: "",
              selectedFromSuggestions: false,
              quantity: 0,
              detailsService: "",
            },
          ]
        });
      };

    const addServiceToUnlink = (billService: BillServiceType, index: number) => {
        console.log("Le service à unlink : "+JSON.stringify(billService))
        // Like we have to delete QuoteService (=link to quote and service), we pass the quoteService Id
        setCreateBillFormValues({
            ...createBillFormValues,
            servicesToUnlink: [
            ...createBillFormValues.servicesToUnlink,
            {
                // Pass the datas from the service
                id : billService.id,
                label: billService.label,
                unitPriceHT: billService.service.unitPriceHT,
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
        if(quote){
            const newServices = quote.services.filter((_, i) => i !== index);
            setQuote({
                ...quote,
                services: newServices,
            });            
        }

    };

    // We search services suggestions with the letters the user submit (= the query)
    // We don't search if the query is less than 2 characters
 
 
    const fetchServiceSuggestions = async (value: string) => {
        if (value.length < 2) return; 
        try {
            const data = await fetchSuggestions("service", value);
            console.log("API response data for services :", data); 
            console.log("Longueur des datas du tableau de datas de services : "+data.suggestions.length)
            if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
                setServiceSuggestions(data.suggestions as ServiceSuggestionType[]); 
                console.log("Les datas reçues sont supérieures à 0")
            } else {
                setServiceSuggestions([]); 
                console.log("Pas de datas reçues")

            }
        } catch (error) {
            console.error("Erreur lors de la récupération des suggestions de services :", error);
        }
    };
 


// Fonction pour gérer les changements sur les champs autres que le label
    const handleServiceFieldChange = (
        index: number,
        fieldName: string,
        value: string 
    ) => {
        console.log("Avant mise à jour : ", createBillFormValues.services[index]);
        console.log("Champ modifié : ", fieldName, " Nouvelle valeur : ", value);
        // console.log("la valeur saisie dans le champ est : "+value+" qui provient du champ "+fieldName)
        
        const newServices = [...createBillFormValues.services];
        newServices[index] = {
        ...newServices[index],
        // Update only targeted field
        [fieldName]: value, 
        };

        console.log("Après mise à jour : ", newServices[index]);

    
        setCreateBillFormValues({
        ...createBillFormValues,
        services: newServices,
        });

        if(fieldName === "label"){
            fetchServiceSuggestions(value);
        }
    };

    if (!quote) return <div>Loading...</div>;

    return (
        <div className="relative">
            {/* <div><Toaster/></div> */}
            <h1 className="text-3xl text-white ml-3 text-center">Création de facture liée au devis n° ${quote.number}</h1>
            {/* <div><Toaster /></div> */}
            <form 
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleBillCreation();
                }}
            >
                {/* Client of the bill */}
                <div>
                    <label htmlFor="client">Client</label>
                    <Field className="w-full">
                        <Input type="text" name="client" 
                            value={quote.client.name+" "+quote.client.firstName}
                            className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            readOnly
                        >
                        </Input>
                    </Field>                
                </div>
                {/* WorkSite of the quote */}
                <div>
                    <label htmlFor="workSite">Chantier</label>
                    <Field className="w-full">
                        <Input type="text" name="workSite" 
                            value={`${quote?.workSite.addressNumber} ${quote?.workSite.road} ${quote?.workSite.additionnalAddress ? quote?.workSite.additionnalAddress + " " : ""}${quote?.workSite.postalCode} ${quote?.workSite.city}`}
                            className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            readOnly
                        >
                        </Input>
                    </Field>                
                </div>
                {/* Nature of work */}
                <div>
                    <label htmlFor="natureOfWork">Nature des travaux</label>
                    <Field className="w-full">
                        <Input type="text" name="natureOfWork" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={createBillFormValues.natureOfWork !== null
                                ? createBillFormValues.natureOfWork
                                : quote.natureOfWork ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                {/* Work description */}
                <div>
                    <label htmlFor="description">Description</label>
                    <Field className="w-full">
                        <Textarea name="description" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            value={createBillFormValues.description !== null
                                ? createBillFormValues.description
                                : quote.description ?? ""} 
                            onChange={handleInputChange}
                        >
                        </Textarea>
                    </Field>
                </div>
            <h2>Services</h2>
            {/* Services retrieved form database (can't be updated, just unlinked from this quote) */}
            {quote.services.map((service, index) => (
            <div key={index}>
                <Input
                    type="text"
                    name="label"
                    placeholder="Label du service"
                    value={service.service.label}
                    readOnly
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />
                <Input
                    type="text"
                    name="detailsService"
                    placeholder="Détails du service"
                    value={service.detailsService}
                    readOnly
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />
                <Input
                    type="number"
                    name="unitPriceHT"
                    placeholder="Prix unitaire"
                    value={service.service.unitPriceHT || ""}
                    readOnly
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />

                <Select
                    name="type"
                    value={service.service.type || ""}
                    disabled
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                >
                <option value="">Type de service</option>
                    {serviceTypeChoices.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
                <Input
                    type="number"
                    name="quantity"
                    readOnly
                    placeholder="Quantité"
                    value={service.quantity || ""}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"

                />
                <Select
                    name="unit"
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    disabled
                    value={service.unit || ""}
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                >
                    <option value="">Unité</option>
                        {unitChoices.map((unit) => (
                            <option key={unit.id} value={unit.label}>{unit.label}</option>
                        ))}
                </Select> 
                    <Select
                            name="vatRate"
                            disabled
                            value={service.vatRate || ""}
                            className="w-full rounded-md bg-gray-700 text-white pl-3"
                        >
                        <option value="">Taux de tva</option>
                            {vatRateChoices.map((vatRate) => (
                                <option key={vatRate.id} value={vatRate.rate}>{vatRate.rate}</option>
                            ))}
                    </Select> 
                    <Button label="Enlever le service" icon={CircleX} type="button" action={() => addServiceToUnlink(service, index)} specifyBackground="text-red-500" />
                </div>
                ))}
            {/* end of services retrieved from database */}
            {createBillFormValues.services.map((service, index) => (
            <div key={index}>
                <Input
                    type="text"
                    name="label"
                    placeholder="Label du service"
                    value={service.label}
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />
                {/* Services suggestions */}
                {servicesSuggestions ? (
                    <ul>
                        {servicesSuggestions.map((suggestion) => (
                            <li 
                                key={suggestion.id}
                                onClick={() => handleClickServiceSuggestion(index, suggestion)} 
                                className="cursor-pointer text-blue-500 hover:text-blue-700"
                            >
                                {suggestion.label}
                            </li>
                        ))}
                    </ul>
                    ) : (
                        <p>Aucune suggestion disponible</p>
                )}
                <Input
                    type="text"
                    name="detailsService"
                    placeholder="Détails du service"
                    value={service.detailsService}
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                />
                 <Input
                    type="number"
                    name="unitPriceHT"
                    placeholder="Prix unitaire"
                    value={service.unitPriceHT || ""}
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"
                    disabled={!!service.selectedFromSuggestions}
                />

                <Select
                    name="type"
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    value={service.selectedFromSuggestions ? "" : service.type }
                    className="w-full rounded-md bg-gray-700 text-white pl-3"
                    disabled={!!service.selectedFromSuggestions}
                >
                <option value="">{service.selectedFromSuggestions ? service.type : "Type de service"}</option>
                    {serviceTypeChoices.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </Select>
                <Input
                    type="number"
                    name="quantity"
                    placeholder="Quantité"
                    value={service.quantity || ""}
                    onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                    className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3 mb-2"

                />
                <Select
                        name="unit"
                        onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                        value={service.unit || ""}
                        className="w-full rounded-md bg-gray-700 text-white pl-3"
                    >
                    <option value="">Unité</option>
                        {unitChoices.map((unit) => (
                            <option key={unit.id} value={unit.label}>{unit.label}</option>
                        ))}
                </Select> 
                <Select
                        name="vatRate"
                        onChange={(event) => handleServiceFieldChange(index,event.target.name, event.target.value)}
                        value={service.vatRate || ""}
                        className="w-full rounded-md bg-gray-700 text-white pl-3"
                    >
                    <option value="">Taux de tva</option>
                        {vatRateChoices.map((vatRate) => (
                            <option key={vatRate.id} value={vatRate.rate}>{vatRate.rate}</option>
                        ))}
                </Select> 
                <Button label="Enlever le service" icon={CircleX} type="button" action={() => removeService(index)} specifyBackground="text-red-500" />
            </div>
            ))}
            <Button label="Ajouter un service" icon={CirclePlus} type="button" action={() => addService()} specifyBackground="text-red-500" />


                {/* Bill : due date payment */}
                <div>
                    <label htmlFor="dueDate">Date limite de paiement</label>
                    <Field className="w-full">
                        <Input type="date" name="dueDate" className="w-full h-[2rem] rounded-md bg-gray-700 text-white pl-3" 
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                </div>
                <button 
                    className="bg-red-400"
                    type="submit"
                    onClick={() => {
                        handleBillCreation(); 
                    }}
                    >Enregistrer à l'état de brouillon
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
                        // choice to to finalize quote
                            onClick={() => {
                                handleBillCreation("Ready"); 
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



export default CreationBillFromQuote;


