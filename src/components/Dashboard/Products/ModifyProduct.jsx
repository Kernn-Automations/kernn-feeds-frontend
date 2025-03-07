import React, { useState } from "react";
import styles from "./Products.module.css";
import ModifyProductForm from "./ModifyProductForm";

function ModifyProduct({ navigate }) {
    const [viewclick, setViewclick] = useState();

    const onViewClick = () => viewclick ? setViewclick(false) : setViewclick(true)
  return (
    <>
      <p className="path">
        <span onClick={() => navigate(-1)}>Products</span>{" "}
        <i class="bi bi-chevron-right"></i> Modify Products
      </p>



      {!viewclick && <div className="row m-0 p-3 pt-5 justify-content-center">
        <div className="col-9">
            <table className='table table-bordered borderedtable'>
                <thead>
                    <tr>
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Created By</th>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>2025-03-07</td>
                        <td>Karthik</td>
                        <td>#23432</td>
                        <td>Product 1</td>
                        <td><button onClick={onViewClick}>view</button></td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>2025-03-06</td>
                        <td>Karthik</td>
                        <td>#23444</td>
                        <td>Product 2</td>
                        <td><button onClick={onViewClick}>view</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>}

      {viewclick && <ModifyProductForm onViewClick={onViewClick}/>}
    </>
  );
}

export default ModifyProduct;
