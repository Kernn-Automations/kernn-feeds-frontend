import React from 'react'

function PricingList({navigate}) {
  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/products")}>Products</span>{" "}
        <i class="bi bi-chevron-right"></i> Pricing List
      </p>
    </>
  )
}

export default PricingList
