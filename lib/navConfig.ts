import {
    faClipboardList,
    faUser,
    faHammer,
    faAddressBook,
    faCalendarDays,
    faFileLines,
    faFileInvoiceDollar,
    faFileContract,
    faHourglassHalf,
  } from '@fortawesome/free-solid-svg-icons';
  import { IconDefinition } from '@fortawesome/fontawesome-svg-core'; // 👈 à importer


  export const navItemsByRole: {
    [key: string]: {
      label: string;
      icon: IconDefinition;
      href?: string;
      children?: { label: string; href: string }[];
    }[];
  } = {
    DIRECTOR: [
      { label: 'Dashboard', icon: faClipboardList, href: '/intranet/director' },

      { label: 'To do list', icon: faClipboardList, href: '/intranet/common-intranet/toDo' },
      {
        label: 'Clients',
        icon: faUser,
        children: [
          { label: 'Liste', href: '/intranet/common-intranet/clients' },
          { label: 'Prospects', href: '/intranet/common-intranet/prospects' },
          { label: 'Pseudonymisés', href: '/intranet/director/clients' },
          { label: 'Ajouter un client', href: '/intranet/common-intranet/clients/create' },
        ],
      },
      {
        label: 'Chantiers',
        icon: faHammer,
        children: [
          { label: 'Liste', href: '/intranet/common-intranet/workSites' },
          { label: 'Ajouter un chantier', href: '/intranet/common-intranet/workSites/create' },
        ],
      },
      {
        label: 'Employés',
        icon: faAddressBook,
        children: [
          { label: 'Liste', href: '/intranet/director/employees' },
          { label: 'Ajouter un employé', href: '/intranet/director/employees/create' },
        ],
      },
      { label: 'Planning', icon: faCalendarDays, href: '/intranet/director/plannings' },
      {
        label: 'Devis',
        icon: faFileLines,
        children: [
          { label: 'Liste', href: '/intranet/common-intranet/quotes' },
          { label: 'Créer un devis', href: '/intranet/common-intranet/quotes/create' },
        ],
      },
      { label: 'Factures', icon: faFileInvoiceDollar, href: '/intranet/common-intranet/bills' },
      { label: 'Avoirs', icon: faFileContract, href: '/intranet/common-intranet/creditNotes' },
      { label: 'Calculer un temps de trajet', icon: faHourglassHalf, href: '/intranet/common-intranet/travel' },
    ],
    EMPLOYEE: [
      { label: 'Dashboard', icon: faClipboardList, href: '/intranet/employee' },
      { label: 'Planning', icon: faCalendarDays, href: '/intranet/employee/planning' },
      { label: 'Mes chantiers', icon: faHammer, href: '/intranet/employee/workSites' },
      { label: 'Calculer un temps de trajet', icon: faHourglassHalf, href: '/intranet/common-intranet/travel' },
    ],
    SECRETARY: [
      { label: 'Dashboard', icon: faClipboardList, href: '/intranet/secretary' },

        { label: 'To do list', icon: faClipboardList, href: '/intranet/common-intranet/toDo' },
        {
          label: 'Clients',
          icon: faUser,
          children: [
            { label: 'Liste', href: '/intranet/common-intranet/clients' },
            { label: 'Prospects', href: '/intranet/common-intranet/prospects' },
            { label: 'Ajouter un client', href: '/intranet/common-intranet/clients/create' },
          ],
        },
        // {
        //   label: 'Chantiers',
        //   icon: faHammer,
        //   children: [
        //     { label: 'Liste', href: '/intranet/director/workSites' },
        //     { label: 'Ajouter un chantier', href: '/intranet/director/workSites/create' },
        //   ],
        // },
        {
          label: 'Devis',
          icon: faFileLines,
          children: [
            { label: 'Liste', href: '/intranet/director/quotes' },
            { label: 'Créer un devis', href: '/intranet/director/quotes/create' },
          ],
        },
        { label: 'Factures', icon: faFileInvoiceDollar, href: '/intranet/director/bills' },
        { label: 'Avoirs', icon: faFileContract, href: '/intranet/director/creditNotes' },
        { label: 'Calculer un temps de trajet', icon: faHourglassHalf, href: '/intranet/common-intranet/travel' },
    ],
  };
  