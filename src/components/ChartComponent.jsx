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
}) => {
  const Chart =
    type === "line" ? Line : type === "doughnut" ? Doughnut : Bar;

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
        <Chart data={data} options={options} />
      </Box>
    </Box>
  );
};

export default ChartComponent;
