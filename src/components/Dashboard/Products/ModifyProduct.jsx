import React, { useEffect, useState } from "react";
import styles from "./Products.module.css";
import ModifyProductForm from "./ModifyProductForm";
import SelectMode from "./SelectMode";
import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";

function ModifyProduct({ navigate }) {
  const [viewclick, setViewclick] = useState();

  const [product, setProduct] = useState();
  
  const onViewClick = (product) =>{
    viewclick ? setViewclick(false) : setViewclick(true);
    if(product)
      setProduct(product);
    else
    setProduct(null);
  }
    

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [products, setProducts] = useState();
  

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const res = await axiosAPI.get("/products/list");

        console.log(res);

        setProducts(res.data.products);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  let index = 1;
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/products")}>Products</span>{" "}
        <i class="bi bi-chevron-right"></i> Ongoing Products
      </p>

      {products && !viewclick && (
        <div className="row m-0 p-3 pt-5 justify-content-center">
          <div className="col-lg-9">
            <table className="table table-bordered borderedtable">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Product SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Units</th>
                  <th>Purchase Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td>NO DATA FOUND</td>
                  </tr>
                )}
                {products.length > 0 &&
                  products.map((product) => (
                    <tr
                    key={product.id}
                      className="animated-row"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{index++}</td>
                      <td>{product.createdAt.slice(0, 10)}</td>
                      <td>{product.SKU}</td>
                      <td>{product.name}</td>
                      <td>{product.category.name}</td>
                      <td>
                        {product.productType === "packed"
                          ? product.packageWeightUnit
                          : product.unit}
                      </td>
                      <td>{product.purchasePrice}</td>
                      <td>
                        <button onClick={() => onViewClick(product)}>view</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewclick && <ModifyProductForm onViewClick={onViewClick} productId={product.id} />}

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </>
  );
}

export default ModifyProduct;
