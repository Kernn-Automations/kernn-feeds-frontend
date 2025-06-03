import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import styles from "./HomePage.module.css";

function ProductLineChart({ salesAnalysis }) {
  const data = [];

  if (salesAnalysis)
    salesAnalysis.data.map((sale) =>
      data.push({ date: sale.date, sales: sale.sales })
    );

  return (
    <>
      {salesAnalysis && salesAnalysis.data?.length !== 0 && (
        <div className={`col-6 ${styles.bigbox}`}>
          <h4>Sales Analysis</h4>
          <div className={styles.chartcontainer}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--primary-color)"
                  strokeWidth={2}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductLineChart;
