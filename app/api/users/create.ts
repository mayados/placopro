import { NextRequest, NextResponse } from "next/server";
import { clerkClient, EmailAddress, User} from "@clerk/express";

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

    console.log("le prénom : "+firstName)
    console.log("le nom : "+lastName)
    console.log("le mail : "+email)
    console.log("le role : "+role)

    if (!email) {
      throw new Error("L'adresse email est requise.");
    }

    const slug = lastName.toLowerCase()+"-"+firstName.toLowerCase();
    console.log("le slug : "+slug)


    const userParameters = {
        firstName: firstName,
        lastName: lastName,
        emailAddress: email,
        publicMetadata: {role: role, slug: slug},
        skipPasswordRequirement: true,
    }

    // await clerkClient.users.createUser(userParameters)
    const user = await clerkClient.users.createUser({
        firstName: firstName,
        lastName: lastName,
        emailAddress: [email],
        // Password is not required during creation. The user will be able to set one during his first connexion
        skipPasswordRequirement: true,
        publicMetadata: {
          role: role,
          slug: slug,
        },
      });


    return NextResponse.json({ status: 200 });

  } catch (error) {
    console.error("Error with employee's creation:", error);
    return new NextResponse("Internal error, {status: 500}")

  }
}
