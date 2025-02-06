// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { POST as createUser } from "@/app/api/users/create"; 
import { GET as getUsers} from "@/app/api/users/list"; 
import { DELETE as deleteUser} from "@/app/api/users/delete"; 
import { PUT as updateUser} from "@/app/api/users/update"; 

export async function GET(req: NextRequest) {

    return getUsers(req); 
}

export async function POST(req: NextRequest) {
  return createUser(req);  
}

export async function DELETE(req: NextRequest, { params }: { params: { employeeId: string }}) {
  return deleteUser(req, {params});  
}

export async function UPDATE(req: NextRequest, { params }: { params: { employeeId: string }}) {
  return updateUser(req);  
}
