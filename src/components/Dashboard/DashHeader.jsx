// import { Input } from "@chakra-ui/react"
// import { InputRightElement } from "@chakra-ui/react";
// import { InputGroup } from "@/components/ui/input-group"
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import Notification from "./Notification";
import ProfileAvthar from "./ProfileAvthar";
import { IoSearch } from "react-icons/io5";
import { FaSearch, FaTimes } from "react-icons/fa";
import Logo from "./navs/Logo";
import SearchBar from "./SearchBar";
import DivisionSwitcher from "./DivisionSwitcher";
import { dashboardOptions } from "../../utils/searchOptions";

function DashHeader({
  notifications,
  user,
  setAdmin,
  setTab,
  admin,
  orgadmin,
}) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Mobile header layout: Logo + Brand centered, Search + Profile on right
  if (isMobile) {
    return (
      <>
        <div className={styles.header}>
          <div className={`row ${styles.mobileHeaderRow}`} style={{ width: '100%', margin: 0 }}>
            {/* Left spacer for hamburger menu */}
            <div className={styles.mobileHeaderSpacer}></div>
            
            {/* Centered logo + brand - Hide when search is open */}
            {!showMobileSearch && (
              <div className={styles.mobileHeaderCenter} style={{ justifyContent: 'flex-start' }}>
                <Logo />
                <p className={styles.brand}>Feed Bazaar Pvt Ltd</p>
              </div>
            )}
            
            {/* Right: Search only (Profile moved to navbar on mobile) */}
            <div className={`col-auto ${styles.headcontent}`} style={showMobileSearch ? { width: '100%', maxWidth: '100%', flex: '1 1 auto', paddingLeft: '5px', paddingRight: '2px', overflow: 'visible' } : {}}>
              <div className={styles.headerRight} style={{ width: '100%', justifyContent: showMobileSearch ? 'flex-start' : 'flex-end' }}>
                
                {/* Search Toggle Logic */}
                {showMobileSearch ? (
                  /* Removing styles.searchContainer when expanded to bypass max-width !important constraint in CSS */
                  <div style={{ width: '100%', maxWidth: '100%', flex: 1, display: 'flex', alignItems: 'center', gap: '0' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <SearchBar options={dashboardOptions} isExpanded={true} />
                    </div>
                    <button 
                      onClick={() => setShowMobileSearch(false)}
                      style={{ background: 'none', border: 'none', color: '#666', fontSize: '18px', padding: '0 5px', flexShrink: 0 }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowMobileSearch(true)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        width: '40px', 
                        height: '40px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#666',
                        // Removed fixed positioning to allow flexbox gap to handle spacing
                      }}
                    >
                      <FaSearch size={22} />
                    </button>

                      {/* Division Switcher on Mobile */}
                    <div 
                      className={styles.divisionContainer}
                      onClick={() => navigate('/divs')}
                      style={{ cursor: 'pointer' }}
                    >
                      <DivisionSwitcher />
                    </div>

                    {/* Profile on Mobile */}
                    <div className={styles.profileContainer}>
                      <ProfileAvthar user={user} setTab={setTab} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <div className="row justify-content-between align-items-center" style={{ width: '100%', margin: 0 }}>
          <div className={`col-auto ${styles.headcontentTitle}`}>
            <p className={styles.brand}>Feed Bazaar Pvt Ltd</p>
            {orgadmin && (
              <p className={styles.reset}>
                <span
                  onClick={() => {
                    setAdmin();
                    navigate("/admin");
                  }}
                >
                  <i className="bi bi-arrow-repeat"></i>
                </span>
              </p>
            )}
          </div>
          <div className={`col-auto ${styles.headcontent}`}>
            <div className={styles.headerRight}>
              <div className={styles.searchContainer}>
                <SearchBar options={dashboardOptions} />
              </div>
              
              <div 
                className={styles.divisionContainer}
                onClick={() => navigate('/divs')}
                style={{ cursor: 'pointer' }}
              >
                <DivisionSwitcher />
              </div>
              
              <div className={styles.profileContainer}>
                <ProfileAvthar user={user} setTab={setTab} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashHeader;
