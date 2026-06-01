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
  getBudgets
} from "../../services/budgetService";

import {
  getDashboard,
  getDashboardAnalytics
} from "../../services/dashboardService";

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
    dashboard,
    setDashboard
  ] = useState(null);

  const [
    analytics,
    setAnalytics
  ] = useState({

    categories: [],
    monthly: [],
    weekly: []

  });

  const [budgets, setBudgets] =
    useState([]);

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

            transactionResult,
            dashboardResult,
            analyticsResult,
            budgetResult

          ] = await Promise.allSettled([

            getTransactions(
              user.id_user
            ),

            getDashboard(
              user.id_user
            ),

            getDashboardAnalytics(
              user.id_user
            ),

            getBudgets(
              user.id_user
            )

          ]);

          const transactionData =
            transactionResult.status === "fulfilled"
              ? transactionResult.value
              : [];

          const dashboardData =
            dashboardResult.status === "fulfilled"
              ? dashboardResult.value
              : null;

          const analyticsData =
            analyticsResult.status === "fulfilled"
              ? analyticsResult.value
              : {

                categories: [],
                monthly: [],
                weekly: []

              };

          if (
            analyticsResult.status === "rejected"
          ) {

            console.log(
              analyticsResult.reason
            );

          }

          setTransactions(
            transactionData
          );

          setDashboard(
            dashboardData
          );

          setAnalytics(
            analyticsData
          );

          const budgetData =
            budgetResult.status === "fulfilled"
              ? budgetResult.value
              : [];

          setBudgets(
            budgetData
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

  const refreshDashboard =
  async () => {

    if (!user?.id_user)
      return;

    const [

      transactionData,
      dashboardData,
      analyticsData,
      budgetData

    ] = await Promise.all([

      getTransactions(
        user.id_user
      ),

      getDashboard(
        user.id_user
      ),

      getDashboardAnalytics(
        user.id_user
      ),

      getBudgets(
        user.id_user
      )

    ]);

    setTransactions(
      transactionData
    );

    setDashboard(
      dashboardData
    );

    setAnalytics(
      analyticsData
    );

    setBudgets(
      budgetData
    );

};
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
          refreshDashboard={
            refreshDashboard
          }
        />

      </div>

      {/* STATS */}

      <StatsSection
        dashboard={dashboard}
      />

      {/* ANALYTICS */}

      <AnalyticsSection
        analytics={analytics}
        budgets={budgets}
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
