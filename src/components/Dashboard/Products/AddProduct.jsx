import React, { useEffect, useRef, useState } from "react";
import styles from "./Products.module.css";
import { RiAddLargeLine } from "react-icons/ri";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RxCross2 } from "react-icons/rx";
import { useAuth } from "@/Auth";

function AddProduct({ navigate }) {
  // const filefrontInputRef = useRef(null);
  // const filebackInputRef = useRef(null);
  // const fileTopInputRef = useRef(null);
  // const fileBottomInputRef = useRef(null);
  // const fileRightInputRef = useRef(null);
  // const fileLeftInputRef = useRef(null);

  // const [frontImage, setFrontImage] = useState(null);
  // const [backImage, setBackImage] = useState(null);
  // const [topImage, setTopImage] = useState(null);
  // const [bottomImage, setBottomImage] = useState(null);
  // const [rightImage, setRightImage] = useState(null);
  // const [leftImage, setLeftImage] = useState(null);

  // // Function to handle button click
  // const handlefrontButtonClick = () => {
  //   filefrontInputRef.current.click();
  // };

  // const handlebackButtonClick = () => {
  //   filebackInputRef.current.click();
  // };

  // const handletopButtonClick = () => {
  //   filebackInputRef.current.click();
  // };
  // const handlebottomButtonClick = () => {
  //   filebackInputRef.current.click();
  // };
  // const handlerightButtonClick = () => {
  //   filebackInputRef.current.click();
  // };
  // const handleleftButtonClick = () => {
  //   filebackInputRef.current.click();
  // };

  // // Function to handle file selection
  // const handleImageChange = (setter) => (event) => {
  //   console.log(frontImage)
  //   const file = event.target.files[0];
  //   if (file) {

  //     const imageURL = URL.createObjectURL(file); // Create a temporary URL
  //     console.log(imageURL)
  //     setter(imageURL);
  //   }
  // };

  const SIDES = ["Front", "Back", "Left", "Right", "Top", "Bottom"];
  const [images, setImages] = useState({ Front: null, Back: null });
  const [newImage, setNewImage] = useState(null);
  const [selectedSide, setSelectedSide] = useState("");
  const fileInputRef = useRef(null);

  const handleButtonClick = (side) => {
    setSelectedSide(side);
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    console.log(e);
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setNewImage(imageURL);
      if (selectedSide === "Front" || selectedSide === "Back") {
        console.log("if called");
        setImages((prev) => ({ ...prev, [selectedSide]: imageURL }));
        setNewImage(null);
        setSelectedSide("");
      }
    }
  };

  const handleSaveImage = () => {
    if (selectedSide && newImage) {
      setImages((prev) => ({ ...prev, [selectedSide]: newImage }));
      setNewImage(null);
      setSelectedSide("");
    }
  };

  const onDeleteClick = (side) => {
    setImages((prevImages) => {
      const updatedImages = { ...prevImages };
      delete updatedImages[side]; // Remove the key properly
      return updatedImages; // Return a new object to trigger re-render
    });
  };

  // listing
  const [categories, setCategories] = useState();
  const [pricingList, setPricingList] = useState();
  const [taxeslist, setTaxeslist] = useState([]);

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
        setLoading(true);
        const res1 = await axiosAPI.get("/categories/list");
        const res2 = await axiosAPI.get("/pricing/lists/fetch");
        const res3 = await axiosAPI.get("/tax");
        console.log(res1);
        console.log(res2);
        console.log(res3);
        setCategories(res1.data.categories);
        setPricingList(res2.data.pricingLists);
        setTaxeslist(res3.data.taxes);
      } catch (e) {
        console.log(e);
        setError(e.response.data.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);


  //  taxes ----------------------------

  const [selections, setSelections] = useState([]);

  

  const getAvailableOptions = (index) => {
    return taxeslist.filter(
      (option) => !selections.includes(option) || selections[index] === option
    );
  };

  const handleChange = (value, index) => {
    const updatedSelections = [...selections];
    updatedSelections[index] = value;

    // Add a new field only if it's the last field and not already at max
    if (
      index === selections.length - 1 &&
      selections.length < taxeslist.length &&
      value !== ""
    ) {
      updatedSelections.push("");
    }

    setSelections(updatedSelections);
  };

  const handleDelete = (index) => {
    const updated = [...selections];
    updated.splice(index, 1);
    setSelections(updated);
  };

  // Pricing----------------------

  const [conditions, setConditions] = useState([{ type: "", value: "" }]);

  const allPricingOptions = ["Exact", "Greater than", "Less than", "Range"];

  const getallAvailableOptions = (index) => {
    const used = conditions.map((c) => c.type).filter(Boolean);
    return allPricingOptions.map((opt) => ({
      value: opt,
      disabled: used.includes(opt) && conditions[index].type !== opt,
    }));
  };

  const handleTypeChange = (value, index) => {
    const updated = [...conditions];
    updated[index].type = value;
    updated[index].value = value === "Range" ? ["", ""] : "";

    // Add new field if it's the last one
    if (
      index === conditions.length - 1 &&
      conditions.length < taxeslist.length
    ) {
      updated.push({ type: "", value: "" });
    }

    setConditions(updated);
  };

  const handleValueChange = (val, index, subIndex = null) => {
    const updated = [...conditions];
    if (Array.isArray(updated[index].value) && subIndex !== null) {
      updated[index].value[subIndex] = val;
    } else {
      updated[index].value = val;
    }
    setConditions(updated);
  };

  const handletoDelete = (index) => {
    const updated = [...conditions];
    updated.splice(index, 1);
    setConditions(updated);
  };
  
  // Backend

  const [productName, setproductName] = useState();
  const [productSKU, setproductSKU] = useState();
  const [category, setCategory] = useState();
  const [salesPrice, setSalesPrice] = useState();
  const [purchasePrice, setPurchasePrice] = useState();
  const [taxes, setTaxes] = useState();
  const [pricing, setPricing] = useState();

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/products")}>Products</span>{" "}
        <i class="bi bi-chevron-right"></i> Add Product
      </p>

      <div className="row m-0 p-3">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Date :</label>
          <input type="date" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Time :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Created By :</label>
          <input type="text" />
        </div>
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Product Details</h5>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Product Name :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Product ID :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Categories :</label>
          <select name="" id="">
            <option value="null">--select--</option>
            {categories &&
              categories.map((category) => (
                <option value={category.id}>{category.name}</option>
              ))}
          </select>
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Units :</label>
          <select name="" id="">
            <option value="">Kgs</option>
            <option value="">grams</option>
            <option value="">Litres</option>
          </select>
        </div>
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Product Images</h5>
        {Object.keys(images).map((side) => (
          <div key={side} className={`col-3 ${styles.upload}`}>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/png, image/gif, image/jpeg"
                onChange={(e) => handleImageChange(e)}
              />
              <button
                className={styles.uploadbutton}
                onClick={() => handleButtonClick(side)}
              >
                {images[side] ? (
                  <img src={images[side]} alt={`${side} Side`} />
                ) : (
                  <p>
                    <RiAddLargeLine />
                  </p>
                )}
              </button>
              {Object.keys(images).length > 2 && side !== "Front" && (
                <button
                  className={styles.deletebtn}
                  onClick={() => onDeleteClick(side)}
                >
                  <i class="bi bi-trash3"></i>
                </button>
              )}
            </div>
            <p className={styles.imglabel}>{side} Side</p>
          </div>
        ))}

        <div className="col-3">
          <DialogRoot placement={"center"} className={styles.mdl}>
            <DialogTrigger asChild>
              <button className="submitbtn">Add Another</button>
            </DialogTrigger>
            <DialogContent className="mdl">
              <DialogBody>
                <h4>Select Image Side</h4>
                <div className="row m-0 p-3 justify-content-center">
                  <div className={`col-3 ${styles.upload}`}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/png, image/gif, image/jpeg"
                      onChange={handleImageChange}
                    />
                    <button
                      className={styles.uploadbutton}
                      onClick={handleButtonClick}
                    >
                      {newImage ? (
                        <img src={newImage} alt={`${selectedSide} Side`} />
                      ) : (
                        <p>
                          <RiAddLargeLine />
                        </p>
                      )}
                    </button>
                    <select
                      value={selectedSide}
                      onChange={(e) => setSelectedSide(e.target.value)}
                      className={styles.selectside}
                    >
                      <option value="">-- Select Side --</option>
                      {SIDES.filter((side) => !images[side]).map((side) => (
                        <option key={side} value={side}>
                          {side}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="row m-0 p-1 justify-content-center">
                  <div className="col-3">
                    <button onClick={handleSaveImage} className="submitbtn">
                      Save
                    </button>
                  </div>
                </div>

                <DialogCloseTrigger className="inputcolumn-mdl-close" />
              </DialogBody>
            </DialogContent>
          </DialogRoot>
        </div>
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>TAXES</h5>

        {selections.map((selected, index) => (
          <div className={`col-3 ${styles.taxform}`}>
            <select
              value={selected}
              onChange={(e) => handleChange(e.target.value, index)}
            >
              <option value="">-- Select Tax --</option>
              {getAvailableOptions(index).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>

            {selections.length > 1 && (
              <button
                onClick={() => handleDelete(index)}
                className=""
                title="Delete this field"
              >
                <RxCross2 />
              </button>
            )}
          </div>
        ))}

        {selections.length === taxeslist.length &&
          !selections.includes("") && <div>✅ All options selected</div>}
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Pricing Details</h5>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Sale Price :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Purchase Price :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Min. stock :</label>
          <input type="text" />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Pricing List :</label>
          <select name="" id="">
            <option value="null">--select--</option>
            {pricingList && pricingList.map((pl) => <option value={pl.id}>{pl.name}</option>)}
            
          </select>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {conditions.map((cond, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* Dropdown */}
            <select
              value={cond.type}
              onChange={(e) => handleTypeChange(e.target.value, index)}
              className="p-2 border rounded w-40"
            >
              <option value="">-- Select --</option>
              {getallAvailableOptions(index).map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.value}
                </option>
              ))}
            </select>

            {/* Input(s) */}
            {cond.type && cond.type !== "Range" && (
              <input
                type="number"
                value={cond.value}
                onChange={(e) => handleValueChange(e.target.value, index)}
                className="p-2 border rounded flex-1"
                placeholder="Enter value"
              />
            )}
            {cond.type === "Range" && (
              <>
                <input
                  type="number"
                  value={cond.value[0]}
                  onChange={(e) => handleValueChange(e.target.value, index, 0)}
                  className="p-2 border rounded w-20"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={cond.value[1]}
                  onChange={(e) => handleValueChange(e.target.value, index, 1)}
                  className="p-2 border rounded w-20"
                  placeholder="Max"
                />
              </>
            )}

            {/* Delete button */}
            {conditions.length > 1 && (
              <button
                onClick={() => handletoDelete(index)}
                className="text-red-600 hover:text-red-800 text-lg"
                title="Delete condition"
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="row m-0 p-3 pt-4 justify-content-center">
        <div className="col-3">
          <button className="submitbtn">Create</button>
          <button className="cancelbtn" onClick={() => navigate("/products")}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

export default AddProduct;
