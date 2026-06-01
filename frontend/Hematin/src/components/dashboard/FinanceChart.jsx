import { useState } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6"
];

const FinanceChart = ({
  analytics
}) => {

  const [
    chartType,
    setChartType
  ] = useState("category");

  const categoryData =
    analytics?.categories?.map(
      item => ({

        category_name:
          item.category_name,

        total:
          Number(item.total)

      })
    ) || [];

  const monthlyData =
    analytics?.monthly?.map(
      item => ({

        month:
          item.month,

        income:
          Number(item.income),

        expense:
          Number(item.expense)

      })
    ) || [];

  const weeklyData =
  analytics?.weekly?.map(
    item => ({

      day:
        new Date(item.day)
          .toLocaleDateString(
            "id-ID",
            {
              weekday: "short"
            }
          ),

      income:
        Number(item.income),

      expense:
        Number(item.expense)

    })
  ) || [];

  const rupiahFormatter =
    (value) =>

      `Rp ${Number(value)
        .toLocaleString("id-ID")}`;

  return (

    <div className="finance-chart">

      <div className="chart-header">

        <h4>
          Analitik Keuangan
        </h4>

        <select
          value={chartType}
          onChange={(e) =>
            setChartType(
              e.target.value
            )
          }
          className="chart-selector"
        >

          <option value="category">
            Kategori
          </option>

          <option value="monthly">
            Bulanan
          </option>

          <option value="weekly">
            Mingguan
          </option>

        </select>

      </div>

      <ResponsiveContainer
        width="100%"
        height={400}
      >

        {/* PIE CHART */}

        {chartType ===
          "category" ? (

          <PieChart>

            <Pie
              data={categoryData}
              dataKey="total"
              nameKey="category_name"
              outerRadius={100}
              label
            >

              {
                categoryData.map(
                  (_, index) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                          COLORS.length
                        ]
                      }
                    />

                  )
                )
              }

            </Pie>

            <Tooltip
              formatter={
                rupiahFormatter
              }
            />

            <Legend />

          </PieChart>

        ) :

        /* MONTHLY */

        chartType ===
          "monthly" ? (

          <BarChart
            data={monthlyData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="month"
            />

            <YAxis />

            <Tooltip
              formatter={
                rupiahFormatter
              }
            />

            <Legend />

            <Bar
              dataKey="income"
              name="Pemasukan"
              fill="#22c55e"
            />

            <Bar
              dataKey="expense"
              name="Pengeluaran"
              fill="#ef4444"
            />

          </BarChart>

        ) : (

        /* WEEKLY */

          <BarChart
            data={weeklyData}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="day"
            />

            <YAxis />

            <Tooltip
              formatter={
                rupiahFormatter
              }
            />
            <Legend />

            <Bar
              dataKey="income"
              name="Pemasukan"
              fill="#22c55e"
            />

            <Bar
              dataKey="expense"
              name="Pengeluaran"
              fill="#ef4444"
            />

          </BarChart>

        )}

      </ResponsiveContainer>

    </div>

  );

};

export default FinanceChart;