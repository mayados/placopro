"use client";

// import { useEffect, useState } from "react";
// import { formatDate } from '@/lib/utils'
// // import toast, { Toaster } from 'react-hot-toast';
// import {Tab, TabGroup ,TabList, TabPanel, TabPanels } from '@headlessui/react';
// import Link from "next/link";
// import { fetchCreditNotes } from "@/services/api/creditNoteService";
import PlanningCalendar from "@/components/PlanningCalendar";

type PlanningProps = {
    csrfToken: string;
  };

export default function Planning({csrfToken}: PlanningProps){


  return (

    <>
    <div className="flex w-screen">
        {/* <div><Toaster/></div> */}

    <section>
        <PlanningCalendar role="director" csrfToken={csrfToken}/>
    </section>

    </div>
    </>

  )
}


