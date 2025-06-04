import React, { lazy, Suspense } from "react";
import styles from "./Settings.module.css";
import NewDroppOffRuleModal from "./NewDroppOffRuleModal";
import { Route, Routes } from "react-router-dom";
import DeleteDropOffRuleModal from "./DeleteDropOffRuleModal";
import PageSkeleton from "@/components/SkeletonLoaders/PageSkeleton";

function DropoffRules({ navigate }) {
  const OngoingDropoff = lazy(() => import("./OngoingDropoff"));
  return (
    <>
      <Routes>
        <Route
          index
          element={
            <>
              <p className="path">
                <span onClick={() => navigate("/settings")}>Settings</span>{" "}
                <i class="bi bi-chevron-right"></i> Drop-off Rules
              </p>
              <NewDroppOffRuleModal />
              <DeleteDropOffRuleModal />
              <button
                className="homebtn"
                onClick={() =>
                  navigate("/settings/drop-off-rules/ongoing")
                }
              >
                Ongoing
              </button>
            </>
          }
        />

        <Route
          path="/ongoing"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <OngoingDropoff navigate={navigate} />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default DropoffRules;
