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
    topPerformingBOs.forEach((tp) => {
      data.push({ name: tp.name, sales: tp.sales });
    });
  // console.log(data);
  return (
    <>
      {topPerformingBOs && topPerformingBOs.length !== 0 && (
        <div className={`col-6 ${styles.bigbox}`}>
          <h4>Top Performing BO's</h4>
          <div className={styles.chartcontainer} style={{overflow: 'hidden', padding: '10px 0'}}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  height={50}
                  interval={0}
                  tick={{ fontSize: 8 }}
                />
                <YAxis width={80} />
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
