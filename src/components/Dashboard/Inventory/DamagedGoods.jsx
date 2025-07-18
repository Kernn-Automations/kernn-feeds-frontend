import React, { useEffect, useState } from "react";
import styles from "./Inventory.module.css";
import { useAuth } from "@/Auth";
import shadows from "@mui/material/styles/shadows";

function DamagedGoods({ navigate }) {
  const [warehouses, setWarehouses] = useState();
  const [products, setProducts] = useState();
  const [orders, setOrders] = useState();

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
  };



  useEffect(() => {
    async function fetch() {
      try {
        const res1 = await axiosAPI.get("/warehouse");
        const res2 = await axiosAPI.get("/purchases?limit=50");
        const res3 = await axiosAPI.get("/products/list");
        console.log(res1);
        console.log(res2);
        console.log(res3);
        setWarehouses(res1.data.warehouses);
        setOrders(res2.data.purchaseOrders);
        setProducts(res3.data.products);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      }
    }
    fetch();
  }, []);

  const [warehouse, setWarehouse] = useState();
  const [product, setProduct] = useState();
  const [order, setOrder] = useState();
  const [trigger, setTrigger] = useState();

  const [goods, setGoods] = useState();

  useEffect(() => {
      async function fetch() {
        try {
          
          setLoading(true);
  
          const query = `/damaged-goods`
        //   `/warehouse/inventory/incoming?fromDate=${from}&toDate=${to}${
        //     warehouse ? `&warehouseId=${warehouse}` : ""
        //   }${customer ? `&customerId=${customer}` : ""}${
        //     product ? `&productId=${product}` : ""
        //   }&page=${pageNo}&limit=${limit}`;
  
          console.log(query);
  
          const res = await axiosAPI.get(query);
          console.log(res);
          setGoods(res.data);
        //   setTotalPages(res.data.totalPages)
        } catch (e) {
          console.log(e);
          setError(e.response?.data?.message);
          setIsModalOpen(true);
        } finally {
          setLoading(false);
        }
      }
      fetch();
    }, [trigger]);

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/inventory")}>Inventory</span>{" "}
        <i class="bi bi-chevron-right"></i> Damaged Goods
      </p>

      <div className="row m-0 p-3">
        
        <div className={`col-3 formcontent`}>
          <label htmlFor="">WareHouse :</label>
          <select
            name=""
            id=""
            value={warehouse}
            onChange={(e) =>
              setWarehouse(e.target.value === "null" ? null : e.target.value)
            }
          >
            <option value="null">--select--</option>
            {warehouses &&
              warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
          </select>
        </div>
        <div className={`col-3 formcontent`}>
          <label htmlFor="">Product :</label>
          <select
            name=""
            id=""
            value={product}
            onChange={(e) =>
              setProduct(e.target.value === "null" ? null : e.target.value)
            }
          >
            <option value="null">--select--</option>
            {products &&
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
          </select>
        </div>

        <div className={`col-3 formcontent`}>
          <label htmlFor="">Order :</label>
          <select
            name=""
            id=""
            value={order}
            onChange={(e) =>
              setOrder(e.target.value === "null" ? null : e.target.value)
            }
          >
            <option value="null">--select--</option>
            {orders &&
              orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.ordernumer}
                </option>
              ))}
          </select>
        </div>
      </div>
    </>
  );
}

export default DamagedGoods;
