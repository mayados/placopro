import { NextRequest, NextResponse } from "next/server";
import { clerkClient} from "@clerk/express";
import { updateUserSchema } from "@/validation/userValidation";
import { sanitizeData } from "@/lib/sanitize"; 


export async function PUT(req: NextRequest) {
  // Retrieve datas from request's body
  const data = await req.json();

  // const { 
  //   id,
  //   firstName,
  //   lastName,
  //   email,
  //   role
  // } = data;

  try {
    // Exclure 'status' du schéma de validation Zod
    const { id, ...dataWithoutId } = data;
    
            
    // Validation avec Zod (sans 'status')
    const parsedData = updateUserSchema.safeParse(dataWithoutId);
    if (!parsedData.success) {
        console.error("Validation Zod échouée :", parsedData.error.format());
    
        return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
    }
            
    // Validation réussie, traiter les données avec le statut
    // Sanitizing datas
    const sanitizedData = sanitizeData(parsedData.data);
    console.log("Données nettoyées :", JSON.stringify(sanitizedData));
    
    // Ajoute le statut aux données validées
    sanitizedData.id = id;
 

    if (!sanitizedData.email) {
      throw new Error("L'adresse email est requise.");
    }

    const user = await clerkClient.users.getUser(id)

    const slug = sanitizedData.lastName.toLowerCase()+"-"+sanitizedData.firstName.toLowerCase();

    // Clerk doesn't allow us to update all the elements of the user with only one function. We have to use another function for the metadata
    const parametersSimpleUpdate = { firstName: user.firstName as string, lastName: user.lastName as string}

    // We verify if the values have changed or not. And if it's the case,
    if (user.firstName !== sanitizedData.firstName) parametersSimpleUpdate.firstName = sanitizedData.firstName;
    if (user.lastName !== sanitizedData.lastName) parametersSimpleUpdate.lastName = sanitizedData.lastName;

    const updatedEmployeeSimple = await clerkClient.users.updateUser(id, parametersSimpleUpdate)

    const parametersMetaData = {publicMetadata: { role: user.publicMetadata.role, slug: slug}}
    if(user.publicMetadata.role !== sanitizedData.role){
      parametersMetaData.publicMetadata.role = sanitizedData.role;
      
    }
    const updatedEmployeeMetadata = await clerkClient.users.updateUserMetadata(id,parametersMetaData);
    let updatedEmployeeEmail ;

    // if the mail has changed, we create a new email address
    if(user.primaryEmailAddress?.emailAddress !== sanitizedData.email){
      updatedEmployeeEmail = await clerkClient.emailAddresses.createEmailAddress({
        userId: id,
        emailAddress: sanitizedData.email,
        primary: true,
        verified: true
      })

      const formerEmailAddressId = user.primaryEmailAddressId;
      await clerkClient.emailAddresses.deleteEmailAddress(formerEmailAddressId as string)      
    }else{
      // If it has'nt changed, we just put the same mail address
      updatedEmployeeEmail = {emailAddress: sanitizedData.email}

    }



      const updatedEmployee: UserType= {
        id: updatedEmployeeSimple.id || user.id,
        email: updatedEmployeeEmail?.emailAddress,
        // first name and lasName are not to put in metadata beacause these properties already exist
        firstName: updatedEmployeeSimple.firstName || "",
        lastName: updatedEmployeeSimple.lastName || "",
        // We use an assertion type here "as" to guide TypeScript because other way publicMetadata is probably large and TypeScript can't type well. Its types {} 
         role: updatedEmployeeMetadata.publicMetadata?.role as string || "",
        slug: updatedEmployeeMetadata.publicMetadata?.slug as string || "",            
    }


    return NextResponse.json(updatedEmployee , { status: 200 });

  } catch (error) {
    console.error("Error with employee's update:", error);
    return new NextResponse("Internal error, {status: 500}")

  }
}
