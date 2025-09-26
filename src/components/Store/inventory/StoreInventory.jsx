import React from "react";
import { Flex } from "@chakra-ui/react";
import ReusableCard from "../../ReusableCard";

export default function StoreInventory() {
  return (
    <div>
      <h4>Inventory</h4>

      {/* Buttons (Sales-style) */}
      <div className="row m-0 p-2">
        <div className="col">
          <button className="homebtn">Current Stock</button>
          <button className="homebtn">Stock Summary</button>
          <button className="homebtn">Damaged Stock</button>
        </div>
      </div>

      {/* Mini Dashboards (Sales-style ReusableCard) */}
      <Flex wrap="wrap" justify="space-between" px={2}>
        <ReusableCard title="Low Stock Items" value={"7"} color="red.500" />
        <ReusableCard title="Incoming Transfers" value={"3"} color="blue.500" />
        <ReusableCard title="Damaged This Week" value={"7"} color="yellow.500" />
      </Flex>
    </div>
  );
}


