import { NextRequest, NextResponse } from "next/server";
import { clerkClient, EmailAddress, User} from "@clerk/express";

export async function PUT(req: NextRequest) {
  // Retrieve datas from request's body
  const data = await req.json();
  const { 
    id,
    firstName,
    lastName,
    email,
    role
  } = data;

  try {

    if (!email) {
      throw new Error("L'adresse email est requise.");
    }

    const user = await clerkClient.users.getUser(id)

    const slug = lastName.toLowerCase()+"-"+firstName.toLowerCase();

    // Clerk doesn't allow us to update all the elements of the user with only one function. We have to use another function for the metadata
    const parametersSimpleUpdate = { firstName: user.firstName as string, lastName: user.lastName as string}

    // We verify if the values have changed or not. And if it's the case,
    if (user.firstName !== firstName) parametersSimpleUpdate.firstName = firstName;
    if (user.lastName !== lastName) parametersSimpleUpdate.lastName = lastName;

    const updatedEmployeeSimple = await clerkClient.users.updateUser(id, parametersSimpleUpdate)

    const parametersMetaData = {publicMetadata: { role: user.publicMetadata.role, slug: slug}}
    if(user.publicMetadata.role !== role){
      parametersMetaData.publicMetadata.role = role;
      
    }
    const updatedEmployeeMetadata = await clerkClient.users.updateUserMetadata(id,parametersMetaData);
    let updatedEmployeeEmail ;

    // if the mail has changed, we create a new email address
    if(user.primaryEmailAddress?.emailAddress !== email){
      updatedEmployeeEmail = await clerkClient.emailAddresses.createEmailAddress({
        userId: id,
        emailAddress: email,
        primary: true,
        verified: true
      })

      const formerEmailAddressId = user.primaryEmailAddressId;
      await clerkClient.emailAddresses.deleteEmailAddress(formerEmailAddressId as string)      
    }else{
      // If it has'nt changed, we just put the same mail address
      updatedEmployeeEmail = {emailAddress: email}

    }



      const employee: UserType= {
        id: updatedEmployeeSimple.id || user.id,
        email: updatedEmployeeEmail?.emailAddress,
        // first name and lasName are not to put in metadata beacause these properties already exist
        firstName: updatedEmployeeSimple.firstName || "",
        lastName: updatedEmployeeSimple.lastName || "",
        // We use an assertion type here "as" to guide TypeScript because other way publicMetadata is probably large and TypeScript can't type well. Its types {} 
         role: updatedEmployeeMetadata.publicMetadata?.role as string || "",
        slug: updatedEmployeeMetadata.publicMetadata?.slug as string || "",            
    }


    return NextResponse.json({updatedEmployee: employee }, { status: 200 });

  } catch (error) {
    console.error("Error with employee's update:", error);
    return new NextResponse("Internal error, {status: 500}")

  }
}
