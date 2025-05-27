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
import TaxSelector from "./TaxSelector";
import ImageUploadPopup from "./ImageUpload";
import ImageUpload from "./ImageUpload";
import PricingSlabs from "./PricingSlabs";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import axios from "axios";

function AddProduct({ navigate }) {
  // listing
  const [categories, setCategories] = useState();
  const [pricingList, setPricingList] = useState();
  const [taxeslist, setTaxeslist] = useState([]);

  const { axiosAPI } = useAuth();

  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successful, setSuccessful] = useState();
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
        // console.log(res1);
        // console.log(res2);
        // console.log(res3);
        setCategories(res1.data.categories);
        setPricingList(res2.data.pricingLists);
        setTaxeslist(res3.data.taxes);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  // selectedTaxes
  const [selectedTaxes, setSelectedTaxes] = useState([]);

  // selected Images
  const [images, setImages] = useState([null]);

  // backend

  const [name, setName] = useState();
  const [sku, setSku] = useState();
  const [category, setCategory] = useState();
  const [units, setUnits] = useState();
  const [description, setDescription] = useState();
  const [baseprice, setBaseprice] = useState();
  const [purchaseprice, setPurchaseprice] = useState();
  const [thresholdValue, setThresholdValue] = useState();
  const [pricing, setPricing] = useState();
  const [pricingSlabs, setPricingSlabs] = useState([
    {
      quantityCondition: "Exact",
      quantityValueStart: "",
      quantityValueEnd: "",
      price: "",
    },
  ]);

  // Completion
  const today = new Date(Date.now()).toISOString().slice(0, 10);
  const time = new Date(Date.now()).toISOString().slice(11, 16);
  const user = JSON.parse(localStorage.getItem("user"));

  // Validation
  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    if (!name) newErrors.name = true;
    if (!sku) newErrors.sku = true;
    if (!category) newErrors.category = true;
    if (!units) newErrors.units = true;
    if (!description) newErrors.description = true;
    if (!baseprice) newErrors.baseprice = true;
    if (!purchaseprice) newErrors.purchaseprice = true;
    if (!thresholdValue) newErrors.thresholdValue = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function onError(e, vari, setter) {
    const value = e.target.value === "null" ? null : e.target.value;
    setter(value);
    if (value) {
      setErrors((prev) => ({ ...prev, vari: false }));
    }
  }

  // form subbmission
  const onSubmitClick = () => {
    // console.log(name, location);
    // console.log(
    //   name,
    //   sku,
    //   category,
    //   units,
    //   description,
    //   baseprice,
    //   purchaseprice,
    //   thresholdValue,
    //   pincode,
    //   managerId
    // );
    // console.log(location);

    async function create() {
      try {
        setLoading(true);
        const res = await axiosAPI.post("/warehouse/add", {
          name: name,
          sku,
          category,
          units,
          description,
          baseprice,
          purchaseprice,
          thresholdValue,
          pincode,
          latitude: location.lat,
          longitude: location.lng,
          managerId,
        });

        // console.log(res);

        setError(res.data.message);
      } catch (e) {
        // console.log(e);
        setError(e.response.data.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }

    create();
  };

  // onSubmit

  const VITE_API = import.meta.env.VITE_API_URL;

  const onCreateProduct = () => {
    // console.log(selectedTaxes);
    // console.log(images);
    // console.log(
    //   sku,
    //   name,
    //   description,
    //   category,
    //   units,
    //   baseprice,
    //   purchaseprice,
    //   thresholdValue,
    //   pricing
    // );
    // console.log(pricingSlabs);

    if (!validateFields()) {
      setError("Please Fill all feilds");
      setIsModalOpen(true);
      return;
    }

    // const imagesArray = [];
    // images.map((img) => img && imagesArray.push(img.file));

    // console.log(imagesArray);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("SKU", sku);
    formData.append("description", description);
    formData.append("categoryId", category);
    formData.append("unit", units);
    formData.append("basePrice", baseprice);
    formData.append("purchasePrice", purchaseprice);
    formData.append("pricingListId", pricing);
    // formData.append("images", imagesArray);
    formData.append("thresholdValue", thresholdValue);
    formData.append("pricingSlabs", JSON.stringify(pricingSlabs));

    images.forEach((image) => {
      if (image) formData.append("images", image.file);
    });

    selectedTaxes.forEach((taxId) => {
      formData.append("taxIds", taxId); // use `taxIds[]` to indicate array
    });

    // console.log(formData);

    async function submit() {
      try {
        setLoading(true);
        const res = await axios.post(`${VITE_API}/products/add`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        // console.log(res);
        setSuccessful(res.data.message);
      } catch (e) {
        // console.log(e);
        setError(e.response?.data?.message);
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }

    submit();
  };

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/products")}>Products</span>{" "}
        <i class="bi bi-chevron-right"></i> Add Product
      </p>

      <div className="row m-0 p-3">
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Date :</label>
          <input type="date" value={today} />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Time :</label>
          <input type="time" value={time} />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Created By :</label>
          <input type="text" value={user.name} />
        </div>
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Product Details</h5>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Product Name :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onError(e, name, setName)}
            required
            className={errors.name ? styles.errorField : ""}
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Product SKU :</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => onError(e, sku, setSku)}
            required
            className={errors.sku ? styles.errorField : ""}
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Categories :</label>
          <select
            name=""
            id=""
            value={category}
            onChange={(e) => onError(e, category, setCategory)}
            required
            className={errors.category ? styles.errorField : ""}
          >
            <option value="null">--select--</option>
            {categories &&
              categories.map((category) => (
                <option value={category.id}>{category.name}</option>
              ))}
          </select>
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Units :</label>
          <select
            name=""
            id=""
            value={units}
            onChange={(e) => onError(e, units, setUnits)}
            required
            className={errors.units ? styles.errorField : ""}
          >
            <option value="null">--select--</option>
            <option value="kg">Kgs</option>
            <option value="gm">grams</option>
            <option value="ltr">Litres</option>
          </select>
        </div>
        <div className={`col-3 ${styles.taxform}`}>
          <textarea
            name=""
            id=""
            placeholder="Description"
            value={description}
            onChange={(e) => onError(e, description, setDescription)}
            required
            className={errors.description ? styles.errorField : ""}
          ></textarea>
        </div>
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Product Images</h5>
        <ImageUpload images={images} setImages={setImages} />
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>TAXES</h5>
        <div className={`col-3 ${styles.longform}`}>
          <TaxSelector
            selectedTaxes={selectedTaxes}
            setSelectedTaxes={setSelectedTaxes}
          />
        </div>
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Pricing Details</h5>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Sale Price :</label>
          <input
            type="text"
            value={baseprice}
            onChange={(e) => onError(e, baseprice, setBaseprice)}
            required
            className={errors.baseprice ? styles.errorField : ""}
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Purchase Price :</label>
          <input
            type="text"
            value={purchaseprice}
            onChange={(e) => onError(e, purchaseprice, setPurchaseprice)}
            required
            className={errors.purchaseprice ? styles.errorField : ""}
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Min. stock :</label>
          <input
            type="text"
            value={thresholdValue}
            onChange={(e) => onError(e, thresholdValue, setThresholdValue)}
            required
            className={errors.thresholdValue ? styles.errorField : ""}
          />
        </div>
        <div className={`col-3 ${styles.longform}`}>
          <label htmlFor="">Pricing List :</label>
          <select
            name=""
            id=""
            value={pricing}
            onChange={(e) => onError(e, pricing, setPricing)}
            required
            className={errors.pricing ? styles.errorField : ""}
          >
            <option value="null">--select--</option>
            {pricingList &&
              pricingList.map((pl) => <option value={pl.id}>{pl.name}</option>)}
          </select>
        </div>
      </div>

      <div className="row m-0 p-3">
        <h5 className={styles.head}>Pricing Slabs</h5>
        <PricingSlabs
          pricingSlabs={pricingSlabs}
          setPricingSlabs={setPricingSlabs}
        />
      </div>

      <div className="row m-0 justify-content-center p-3">
        {!loading && !successful && (
          <div className="col-4">
            <button className="submitbtn" onClick={onCreateProduct}>
              Create
            </button>
            <button className="cancelbtn" onClick={() => navigate("/products")}>
              Cancel
            </button>
          </div>
        )}
        {successful && (
          <div className="col-6">
            <button className="submitbtn" onClick={() => navigate("/products")}>
              {successful}
            </button>
          </div>
        )}
      </div>
      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {loading && <Loading />}
    </>
  );
}

export default AddProduct;
