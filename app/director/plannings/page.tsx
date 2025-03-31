"use client";

import { useEffect, useState } from "react";
import { formatDate } from '@/lib/utils'
// import toast, { Toaster } from 'react-hot-toast';
import {Tab, TabGroup ,TabList, TabPanel, TabPanels } from '@headlessui/react';
import Link from "next/link";
import { fetchCreditNotes } from "@/services/api/creditNoteService";
import PlanningCalendar from "@/components/PlanningCalendar";

const Planning = () =>{


  return (

    <>
    <div className="flex w-screen">
        {/* <div><Toaster/></div> */}

    <section>
        <PlanningCalendar role="director" />
    </section>

    </div>
    </>

  )
}

export default Planning

