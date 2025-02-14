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
    beginsThe: Date;
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

interface PlanningType{
    id: string;
}

interface BillType{
    id: string;
    number: number;
    natureOfWork: string;
    description: string;
    totalHt: number;
    totalTtc: number;
    vatAmount: number;
    issueDate: Date;
    dueDate: Date;
    status: string;
    paymentDate?: Date;
    author: UserType;
    client: ClientType;
    services: BillServiceType[];
}

interface CreateBillFormValueType{
    number: string | null;
    dueDate: string | null;
    natureOfWork: string | null,
    description: string | null,
    issueDate: string | null,
    vatAmount: number | null,
    totalTtc: number | null,
    totalHt: number | null;
    serviceType: string | null;
    workSiteId: string | null;
    quoteId:  string | null | undefined,
    clientId:  string | null,
    services: ServiceFormQuoteType[] | [];
    servicesToUnlink: ServiceFormQuoteType[] | [];
    servicesAdded: ServiceFormQuoteType[] | [];
    status: string | null;
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

interface UpdatedBillFormValueType{
    id: string | null;
    number: number| null;
    natureOfWork: string | null;
    description: string | null;
    totalHt: number | null;
    totalTtc: number | null;
    vatAmount: number | null;
    issueDate: Date | null;
    dueDate: Date | null;
    paymentDate?: Date | null;
    status: string | null,
    author: string | null;
    client: string | null;
    services: BillServiceType[];
}

interface FormValuesUpdateNotDraftBill{
    id: string | null,
    status: string | null,
    paymentDate: Date | null,
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
    travelCosts?: number;
    depositAmount?: number;
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

interface ServiceType{
    id: string,
    label: string,
    unitPriceHT: string,
    type: string;
    vatRate: string;
    unit: string,  
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
