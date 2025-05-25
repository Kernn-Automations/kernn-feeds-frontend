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
import styles from "./HomePage.module.css";

function ProductBarchart({ topPerformingBOs }) {
  const data = [];
  if (topPerformingBOs)
    topPerformingBOs.map((tp) =>
      data.push({ name: tp.boName, sales: tp.sales })
    );
  // console.log(data);
  return (
    <>
      {topPerformingBOs && (
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
      )}
    </>
  );
}

export default ProductBarchart;
