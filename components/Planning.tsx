"use client";

// import { useEffect, useState } from "react";
// import { formatDate } from '@/lib/utils'
// // import toast, { Toaster } from 'react-hot-toast';
// import {Tab, TabGroup ,TabList, TabPanel, TabPanels } from '@headlessui/react';
// import Link from "next/link";
// import { fetchCreditNotes } from "@/services/api/creditNoteService";
import PlanningCalendar from "@/components/PlanningCalendar";
import Breadcrumb from "@/components/BreadCrumb";


type PlanningProps = {
    csrfToken: string;
  };

export default function Planning({csrfToken}: PlanningProps){


  return (

    <>
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/director" },
          { label: "Plannings" }, 
        ]}
      />

    <section>
        <PlanningCalendar role="director" csrfToken={csrfToken}/>
    </section>

    </>

  )
}


