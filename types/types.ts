
// Each User of clerkClient.users.getUserList() has originally this type
interface GetUserType{
    id: string;
    emailAddresses: { emailAddress: string }[];
    // We have to add nnull here, in option, because in User object of clerk, these properties can be null. So we have to adapt the type here
    firstName?: string | null,
    lastName?: string | null,
    publicMetadata?: 
        { 
            role?: string;
            slug?: string;
        };
  
}


// in the api routes for director, we assign each element of the GetUserType to a property. When we get datas in the view for each user it's this type ;
interface UserType{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    slug: string;
}

interface UserFormValueType{
    firstName: string,
    lastName: string,
    role: string,
    email: string,
}

// When we fecth the API, we get a list of UserType
interface ClerkUserListType{
    userList: UserType[]
}

interface CompanyType{
    id: string;
    name: string;
    slug: string;
    type: string;
    phone: string;
    mail: string;
    capital: number;
    rcs: string;
    siret: string;
    ape: string;
    intraCommunityVat: string;
    road: string;
    addressNumber: string;
    postalCode: string;
    city: string;
    additionnalAddress?: string | null | undefined;
    decennialInsuranceName: string;
    insuranceContractNumber: string;
    aeraCoveredByInsurance: string;
}



interface ClientTypeSingle{
    client: ClientType;
}

interface ClientFormValueType{
    name: string,
    firstName: string,
    mail: string,
    phone: string,
    road: string,
    addressNumber: string,
    postalCode:string,
    city: string,
    additionalAddress: string | null,
    prospectNumber: string | null,
}

interface CompanyTypeSingle{
    company: CompanyType;
}

// When we fecth the API, we get a list of CompanyType
interface CompanyListType{
    companies: CompanyType[]
}

interface CompanyFormValueType{
    name: string,
    type: string,
    phone:string,
    email: string,
    capital: string,
    rcs: string,
    siret: string,
    ape: string,
    intraCommunityVat: string,
    addressNumber: string,
    road: string,
    additionnalAddress: string | null,
    postalCode: string,
    city: string,
    insuranceName: string,
    insuranceContractNumber: string,
    insuranceCoveredZone: string,
}

interface WorkSiteCreationType{
    title: string,
    description: string,
    beginsThe: string,
    status:string,
    road: string,
    addressNumber: string,
    postalCode: string,
    city: string,
    additionnalAddress: string | null,
    clientId: string | null,
}


interface WorkSiteType{
    id: string;
    title: string;
    slug: string;
    description: string;
    beginsThe: Date;
    status: string;
    completionDate: Date | null;
    road: string;
    addressNumber: string;
    postalCode: string;
    city: string;
    additionnalAddress: string;
    client: ClientTypeSuggestion;
    quotes: QuoteType[];
    plannings: PlanningType[];
}

interface WorkSiteSuggestionType{
    id: string;
    title: string;
    slug: string;
    road: string;
    addressNumber: string;
    postalCode: string;
    city: string;
    additionnalAddress: string;
    client: ClientTypeSuggestion;
    quotes: QuoteType[];
}

interface WorkSiteTypeWithoutQuotesAndPlannings{
    id: string;
    title: string;
    slug: string;
    description: string;
    beginsThe: Date | null;
    status: string;
    completionDate: Date | null;
    road: string;
    addressNumber: string;
    postalCode: string;
    city: string;
    additionnalAddress: string;
    client: ClientType;
}

interface WorkSiteWithTotalsAndStatus{
    success: boolean,
    workSites: WorkSiteForListType[],
    commingWorkSites: WorkSiteForListType[],
    inProgressWorkSites: WorkSiteForListType[],
    completedWorkSites: WorkSiteForListType[],
    totalWorkSites : number,
    totalCommingWorkSites : number,
    totalInProgressWorkSites : number,
    totalCompletedWorkSites : number,
}


interface WorkSiteForListType{
    id: string;
    title: string;
    slug: string;
    status: string;
    city: string;
    beginsThe: Date;
}

interface WorkSiteTypeSingle{
    workSite: WorkSiteType;
}

interface WorkSitesListType{
    workSites: WorkSiteForListType[]
}

interface EstimationType{
    id: string;
}

interface BillType{
    id: string;
    number: string;
    natureOfWork: string;
    description: string;
    totalHt: number;
    totalTtc: number;
    vatAmount: number;
    issueDate: Date;
    dueDate: Date;
    status: string;
    billType: string;
    paymentDate?: Date;
    paymentMethod?: string,
    canceledAt?: Date,
    paymentTerms: string,
    discountAmount: number,
    discountReason: string,
    author: UserType;
    client: ClientType;
    services: BillServiceType[];
    creditNotes: CreditNoteType[],
    workSite : WorkSiteType;
    isDiscountFromQuote: boolean;
    travelCosts: number,
    travelCostsType: string,
    workStartDate: Date,
    workEndDate: Date,
    workDuration: number,
    quote: QuoteType
}
//
interface CreateBillFormValueType{
    number: string | null;
    dueDate: Date | null;
    natureOfWork: string | null,
    description: string | null,
    issueDate: string | null,
    vatAmount: number | null,
    totalTtc: number | null,
    totalHt: number | null,
    discountAmount: number | null | undefined;
    isDiscountFromQuote: boolean,
    // serviceType: string | null;
    workSiteId: string | null;
    quoteId:  string | null | undefined,
    clientId:  string | null,
    services: ServiceFormQuoteType[] | [];
    servicesToUnlink: ServiceFormQuoteType[] | [];
    servicesAdded: ServiceFormQuoteType[] | [];
    status: string | null;
    paymentTerms: string,
    travelCosts: number | null,
    travelCostsType: string | null,
    workStartDate: Date | null,
    workEndDate: Date | null,
    workDuration: number | null,
    discountReason: string | null | undefined
}



interface BillForListType{
    id: string;
    number: string;
    client: ClientType;
    issueDate: Date;
    dueDate: Date;
    status: string;
}

interface BillTypeSingle{
    bill: BillType;
}

interface CreateDepositBillFormValueType{
    number: string | null;
    dueDate: string | null;
    natureOfWork: string | null,
    description: string | null,
    issueDate: string | null,
    vatAmount: number | null,
    totalTtc: number | null,
    totalHt: number | null,
    discountAmount: number | null | undefined;
    isDiscountFromQuote: boolean,
    serviceType: string | null;
    workSiteId: string | null;
    quoteId:  string | null | undefined,
    clientId:  string | null,
    services: ServiceFormQuoteType[] | [];
    status: string | null;
    paymentTerms: string,
    travelCosts: number | null,
    travelCostsType: string | null,
    workStartDate: Date | null,
    workEndDate: Date | null,
    workDuration: Date | null,
    discountReason: string | null | undefined
}

interface FormValuesUpdateNotDraftBill{
    id: string | null,
    status: string | null,
    paymentDate: Date | null,
    canceledAt: Date | null,
    paymentMethod: string | null,
}

interface UpdatedBillFormValueType{
    number?: string | null
    natureOfWork: string | null;
    description: string | null;
    totalHt: number | null;
    totalTtc: number | null;
    vatAmount: number | null;
    // issueDate: Date | null;
    dueDate: Date | null;
    // paymentDate?: Date | null;
    status: string | null,
    clientId: string | null;
    serviceType: string | null,
    workSiteId: string | null,
    billId: string | null | undefined,
    quoteId: string | null,
    workStartDate: Date | null,
    workEndDate: Date | null,
    workDuration: number | null,
    // isDiscountFromQuote: boolean | null,
    // services: BillServiceType[];
    services: ServiceFormBillType[];
    discountAmount: number | null,
    discountReason: string | null,
    travelCosts: number | null,
    travelCostsType: string | null,
    paymentTerms: string
    servicesToUnlink: ServiceFormBillType[] | [],
    servicesAdded: ServiceFormBillType[] | [],
}

interface UpdatedDepositBillFormValueType{
    id:string | null,
    dueDate: Date | null;
    status: string | null,
    paymentTerms: string
}

interface QuoteType{
    id:string;
    number: string;
    issueDate: Date;
    validityEndDate: Date;
    natureOfWork: string;
    description: string;
    workStartDate: Date;
    estimatedWorkEndDate: Date;
    estimatedWorkDuration: number;
    isQuoteFree: boolean;
    status: string;
    vatAmount: number;
    priceTTC: number;
    priceHT: number;
    travelCosts: number;
    travelCostsType: string;
    depositAmount?: number ;
    hourlyLaborRate?: number;
    paymentTerms: string;
    paymentDelay: number;
    latePaymentPenalties?: number;
    recoveryFee?: number;
    isSignedByClient: boolean;
    signatureDate: Date;
    hasRightOfWithdrawal: boolean;
    withdrawalPeriod: number;
    quoteCost?: number;
    author: UserType;
    client: ClientType;
    workSite: WorkSiteType;
    services : QuoteServiceType[];
    discountAmount?: number;
    discountReason?: string
}

interface QuoteTypeSingle{
    quote: QuoteType;
}

interface QuoteFormValueType{
    validityEndDate: string,
    natureOfWork: string,
    description: string,
    workStartDate: string,
    estimatedWorkEndDate: string,
    estimatedWorkDuration: string,
    vatAmount: number,
    isQuoteFree: string,
    hasRightOfWithdrawal: string,
    priceTTC: number,
    priceHT: number,
    travelCosts: number,
    travelCostsType: string,
    depositAmount: number,
    discountAmount: number,
    discountReason: string,
    hourlyLaborRate: number,
    paymentTerms: string,
    paymentDelay: number,
    latePaymentPenalities: number,
    recoveryFees: number,
    withdrawalPeriod: number,
    quoteCost: number,
    clientId: string | null,
    workSiteId: string | null,
    services: ServiceFormQuoteType[],
    serviceType: string,
}

// The values can be null, it means the form field hasn't been updated, so the quote either
interface UpdatedQuoteFormValueType{
    number?: string
    validityEndDate: string | null,
    natureOfWork: string | null,
    description: string | null,
    workStartDate: string | null,
    estimatedWorkEndDate: string | null,
    estimatedWorkDuration: string | null,
    vatAmount: number | null,
    isQuoteFree: string | null,
    hasRightOfWithdrawal: string | null,
    priceTTC: number | null,
    priceHT: number | null,
    depositAmount: number | null,
    discountAmount: number | null,
    discountReason: string | null,
    travelCostsType: string | null,
    travelCosts: number | null,
    hourlyLaborRate: number | null,
    paymentTerms: string | null,
    paymentDelay: number | null,
    latePaymentPenalities: number | null,
    recoveryFee: number | null,
    withdrawalPeriod: number | null,
    quoteCost: number | null,
    clientId: string | null,
    workSiteId: string | null,
    services: ServiceFormQuoteType[] | [],
    servicesToUnlink: ServiceFormQuoteType[] | [],
    serviceType: string | null,
    workSite?: string | null,
    client?: string | null,
}

interface QuoteForListType{
    id: string;
    number: string;
    client: ClientType;
    workSite: WorkSiteType;
    workStartDate: Date;
    validityEndDate: Date;
    status: string;
}

interface QuotesWithTotalsAndStatus{
    success: boolean,
    quotes: QuoteForListType[],
    draftQuotes: QuoteForListType[],
    readyToBeSentQuotes: QuoteForListType[],
    sentQuotes: QuoteForListType[],
    acceptedQuotes: QuoteForListType[],
    refusedQuotes: QuoteForListType[],
    totalQuotes : number,
    totalDraftQuotes : number,
    totalReadyToBeSentQuotes : number,
    totalSentQuotes : number,
    totalAcceptedQuotes : number,
    totalRefusedQuotes : number,
}

interface BillsWithTotalsAndStatus{
    success: boolean,
    bills: BillForListType[],
    draftBills: BillForListType[],
    readyToBeSentBills: BillForListType[],
    sentBills: BillForListType[],
    canceledBills: BillForListType[],
    totalBills : number,
    totalDraftBills : number,
    totalReadyToBeSentBills : number,
    totalSentBills : number,
    totalAcceptedBills : number,
    totalCanceledBills : number,
}

interface BillFormValueType{
    validityEndDate: string,
    natureOfWork: string,
    description: string,
    workStartDate: string,
    estimatedWorkEndDate: string,
    estimatedWorkDuration: string,
    vatAmount: number,
    isQuoteFree: string,
    hasRightOfWithdrawal: string,
    priceTTC: number,
    priceHT: number,
    travelCosts: number,
    hourlyLaborRate: number,
    paymentTerms: string,
    paymentDelay: number,
    latePaymentPenalities: number,
    recoveryFees: number,
    withdrawalPeriod: number,
    quoteCost: number,
    clientId: string | null,
    workSiteId: string | null,
    services: ServiceFormQuoteType[],
    serviceType: string,
    discountAmount: number,
    discountReason: number,
    travelCostsType: string,
}


interface BillServiceType{
    id: string;
    label: string,
    type: string,
    vatRate: string,
    unit: string, 
    quantity: number,
    detailsService: string,
    service: ServiceType,
    vatAmount: number,
    totalHT: number,
    totalTTC: number,
}

interface ServiceAndBillServiceType{
    id: string;
    label: string,
    unitPriceHT: number,
    type: string,
    vatRate: string,
    unit: string, 
    quantity: number,
    detailsService: string,
    serviceId : string,
}

interface ServiceType{
    id: string,
    label: string,
    unitPriceHT: string,
    type: string;
    vatRate: string;
    unit: string,  
    quotes?: QuoteServiceType[]
}

interface ServiceUnitType {
    id: string,
    unit: UnitType,
    service: ServiceType,
}

interface ServiceWithSuggestionsIndicatorType{
    id: string,
    label: string,
    unitPriceHT: string,
    type: string;
    vatRate: string;
    unit: string,
    selectedFromSuggestions?: boolean,
}

interface UnitType {
    id: string,
    label: string,
}

interface ServiceFormQuoteType{
    id: string | null,
    label: string,
    unitPriceHT?: string,
    type?: string;
    vatRate?: string;
    unit?: string,
    selectedFromSuggestions?: boolean,
    quantity?: number,
    detailsService?: string,
}

interface ServiceFormBillType{
    id: string | null,
    label: string,
    unitPriceHT?: string,
    type?: string;
    vatRate?: string;
    unit?: string,
    selectedFromSuggestions?: boolean,
    quantity?: number,
    detailsService?: string,
    // service?: { // Ajout du sous-objet service
    //     id: string;
    //     label: string;
    //     unitPriceHT?: number;
    //     type?: string;
    // };
}

enum ClientOrProspectEnum {
  CLIENT= 'CLIENT',
  PROSPECT= 'PROSPECT',
};

enum CreditNoteSettlementTypeEnum {
  REFUND = "Remboursement",
  COMPENSATION = "Compensation"
}

enum CreditNoteReasonEnumDescription {
    MISTAKE = "Erreur de facturation",
    CANCELLATION = "Remise exceptionnelle",
    DISCOUNT = "Remise exceptionnelle",
    COMPENSATION = "Compensation",
    DUPLICATE = "Duplication de facture",
    WRONG_CUSTOMER = "Mauvais client",
    DEPOSIT_REFUND = "Remboursement d'acompte",
    DEPOSIT_ADJUSTMENT = "Ajustement d'acompte"
}

enum BillTypeEnum {
    DEPOSIT = "DEPOSIT",
    FINAL = "FINAL",
    INVOICE = "INVOICE"
  }
  

interface CreditNoteType{
    id: string,
    number: string,
    issueDate: Date,
    reason: CreditNoteReasonEnumDescription,
    amount: number,
    settlementType?: CreditNoteSettlementTypeEnum,
    isSettled: boolean, 
    billId: string,
    bill: BillType,
}

interface CreditNoteForListType{
    id: string,
    number: string,
    reason: CreditNoteReasonEnumDescription,
    isSettled: boolean,
    bill: BillType,
    issueDate: Date
}

interface CreateCreditNoteFormValueType{
    amount: number;
    billId: string | null;
    reason: string | CreditNoteReasonEnumDescription;
}

interface UpdateCreditNoteFormValueType{
    id: string | null;
    isSettled: boolean | null;
    settlementType: null | CreditNoteSettlementTypeEnum;
}

interface CreditNotesWithTotalsAndStatus{
    success: boolean,
    creditNotes: CreditNoteForListType[],
    settledCreditNotes: CreditNoteForListType[],
    notSettledCreditNotes: CreditNoteForListType[],
    totalCreditNotes : number,
    totalSettledCreditNotes : number,
    totalNotSettledCreditNotes : number,
}

interface ServiceSuggestionType{
    id: string,
    label: string,
    unitPriceHT: string,
    type: string,
}

interface QuoteServiceType {
    id: string;
    label: string,
    type: string,
    vatRate: string,
    unit: string, 
    quantity: number,
    detailsService: string,
    service: ServiceType,
    vatAmount: number,
    totalHT: number,
    totalTTC: number,
}

interface ServiceAndQuoteServiceType{
    id: string;
    label: string,
    unitPriceHT: number,
    type: string,
    vatRate: string,
    unit: string, 
    quantity: number,
    detailsService: string,
    serviceId : string,
}


interface ProspectType{
    id: string;
    prospectNumber: string;
    name: string;
    firstName: string;
    slug: string;
    mail: string;
    phone: string | null;
    isConverted: boolean;
    estimations?: EstimationType[]
    client? : ClientType | null;
}

interface ClientType{
    id: string;
    clientNumber: string;
    name: string;
    firstName: string;
    slug: string;
    mail: string;
    phone: string;
    road: string
    addressNumber: string | null;
    postalCode: string | null;
    city: string | null;
    additionalAddress: string | null;
    isAnonymized: boolean;
    prospect?: ProspectType | null;
    workSites?: WorkSiteType[];
    bills?: BillType[];
    quotes?: QuoteType[];
}

interface ClientTypeSuggestion{
    id: string | null;
    clientNumber: string;
    name: string;
    firstName: string;
    slug: string;
    mail: string;
    phone: string;
    road: string
    addressNumber: string;
    postalCode: string;
    city: string;
    additionalAddress: string;
    isAnonymized: boolean;
    prospect?: ProspectType | null;
    workSites?: WorkSiteType[];
    bills?: BillType[];
    quotes?: QuoteType[];
}

interface ClientSuggestionType{
    id: string;
    clientNumber: string;
    name: string;
    firstName: string;
}

interface ClientTypeList{
    clients: ClientType[];
}

interface VatRateChoiceType{
    id: string,
    rate: number,
}

interface VatRateListType{
    vatRates: VatRateChoiceType[]
}

interface UnitChoiceType{
    id: string,
    label: string,
}

interface UnitListType{
    units: UnitChoiceType[]
}

interface ServiceSuggestionsListType{
    suggestions: ServiceType[]
}

interface FormValuesUpdateNotDraftQuote{
    id: string | null,
    status: string | null,
    isSignedByClient: string | null,
    signatureDate: Date | null,
}

interface SuggestionsResponse<T> {
    suggestions: T[];
}
  
interface UpdatedDraftQuoteResponse{
    updatedQuote: QuoteType;
}

interface PlanningType{
    id: string,
    task: string,
    startTime: Date,
    endTime: Date,
    clerkUserId: string,
    employee?: string,
    workSiteId: string,
    workSite: WorkSiteType
}

interface PlanningsListType{
    success: boolean,
    plannings: PlanningType[], 
}

// For FullCalendar event
interface CalendarEvent {
    id?: string;
    title: string;
    start: Date;
    end: Date;
    clerkUserId: string,
    workSiteId: string,
}

// For FullCalendar event update
interface UpdateCalendarEventType {
    id: string;
    title: string | null;
    start: Date | null;
    end: Date | null;
    clerkUserId: string | null,
    workSiteId: string | null,
}

// For FullCalendar event update
interface CreateOrUpdateCalendarEventType {
    id?: string;
    title?: string | null;
    start?: Date | null;
    end?: Date | null;
    clerkUserId?: string | null,
    workSiteId?: string | null,
}

interface EmployeeType {
    id: string;
    firstName: string;
    lastName: string;
  }

interface FormErrors {
    [key: string]: string;
}