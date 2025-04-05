import { NextRequest, NextResponse } from "next/server";
import { clerkClient, EmailAddress, User} from "@clerk/express";
import { createUserSchema } from "@/validation/userValidation";


export async function POST(req: NextRequest) {
  // Retrieve datas from request's body
  const data = await req.json();
  const { 
    firstName,
    lastName,
    email,
    role
  } = data;

  try {

    
    // Validation avec Zod 
    const parsedData = createUserSchema.safeParse(data);
    if (!parsedData.success) {
        console.error("Validation Zod échouée :", parsedData.error.format());
            
        return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
    }
                    
    // Validation réussie, traiter les données avec le statut
    const validatedData = parsedData.data;

    // console.log("le prénom : "+firstName)
    // console.log("le nom : "+lastName)
    // console.log("le mail : "+email)
    // console.log("le role : "+role)

    if (!email) {
      throw new Error("L'adresse email est requise.");
    }

    const slug = validatedData.lastName.toLowerCase()+"-"+validatedData.firstName.toLowerCase();
    console.log("le slug : "+slug)


    const userParameters = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        emailAddress: validatedData.email,
        publicMetadata: {role: validatedData.role, slug: slug},
        skipPasswordRequirement: true,
    }

    // await clerkClient.users.createUser(userParameters)
    const user = await clerkClient.users.createUser({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        emailAddress: [validatedData.email],
        // Password is not required during creation. The user will be able to set one during his first connexion
        skipPasswordRequirement: true,
        publicMetadata: {
          role: validatedData.role,
          slug: slug,
        },
      });


    return NextResponse.json({ status: 200 });

  } catch (error) {
    console.error("Error with employee's creation:", error);
    return new NextResponse("Internal error, {status: 500}")

  }
}
