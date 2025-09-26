import React from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "../../ReusableCard";

export default function StoreProducts() {
  return (
    <div>
      <h4>Products</h4>

      {/* Buttons */}
      <div className="row m-0 p-2">
        <div className="col">
          <button className="homebtn">Manage Products and Prices</button>
        </div>
      </div>

      {/* Mini Dashboards */}
      <Flex wrap="wrap" justify="space-between" px={2}>
        <ReusableCard title="Catalog Size" value={"128"} />
        <ReusableCard title="Price Updates (30d)" value={"12"} color="purple.500" />
      </Flex>
    </div>
  );
}
