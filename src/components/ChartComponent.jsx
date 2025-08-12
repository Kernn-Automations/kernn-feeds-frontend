import {
  Line,
  Bar,
  Doughnut,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Box, Heading } from "@chakra-ui/react";

// ✅ register once
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartComponent = ({
  type = "line",
  title,
  data,
  options,
  height = "250px",
  legendPosition = "right", // New prop for legend position
}) => {
  const Chart =
    type === "line" ? Line : type === "doughnut" ? Doughnut : Bar;

  // Validate data structure to prevent Chart.js errors
  const isValidData = data && 
    typeof data === 'object' && 
    Array.isArray(data.datasets) && 
    data.datasets.length > 0 &&
    Array.isArray(data.labels);

  // Default fallback data if the provided data is invalid
  const safeData = isValidData ? data : {
    labels: ["No Data"],
    datasets: [{
      label: "No Data",
      data: [0],
      backgroundColor: "#e2e8f0",
      borderColor: "#cbd5e0",
    }]
  };

  // Custom options for pie/doughnut charts with left legend
  const customOptions = {
    ...options,
    plugins: {
      ...options?.plugins,
      legend: {
        ...options?.plugins?.legend,
        position: legendPosition,
        align: legendPosition === "left" ? "start" : "center",
        labels: {
          ...options?.plugins?.legend?.labels,
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
    },
    layout: {
      padding: legendPosition === "left" ? { left: 20, right: 20 } : { left: 20, right: 20 },
    },
  };

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="md"
      boxShadow="md"
      m={2}
      flex={type === "line" ? 2 : 1}
      textAlign="center"
    >
      <Heading as="h4" size="sm" color="gray.600" mb={2}>
        {title}
      </Heading>
      <Box height={height}>
        <Chart data={safeData} options={customOptions} />
      </Box>
    </Box>
  );
};

export default ChartComponent;
