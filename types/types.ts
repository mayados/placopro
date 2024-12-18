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

interface CompanyTypeSingle{
    company: CompanyType;
}

// When we fecth the API, we get a list of CompanyType
interface CompanyListType{
    companies: CompanyType[]
}