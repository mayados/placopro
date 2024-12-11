// Each User of clerkClient.users.getUserList() has originally this type
interface GetUserType{
    id: string;
    emailAddresses: { emailAddress: string }[];
    publicMetadata?: 
        { 
            firstName?: string; 
            lastName?: string;
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