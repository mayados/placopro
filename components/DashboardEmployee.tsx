"use client";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faUser,
//   faHardHat,
//   faUsers,
//   faDatabase,
// } from "@fortawesome/free-solid-svg-icons";

type EmployeeDashboardDatas = {
    workSites: [],
    plannings:[]
};

interface EmployeeDashboardProps {
  datas: EmployeeDashboardDatas;
}

export default function DirectorDashboard({
  datas,
}: EmployeeDashboardProps) {
  const {
workSites,
plannings
  } = datas;

  console.log(workSites)
  console.log(plannings)

  return (
    <main className="p-4 space-y-12">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-primary text-center">
        Bienvenue sur votre tableau de bord
      </h1>

  
    </main>
  );
}
