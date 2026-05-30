import {
  useState,
  useEffect
} from "react";

import GreetingHeader
from "../../components/dashboard/GreetingHeader";

import DashboardActions
from "../../components/dashboard/sections/DashboardActions";

import StatsSection
from "../../components/dashboard/sections/StatsSection";

import AnalyticsSection
from "../../components/dashboard/sections/AnalyticsSection";

import BottomSection
from "../../components/dashboard/sections/BottomSection";

import {
  getTransactions
} from "../../services/transactionService";

import {
  getWallets
} from "../../services/walletService";

const DashboardPage = () => {

  /* =========================
     USER
  ========================= */

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  /* =========================
     STATES
  ========================= */

  const [
    transactions,
    setTransactions
  ] = useState([]);

  const [
    wallets,
    setWallets
  ] = useState([]);

  /* =========================
     FETCH DATA
  ========================= */

  useEffect(() => {

    const fetchData =
      async () => {

        try {

          if (!user?.id_user)
            return;

          const [
            transactionData,
            walletData
          ] = await Promise.all([

            getTransactions(
              user.id_user
            ),

            getWallets(
              user.id_user
            )

          ]);

          setTransactions(
            transactionData
          );

          setWallets(
            walletData
          );

        } catch (error) {

          console.log(error);

        }

      };

    fetchData();

  }, [user?.id_user]);

  /* =========================
     LATEST 5 TRANSACTIONS
  ========================= */

  const latestTransactions =
    transactions.slice(0, 5);

  return (

    <div className="dashboard-page">

      {/* TOP SECTION */}

      <div className="dashboard-top">

        <GreetingHeader
          user={user}
        />

        <DashboardActions
          transactions={transactions}
          setTransactions={
            setTransactions
          }
        />

      </div>

      {/* STATS */}

      <StatsSection

        transactions={
          transactions
        }

        wallets={
          wallets
        }

      />

      {/* ANALYTICS */}

      <AnalyticsSection
        transactions={transactions}
      />

      {/* BOTTOM */}

      <BottomSection
        transactions={
          latestTransactions
        }
      />

    </div>

  );

};

export default DashboardPage;