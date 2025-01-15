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

interface CompanyTypeSingle{
    company: CompanyType;
}

// When we fecth the API, we get a list of CompanyType
interface CompanyListType{
    companies: CompanyType[]
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
    isPaid: boolean;
    paymentDate?: Date;
    author: UserType;
    client: ClientType;
    services: BillServiceType[];
}

interface QuoteType{
    id:string;
    number: number;
    issueDate: Date;
    validityEndDate: Date;
    natureOfWork: string;
    description: string;
    workStartDate?: Date;
    estimateWorkEndDate?: Date;
    estimatedWorkDuration: number;
    isQuoteFree: boolean;
    status: string;
    vatAmount: number;
    priceTtc: number;
    priceHt: number;
    travelCosts?: number;
    hourlyLaborRate?: number;
    paymentTerms: string;
    paymentDelay: number;
    latePaymentPenalities?: number;
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

interface BillServiceType{
    id: string;
}

interface ServiceType{
    id?: string,
    label: string,
    unitPriceHT?: string,
    type?: string;
    vatRate?: string;
    unit?: string,
    selectedFromSuggestions?: boolean,
}

interface ServiceFormQuoteType{
    id?: string,
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

interface QuoteServiceType{
    id: string;
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
