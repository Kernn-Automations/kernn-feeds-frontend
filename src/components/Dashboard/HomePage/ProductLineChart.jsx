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
import styles from "./HomePage.module.css"


function ProductLineChart() {

  const data = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 5000 },
    { name: "Apr", sales: 7000 },
    { name: "May", sales: 6000 },
  ];

  return (
    <>
      <div className={`col-6 ${styles.bigbox}`}>
        <h4>Sales Analysis</h4>
        <div className={styles.chartcontainer}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#a92426"
                strokeWidth={2}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}

export default ProductLineChart;
