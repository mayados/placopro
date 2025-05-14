import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { createQuoteDraftSchema, createQuoteFinalSchema } from "@/validation/quoteValidation";
import { sanitizeData } from "@/lib/sanitize";
import { QuoteStatusEnum } from "@prisma/client";
import { generateSlug } from "@/lib/utils";
import { generateQuoteNumber } from "@/modules/quote/generateQuoteNumber";
import { createOrUpdateServices } from "@/modules/quote/services";
import { createQuote, updateQuote } from "@/modules/quote/quote";
import { createQuoteServicesAndBackup } from "@/modules/quote/quoteService";


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
  const data = await req.json();

  console.log("Données reçues dans la requête :", data);


  // currentUser() is a founction from Clerk which allows to retrieve the current User
  const user = await currentUser()
  if (!data) {
    return NextResponse.json({ success: false, message: "Aucune donnée reçue." }, { status: 400 });
  }

  if (!user) {
    return NextResponse.json({
      success: false,
      message: "Utilisateur non authentifié."
    }, { status: 401 });
  }

  try {

    // Détecter si la facture est en "brouillon" ou en "final"
    // Exclure 'status' du schéma de validation Zod
    const { status, ...dataWithoutStatus } = data;

    // Choisir le schéma en fonction du statut (avant ou après validation)
    const schema = status === QuoteStatusEnum.READY ? createQuoteFinalSchema : createQuoteDraftSchema;

    // Validation avec Zod (sans 'status')
    const parsedData = schema.safeParse(dataWithoutStatus);
    if (!parsedData.success) {
      console.error("Validation Zod échouée :", parsedData.error.format());

      return NextResponse.json({ success: false, message: parsedData.error.errors }, { status: 400 });
    }

    // Validation réussie, traiter les données avec le statut
    // Sanitizing datas
    const sanitizedData = sanitizeData(parsedData.data);
    console.log("Données nettoyées :", JSON.stringify(sanitizedData));

    // Ajoute le statut aux données validées
    sanitizedData.status = status;

    // We have to know if the quote was saved as a draft
    const isDraft = status === QuoteStatusEnum.DRAFT;
    const quoteNumber = await generateQuoteNumber("quote", isDraft);

    // for each data.services : see if it already exists. If it's the case, it has an id. In the other case, the Id is null.
    // we wait for all the promises to be resolved before to continue
    await createOrUpdateServices(data.services);


    const slug = generateSlug("dev");


    // We create the quote thanks to te datas retrieved
    const quote = await createQuote(sanitizedData, user.id, quoteNumber, status, slug);


    const { backup, totals } = await createQuoteServicesAndBackup(data.services, quote.id);

// 3. Mise à jour finale du devis avec les totaux et les backups
const newQuote = await updateQuote(sanitizedData, quote, backup, totals);

    return NextResponse.json(newQuote);

  } catch (error) {
    console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

    return NextResponse.json({
      success: false,
      error: error
    }, { status: 500 });
  }
}
