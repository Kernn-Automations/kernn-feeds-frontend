import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import styles from "./HomePage.module.css"

function ProductBarchart() {
  const data = [
    { name: "SE 1", sales: 4000 },
    { name: "SE 2", sales: 3000 },
    { name: "SE 3", sales: 5000 },
    { name: "SE 4", sales: 7000 },
    { name: "SE 5", sales: 6000 },
  ];
  return (
    <>
      <div className={`col-6 ${styles.bigbox}`}>
        <h4>Top Performing BO's</h4>
        <div className={styles.chartcontainer}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="var(--primary-color)" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

export default ProductBarchart;
