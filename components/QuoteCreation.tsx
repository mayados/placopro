"use client";

import { useEffect, useState } from "react";
import { Field, Input, Label, Legend, Radio, RadioGroup, Select, Textarea } from '@headlessui/react';
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { capitalizeFirstLetter } from "@/lib/utils";
import { fetchVatRates } from "@/services/api/vatRateService";
import { fetchUnits } from "@/services/api/unitService";
import { createQuote } from "@/services/api/quoteService";
import { fetchSuggestions } from "@/services/api/suggestionService";
import { Dialog, DialogTitle, DialogPanel, Description } from '@headlessui/react';
import { createQuoteDraftSchema, createQuoteFinalSchema } from "@/validation/quoteValidation";
import { toast } from 'react-hot-toast';
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type QuoteCreationProps = {
    csrfToken: string;
};

export default function QuoteCreation({ csrfToken }: QuoteCreationProps) {

    const [quote, setQuote] = useState<QuoteFormValueType>({
        clientName: "",
        workSiteName: "",
        validityEndDate: "",
        natureOfWork: "",
        description: "",
        workStartDate: "",
        estimatedWorkEndDate: "",
        estimatedWorkDuration: "",
        vatAmount: 0,
        priceTTC: 0,
        priceHT: 0,
        depositAmount: 0,
        discountAmount: 0,
        discountReason: "",
        isQuoteFree: "",
        hasRightOfWithdrawal: "",
        travelCosts: 0,
        travelCostsType: "",
        hourlyLaborRate: 0,
        paymentTerms: "Le paiement doit être effectué dans les 30 jours suivant la réception de la facture.",
        paymentDelay: 0,
        latePaymentPenalities: 0,
        recoveryFees: 0,
        withdrawalPeriod: 0,
        quoteCost: 0,
        clientId: null as string | null,
        workSiteId: null as string | null,
        services: [],
        serviceType: "",
    })
    const discountReasonChoices =
    {
        FIDELITY: "Fidelité",
        EXCEPTIONAL: "Remise exceptionnelle"
    };
    const travelCostsTypeChoices = ["Forfait unique", "Forfait journalier"];
    // Define options for select for services
    const serviceTypeChoices = ["plâtrerie", "Peinture"];
    const [vatRateChoices, setVatRateChoices] = useState<VatRateChoiceType[]>([])
    const [unitChoices, setUnitChoices] = useState<UnitChoiceType[]>([])

    // cont which allows redirection
    const router = useRouter();
    // Display suggestions for : service, unit, tvaRate, client, worksite 
    const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestionType[] | null>(null)
    const [workSiteSuggestions, setWorkSiteSuggestions] = useState<WorkSiteSuggestionType[] | null>(null)
    const [servicesSuggestions, setServiceSuggestions] = useState<ServiceSuggestionType[] | null>(null)
    // text visible in the client field
    const [clientInput, setClientInput] = useState("");


    const [workSiteInput, setWorkSiteInput] = useState("");
    const [, setUnitInput] = useState("");
    const [, setVatRateInput] = useState("");
    // Choices for boolean properties
    const hasRightOfWithdrawalChoices = ["Oui", "Non"];
    const [isOpen, setIsOpen] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});



    useEffect(() => {

        const savedQuote = localStorage.getItem('quoteFormData');
        if (savedQuote) {
            try {
                // Parse les données du localStorage
                const parsedQuote = JSON.parse(savedQuote);

                // Mettre à jour l'objet global quote
                setQuote(parsedQuote);

                // Initialiser clientInput et workSiteInput avec les valeurs du localStorage
                if (parsedQuote.clientName) {
                    setClientInput(parsedQuote.clientName);  // Mettre à jour clientInput avec le nom du client
                }

                if (parsedQuote.workSiteName) {
                    setWorkSiteInput(parsedQuote.workSiteName);  // Mettre à jour workSiteInput avec le nom du chantier
                }

            } catch (error) {
                console.error("Erreur de parsing du localStorage quoteFormData :", error);
                // Nettoyer si les données sont corrompues
                localStorage.removeItem('quoteFormData');
            }
        }

        const loadVatRates = async () => {
            try {
                const data = await fetchVatRates();
                setVatRateChoices(data)

            } catch (error) {
                console.error("Impossible to load VAT rates :", error);
            }
        };

        const loadUnits = async () => {
            try {
                const data = await fetchUnits();
                setUnitChoices(data)

            } catch (error) {
                console.error("Impossible to load units :", error);
            }
        };

        loadVatRates()
        loadUnits();
    }, []);

    //Util function to update the Quote and the localStorage
    const updateQuoteAndStorage = (updatedQuote: QuoteFormValueType) => {
        setQuote(updatedQuote);
        localStorage.setItem('quoteFormData', JSON.stringify(updatedQuote));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        console.log("évènement reçu : " + e)
        const { name, value } = e.target;
        console.log("select :" + name + " valeur : " + value)
        // setQuote({
        //     ...quote,
        //     [name]: value,
        // });
        const updatedQuote = { ...quote, [name]: value };
        updateQuoteAndStorage(updatedQuote);


        if (name === "client") {
            setClientInput(value)
            console.log("input client : " + clientInput)
        } else if (name === "workSite") {
            setWorkSiteInput(value)
        } else if (name === "unit") {
            setUnitInput(value)
        } else if (name === "vatRate") {
            setVatRateInput(value)
        }

        if (name === "client" || name === "workSite") {
            handleDisplaySuggestions(e)
        }

    };

    //   Retrieve datas from the radio buttons. Because they are in a RadioGroup, we can't retrieve the value just thanks to an event, we have to get the name (of the group) + the value selected
    const handleRadioChange = (name: string, value: string) => {
        // setQuote((quote) => ({
        //   ...quote,
        //   [name]: value,
        // }));

        const updatedQuote = {
            ...quote,
            [name]: value,
        };
        updateQuoteAndStorage(updatedQuote);
    };

    //   console.log("Contenu du localStorage 'quoteFormData' :", JSON.parse(localStorage.getItem('quoteFormData') || '{}'));


    const handleDisplaySuggestions = async (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name !== "client" && name !== "workSite") return;

        if (value.trim().length < 2) {
            if (name === "client") {
                setClientSuggestions(null);
                setClientInput(value);
                setQuote((prev) => ({ ...prev, clientId: null }));
            } else if (name === "workSite") {
                setWorkSiteSuggestions(null);
                setWorkSiteInput(value);
                setQuote((prev) => ({ ...prev, workSiteId: null }));
            }
            return;
        }

        try {
            const data = await fetchSuggestions(name, value);

            if (name === "client") {
                setClientSuggestions(data.suggestions as ClientSuggestionType[]);
            } else if (name === "workSite") {
                setWorkSiteSuggestions(data.suggestions as WorkSiteSuggestionType[]);
            }
        } catch (error) {
            console.error(`Erreur lors de la récupération des suggestions pour ${name} :`, error);
        }
    };

    const handleClickSuggestion = (inputName: string, id: string, fieldValue: string) => {
        console.log("valeur du champ : " + fieldValue)
        if (inputName === "client") {
            // setClientInput(fieldValue)
            // setQuote((prev) => ({
            //     ...prev,
            //     // Put id from selected client
            //     clientId: id, 
            // }));
            setClientInput(fieldValue)
            updateQuoteAndStorage({
                ...quote,
                clientId: id,
                clientName: fieldValue,

            });
            // Close suggestions list
            setClientSuggestions(null);
        } else if (inputName === "workSite") {
            // setWorkSiteInput(fieldValue)
            // setQuote((prev) => ({
            //     ...prev,
            //     // Put id from selected client
            //     workSiteId: id, 
            // }));
            setWorkSiteInput(fieldValue)

            updateQuoteAndStorage({
                ...quote,
                workSiteName: fieldValue,
                workSiteId: id,
            });
            // Close suggestions list
            setWorkSiteSuggestions(null);
        }
    }


    const handleClickServiceSuggestion = (
        index: number,
        suggestion: ServiceSuggestionType
    ) => {
        const newServices = [...quote.services];
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

        console.log("le type de la suggestion est " + suggestion.type)

        // setQuote({
        //   ...quote,
        //   services: newServices,
        // });
        updateQuoteAndStorage({
            ...quote,
            services: newServices,
        });


        // Delete suggestions after the clic
        setServiceSuggestions([]);
    };

    const handleQuoteCreation = async (statusReady?: string) => {
        console.log("lors du submit, le status est : " + statusReady)
        const status = statusReady ? "READY" : "DRAFT"

        try {
            const createQuoteWithStatus = {
                ...quote,
                status,
            };
            console.log("Payload envoyé au backend :", JSON.stringify(createQuoteWithStatus));
            // Choisir le schéma de validation en fonction du statut
            const schema = statusReady === "READY" ? createQuoteFinalSchema : createQuoteDraftSchema;

            // Validation des données du formulaire en fonction du statut
            const validationResult = schema.safeParse(createQuoteWithStatus);

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
            const newQuote = await createQuote(createQuoteWithStatus, csrfToken);
            toast.success("Devis créé avec succès");

            console.log("Devis créé avec succès :", newQuote);
            // Clear localStorage
            localStorage.removeItem('quoteFormData');


            try {
                // Redirection vers le devis créé
                router.push(`/director/quotes/${newQuote.number}`);
            } catch (err) {
                console.error("Échec de la redirection :", err);
            }
        } catch (error) {
            toast.error("Erreur lors de la création du devis");

            console.error("Erreur lors de la création du devis :", error);
        }
    };

    const addService = () => {
        setQuote({
            ...quote,
            services: [
                ...quote.services,
                {
                    id: null,
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
        });
    };

    const removeService = (index: number) => {
        const newServices = quote.services.filter((_, i) => i !== index);
        setQuote({
            ...quote,
            services: newServices,
        });
    };

    // We search services suggestions with the letters the user submit (= the query)
    // We don't search if the query is less than 2 characters
    const loadServiceSuggestions = async (value: string) => {
        if (value.length < 2) return;
        try {
            const data = await fetchSuggestions("service", value);
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
    }


    // Fonction pour gérer les changements sur les champs autres que le label
    const handleServiceFieldChange = (
        index: number,
        fieldName: string,
        value: string
    ) => {
        console.log("Avant mise à jour : ", quote.services[index]);
        console.log("Champ modifié : ", fieldName, " Nouvelle valeur : ", value);
        // console.log("la valeur saisie dans le champ est : "+value+" qui provient du champ "+fieldName)

        const newServices = [...quote.services];
        newServices[index] = {
            ...newServices[index],
            // Update only targeted field
            [fieldName]: value,
        };

        console.log("Après mise à jour : ", newServices[index]);


        // setQuote({
        // ...quote,
        // services: newServices,
        // });
        updateQuoteAndStorage({
            ...quote,
            services: newServices,
        });

        if (fieldName === "label") {
            loadServiceSuggestions(value);
        }
    };

    const openChoiceDialog = () => {
        setIsOpen(true);
        console.log("la fenetre de dialog devrait être ouverte")

    };

    const closeChoiceDialog = () => {
        setIsOpen(false);
    };

    return (
        <>
  <header className="text-center my-4">
    <h1 className="text-3xl text-custom-gray">Création de devis</h1>
  </header>
            <form
            className="text-custom-white bg-primary mx-auto max-w-3xl  rounded p-5"
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleQuoteCreation();
                }}
            >
                {/* Client of the quote */}
                <section aria-labelledby="client-section">
                <h2 id="client-section" className="text-xl text-custom-gray">Client</h2>
                    <label className=""htmlFor="client">Client</label>
                    <Field className="w-full">
                        <Input type="text" name="client" value={clientInput}  className=" outline-secondary w-full h-[2rem] rounded-md bg-custom-white text-custom-gray pl-3"
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.clientId && <p style={{ color: "red" }}>{errors.clientId}</p>}

                    {clientSuggestions && (
                        <ul className=" rounded-md text-custom-gray">
                            {clientSuggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="cursor-pointer p-2 hover:bg-gray-600"
                                    onClick={() => handleClickSuggestion("client", suggestion.id, suggestion.name + " " + suggestion.firstName)}
                                >
                                    {suggestion.name} {suggestion.firstName} - {suggestion.clientNumber}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
                <h2>Chantier</h2>
                {/* WorkSite of the quote */}
                <div>
                    <label className=""htmlFor="workSite">Chantier</label>
                    <Field className="w-full">
                        <Input type="text" name="workSite" value={workSiteInput} className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.workSiteId && <p style={{ color: "red" }}>{errors.workSiteId}</p>}

                    {workSiteSuggestions && (
                        <ul className=" rounded-md text-custom-gray">
                            {workSiteSuggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="cursor-pointer p-2 hover:bg-gray-600"
                                    onClick={() => handleClickSuggestion("workSite", suggestion.id, suggestion.title)}
                                >
                                    {suggestion.title} - {suggestion.addressNumber} {suggestion.road} {suggestion.additionnalAddress} {suggestion.postalCode} {suggestion.city}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Nature of work */}
                <div>
                    <label className=""htmlFor="natureOfWork">Nature des travaux</label>
                    <Field className="w-full">
                        <Input type="text" name="natureOfWork" className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                            value={quote.natureOfWork}
                        >
                        </Input>
                    </Field>
                    {errors.natureOfWork && <p style={{ color: "red" }}>{errors.natureOfWork}</p>}

                </div>
                {/* Work description */}
                <div>
                    <label className=""htmlFor="description">Description</label>
                    <Field className="w-full">
                        <Textarea name="description" className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                            value={quote.description}
                        >
                        </Textarea>
                    </Field>
                    {errors.description && <p style={{ color: "red" }}>{errors.description}</p>}

                </div>
                {/* Work start date */}
                <div>
                    <label className=""htmlFor="workStartDate">Date prévue de début des travaux</label>
                    <Field className="w-full">
                        <Input type="date" name="workStartDate" className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                            value={quote.workStartDate}
                        >
                        </Input>
                    </Field>
                    {errors.workStartDate && <p style={{ color: "red" }}>{errors.workStartDate}</p>}

                </div>
                {/* Estimated work end date */}
                <div>
                    <label className=""htmlFor="estimatedWorkEndDate">Date prévue de fin des travaux</label>
                    <Field className="w-full">
                        <Input type="date" name="estimatedWorkEndDate" className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                            value={quote.estimatedWorkEndDate}
                        >
                        </Input>
                    </Field>
                    {errors.estimatedWorkEndDate && <p style={{ color: "red" }}>{errors.estimatedWorkEndDate}</p>}

                </div>
                {/* Estimated work duration */}
                <div>
                    <label className=""htmlFor="estimatedWorkDuration">Durée estimée des travaux (en jours)</label>
                    <Field className="w-full">
                        <Input type="number" name="estimatedWorkDuration" className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                            value={quote.estimatedWorkDuration}
                        >
                        </Input>
                    </Field>
                    {errors.estimatedWorkDuration && <p style={{ color: "red" }}>{errors.estimatedWorkDuration}</p>}

                </div>
                {/* Deposit amount */}
                <div>
                    <label className=""htmlFor="depositAmount">Accompte demandé (en €)</label>
                    <Field className="w-full">
                        <Input type="number" name="depositAmount" className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                            value={quote.depositAmount}
                        >
                        </Input>
                    </Field>
                    {errors.depositAmount && <p style={{ color: "red" }}>{errors.depositAmount}</p>}

                </div>
                <h2>Services</h2>
                {quote.services.map((service, index) => (
                    <div key={index}>
                        <Input
                            type="text"
                            name="label"
                            placeholder="Label du service"
                            value={service.label}
                            onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
                            className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3 mb-2"
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
                            onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
                            className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3 mb-2"
                        />
                        <Input
                            type="number"
                            name="unitPriceHT"
                            placeholder="Prix unitaire"
                            value={service.unitPriceHT || ""}
                            onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
                            className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3 mb-2"
                            disabled={!!service.selectedFromSuggestions}
                        />

                        <Select
                            name="type"
                            onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
                            value={service.type || ""}
                            className="w-full rounded-md  text-custom-gray pl-3"
                            disabled={!!service.selectedFromSuggestions}
                        >
                            <option value="">Type de service</option>
                            {serviceTypeChoices.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </Select>
                        <Input
                            type="number"
                            name="quantity"
                            placeholder="Quantité"
                            value={service.quantity || ""}
                            onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
                            className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3 mb-2"

                        />
                        <Select
                            name="unit"
                            onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
                            value={service.unit || ""}
                            className="w-full rounded-md  text-custom-gray pl-3"
                        >
                            <option value="">Unité</option>
                            {unitChoices.map((unit) => (
                                <option key={unit.id} value={unit.label}>{unit.label}</option>
                            ))}
                        </Select>
                        <Select
                            name="vatRate"
                            onChange={(event) => handleServiceFieldChange(index, event.target.name, event.target.value)}
                            value={service.vatRate || ""}
                            className="w-full rounded-md  text-custom-gray pl-3"
                        >
                            <option value="">Taux de tva</option>
                            {vatRateChoices.map((vatRate) => (
                                <option key={vatRate.id} value={vatRate.rate}>{vatRate.rate}</option>
                            ))}
                        </Select>
                        <Button label="Enlever le service" icon={faXmark} type="button" action={() => removeService(index)} specifyBackground="text-red-500" />
                    </div>
                ))}
                <Button label="Ajouter un service" icon={faXmark} type="button" action={() => addService()} specifyBackground="text-red-500" />


                {/* Quote : validity end date */}
                <div>
                    <label className=""htmlFor="validityEndDate">Date de fin de validité du devis</label>
                    <Field className="w-full">
                        <Input type="date" name="validityEndDate" className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                            value={quote.validityEndDate}

                        >
                        </Input>
                    </Field>
                    {errors.validityEndDate && <p style={{ color: "red" }}>{errors.validityEndDate}</p>}

                </div>
                <div>
                    <label className=""htmlFor="discountAmount">Montant de la remise, en €</label>
                    <Field className="w-full">
                        <Input type="number" name="discountAmount" className=" w-full h-[2rem] rounded-md text-custom-gray pl-3"
                            onChange={handleInputChange}
                            value={quote.discountAmount}

                        >
                        </Input>
                    </Field>
                    {errors.discountAmount && <p style={{ color: "red" }}>{errors.discountAmount}</p>}

                </div>
                <Select
                    name="discountReason"
                    onChange={handleInputChange}
                    value={quote.discountReason || ""}
                    className=" w-full rounded-md text-custom-gray pl-3"
                >
                    <option value="" >Motif de la remise</option>
                    {Object.entries(discountReasonChoices).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </Select>
                {errors.discountReason && <p style={{ color: "red" }}>{errors.discountReason}</p>}

                {/* payment Terms */}
                <div>
                    <label className=""htmlFor="paymentTerms">Conditions de paiement</label>
                    <Field className="w-full">
                        <Textarea name="paymentTerms"
                            defaultValue={"Le paiement doit être effectué dans les 30 jours suivant la réception de la facture."} className="w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                        >
                        </Textarea>
                    </Field>
                    {errors.paymentTerms && <p style={{ color: "red" }}>{errors.paymentTerms}</p>}

                </div>
                {/* Payment delay */}
                <div>
                    <label className=""htmlFor="paymentDelay">Délais de paiement (en jours)</label>
                    <Field className="w-full">
                        <Input type="number" name="paymentDelay" value={quote.paymentDelay} className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.paymentDelay && <p style={{ color: "red" }}>{errors.paymentDelay}</p>}

                </div>
                {/* late payment penalities */}
                <div>
                    <label className=""htmlFor="latePaymentPenalities">Frais de retard de paiement (HT), en €</label>
                    <Field className="w-full">
                        <Input type="number" name="latePaymentPenalities" value={quote.latePaymentPenalities} className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.latePaymentPenalities && <p style={{ color: "red" }}>{errors.latePaymentPenalities}</p>}

                </div>
                {/* travel costs */}
                <div>
                    <label className=""htmlFor="travelCosts">Frais de déplacement (HT), en €</label>
                    <Field className="w-full">
                        <Input type="number" name="travelCosts" value={quote.travelCosts} className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.travelCosts && <p style={{ color: "red" }}>{errors.travelCosts}</p>}

                </div>
                <Select
                    name="travelCostsType"
                    onChange={handleInputChange}
                    value={quote.travelCostsType || ""}
                    className=" w-full rounded-md text-custom-gray pl-3"
                >
                    <option value="">Type de frais de déplacement</option>
                    {travelCostsTypeChoices.map((travelCostsTypeChoices) => (
                        <option key={travelCostsTypeChoices} value={travelCostsTypeChoices}>{travelCostsTypeChoices}</option>
                    ))}
                </Select>
                {errors.travelCostsType && <p style={{ color: "red" }}>{errors.travelCostsType}</p>}

                {/* recovery fees */}
                <div>
                    <label className=""htmlFor="recoveryFees">Frais forfaitaires de recouvrement (HT), en €</label>
                    <Field className="w-full">
                        <Input type="number" name="recoveryFees" value={quote.recoveryFees} className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.recoveryFees && <p style={{ color: "red" }}>{errors.recoveryFees}</p>}

                </div>
                {/* has right of Withdrawal ? */}
                <Field className="">
                    <Legend>Y a t&apos;il un droit de rétractation ?</Legend>
                    <RadioGroup
                        name="hasRightOfWithdrawal"
                        value={quote.hasRightOfWithdrawal}
                        onChange={(value) => handleRadioChange("hasRightOfWithdrawal", value)}

                    >
                        {hasRightOfWithdrawalChoices.map((choice) => (
                            <Field key={choice} className="flex gap-2 items-center">
                                <Radio value={choice} className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-pink-600" />
                                <Label>{choice}</Label>
                            </Field>
                        ))}
                    </RadioGroup>
                </Field>
                {errors.hasRightOfWithDrawal && <p style={{ color: "red" }}>{errors.hasRightOfWithDrawal}</p>}

                {/* In the case of hasRightOfWithdrawal is true, display form field : Withdrawal period */}
                <div>
                    <label className=""htmlFor="withdrawalPeriod">Délai de rétractation (en jours)</label>
                    <Field className="w-full">
                        <Input type="number" value={quote.withdrawalPeriod} name="withdrawalPeriod" className=" w-full h-[2rem] rounded-md  text-custom-gray pl-3"
                            onChange={handleInputChange}
                        >
                        </Input>
                    </Field>
                    {errors.withDrawalPeriod && <p style={{ color: "red" }}>{errors.withDrawalPeriod}</p>}

                </div>
                <Input type="hidden" name="csrf_token" value={csrfToken} />

                <button
                    className="bg-red-400"
                    type="submit"
                    onClick={() => {
                        handleQuoteCreation();
                    }}
                >Enregistrer à l&apos;état de brouillon
                </button>
                <button
                    // type="button" avoid the form to be automatically submitted
                    type="button"
                    onClick={openChoiceDialog}
                    className="bg-green-600 text-custom-gray px-4 py-2 rounded-md"
                >
                    Finaliser le devis
                </button>
            </form>


              {isOpen && (
                  <Dialog
                    open={isOpen}
                    onClose={closeChoiceDialog}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    aria-labelledby="quote-final-title"
                    aria-describedby="quote-final-desc"
                  >
                    <DialogPanel className="bg-white text-[#637074] p-6 rounded-lg shadow-lg w-full max-w-md">
                      <DialogTitle id="quote-final-title" className="text-xl font-semibold text-[#1873BF] mb-2">
                      Etes-vous sûr de vouloir enregistrer le devis en version finale ?
                      </DialogTitle>
                      <Description id="quote-final-desc" className="mb-2">
                        Cette action est irréversible
                      </Description>
                      <p className="text-sm mb-4">
                      Le devis ne pourra plus être modifié ultérieurement.
                      </p>
                      <div className="flex justify-end gap-3">
                      <button
                          onClick={closeChoiceDialog}
                          className="bg-gray-200 hover:bg-gray-300 text-[#637074] px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                        >
                          Annuler
                        </button>
                        <button
                                 onClick={() => {
                                    handleQuoteCreation("READY");
                                    closeChoiceDialog();
                                }}
                          className="bg-green-600 hover:bg-red-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDA821]"
                        >
                          Enregistrer en version finale
                        </button>
                      </div>
                    </DialogPanel>
                  </Dialog>
                )}
            {/* <button type="submit">Créer</button> */}
        </>
    );
};
