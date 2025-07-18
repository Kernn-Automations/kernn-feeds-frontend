import { Box, Heading, Text } from "@chakra-ui/react";

const ReusableCard = ({ title, value, subtitle, color = "blue.600", icon }) => {
  return (
    <Box
      bg="white"
      p={4}
      borderRadius="md"
      boxShadow="md"
      textAlign="center"
      borderTop="4px solid"
      borderTopColor={color}
      flex="1"
      minW="200px"
      m={2}
    >
      <Heading as="h4" size="sm" color="gray.600">
        {title}
      </Heading>
      <Heading as="h2" size="lg" color={color} mt={2}>
        {value}
      </Heading>
      {subtitle && (
        <Text fontSize="sm" color="gray.500">
          {subtitle}
        </Text>
      )}
      {icon && <Box mt={2}>{icon}</Box>}
    </Box>
  );
};

export default ReusableCard;
