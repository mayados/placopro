// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { GET as getUser} from "@/app/api/users/[employeeSlug]/get"; 
import { DELETE as deleteUser} from "@/app/api/users/[employeeSlug]/delete"; 
import { PUT as updateUser} from "@/app/api/users/[employeeSlug]/update"; 

export async function GET(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const employeeSlug = pathname.split("/").pop(); 
  
    if (!employeeSlug) {
      return NextResponse.json({ error: "employeeSlug is required" }, { status: 400 });
    }
    return getUser(req, { params: { employeeSlug } }); 

}

export async function DELETE(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const employeeSlug = pathname.split("/").pop(); 
  
    if (!employeeSlug) {
      return NextResponse.json({ error: "employeeSlug is required" }, { status: 400 });
    }
    return deleteUser(req, { params: { employeeSlug } });  
  }
  
  export async function PUT(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const employeeSlug = pathname.split("/").pop(); 
  
    if (!employeeSlug) {
      return NextResponse.json({ error: "employeeSlug is required" }, { status: 400 });
    }

    return updateUser(req);  

  }
  
