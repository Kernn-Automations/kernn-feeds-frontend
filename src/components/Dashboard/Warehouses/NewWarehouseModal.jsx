import React, { useEffect, useState } from "react";
import styles from "./Warehouse.module.css";
import { DialogActionTrigger } from "@/components/ui/dialog";
import MapViewModal from "./MapViewModal";
import { useAuth } from "@/Auth";



function NewWarehouseModal() {
  const [name, setName] = useState();
  const [location, setLocation] = useState();

  const { axiosAPI } = useAuth();

  const onSubmitClick = () => {
    console.log(name, location);

    async function create() {
      try{
        const res = await axiosAPI.post("/warehouse",{
          name : name,
          location : location,
          managerId : 10
        });
        console.log(res);
      }
      catch(e){
        console.log(e);
      }
      finally{

      }
    }

    create();
  }
 
  
  return (
    <>
      <h3 className={`px-3 pb-3 mdl-title`}>Add Warehouse</h3>
      
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">Warehouse ID :</label>
            <input type="text" />
          </div>
        </div>{" "}
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">Warehouse Name :</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
          </div>
        </div>{" "}
       
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">State :</label>
            <select name="" id="">
              <option value="">--select--</option>
              <option value="">State 1</option>
              <option value="">State 2</option>
              <option value="">State 3</option>
            </select>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">District :</label>
            <select name="" id="">
              <option value="">--select--</option>
              <option value="">District 1</option>
              <option value="">District 2</option>
              <option value="">District 3</option>
            </select>
          </div>
          <div className={`col-4  inputcolumn-mdl`}></div>
        </div>
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">Village/city/Town :</label>
            <input
              type="text"
              name=""
              id=""
            
              required
            />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">PinCode :</label>
            <input type="text" />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className={`col-4  inputcolumn-mdl`}>
            <label htmlFor="">Locate on Map :</label>
           <MapViewModal setLocation={setLocation}/>
          </div>
        </div>
        <div className="row pt-3 mt-3 justify-content-center">
          <div className={`col-5`}>
            <button
              type="submit"
              className={`submitbtn`}
              data-bs-dismiss="modal"
              onClick={onSubmitClick}
            >
              Submit
            </button>
            <DialogActionTrigger asChild>
              <button
                type="button"
                className={`cancelbtn`}
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </DialogActionTrigger>
          </div>
        </div>
    
    </>
  );
}

export default NewWarehouseModal;
