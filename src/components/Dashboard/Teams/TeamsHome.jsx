import React, { useEffect, useState } from "react";
import { useAuth } from "@/Auth";
import { useDivision } from "@/components/context/DivisionContext";
import ErrorModal from "@/components/ErrorModal";
import Loading from "@/components/Loading";
import TeamViewModal from "./TeamViewModal";
import teamsService from "@/services/teamsService";
import styles from "./Teams.module.css";

function TeamsHome({ navigate, isAdmin }) {
  const [teams, setTeams] = useState([]);
  const { axiosAPI } = useAuth();
  const { selectedDivision, getCurrentDivisionId, isAllDivisionsSelected } = useDivision();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const [trigger, setTrigger] = useState(false);
  const onTrigger = () => setTrigger(!trigger);

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true);
        const storedSubZoneId = localStorage.getItem('currentSubZoneId');
        if (storedSubZoneId) {
          const data = await teamsService.listTeams(storedSubZoneId);
          const list = data?.data?.teams || data?.teams || data?.data || data || [];
          setTeams(Array.isArray(list) ? list : []);
        } else {
          // Fallback: use legacy division-based endpoint
          const currentDivisionId = localStorage.getItem('currentDivisionId');
          let endpoint = "/teams";
          if (currentDivisionId && currentDivisionId !== '1') {
            endpoint += `?divisionId=${currentDivisionId}`;
          } else if (currentDivisionId === '1') {
            endpoint += `?showAllDivisions=true`;
          }
          const res = await axiosAPI.get(endpoint);
          const list =
            res?.data?.data?.teams ||
            res?.data?.teams ||
            (Array.isArray(res?.data?.data) ? res.data.data : null) ||
            (Array.isArray(res?.data) ? res.data : null) ||
            [];
          setTeams(Array.isArray(list) ? list : []);
        }
        
        // Clear the update flag after successful fetch
        localStorage.removeItem('teamsDataUpdated');
      } catch (err) {
        console.error("Failed to load teams:", err);
        setError("Failed to load teams data.");
        setIsModalOpen(true);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, [trigger, axiosAPI]);

  // Check for data updates when component mounts or becomes visible
  useEffect(() => {
    const checkForUpdates = () => {
      const lastUpdate = localStorage.getItem('teamsDataUpdated');
      if (lastUpdate) {
        // Trigger a refresh if data was updated
        setTrigger(prev => !prev);
      }
    };

    // Check immediately when component mounts
    checkForUpdates();

    // Also check when the page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const [statusFilter, setStatusFilter] = useState('all');

  let index = 1;
  
  // Filter teams based on status
  const filteredTeams = teams.filter(team => {
    if (statusFilter === 'all') return true;
    const status = team?.status || (team?.isActive ? 'Active' : 'Inactive');
    return status === statusFilter;
  });
  
  // Show loading state
  if (loading) {
    return (
      <div className="p-4">
        <Loading />
        <p className="text-center mt-3">Loading teams...</p>
      </div>
    );
  }

  return (
    <>
      <p className="path">
        <span onClick={() => navigate("/employees")}>Employees</span>{" "}
        <i className="bi bi-chevron-right"></i> Teams
      </p>

      {/* Create Team Button */}
      <div className="row m-0 p-3">
        <div className="col">
          {isAdmin && (
            <button
              className="homebtn"
              onClick={() => navigate("/teams/create-team")}
            >
              Create Team
            </button>
          )}
        </div>
      </div>

      {/* Show sample data if no teams loaded */}
      {(!teams || teams.length === 0) && !loading && (
        <div className="alert alert-warning m-3">
          <strong>No Teams Data Available</strong>
          <br />
          This could be due to:
          <ul>
            <li>API connection issues</li>
            <li>Authentication problems</li>
            <li>No teams in the current division</li>
            <li>Backend service not running</li>
          </ul>
          <button 
            className="btn btn-primary me-2" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <button 
            className="btn btn-secondary me-2" 
            onClick={() => navigate("/employees")}
          >
            Back to Employees
          </button>
        </div>
      )}

      <div className="row m-0 p-3 justify-content-center">
        <div className="col-lg-12">
          {/* Filter Controls */}
          <div className="mb-3">
            <label className="form-label me-2">Filter by Status:</label>
            <select 
              className="form-select d-inline-block w-auto" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Teams</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
            <span className="ms-3">
              Showing {filteredTeams.length} of {teams.length} teams
            </span>
          </div>
          
          <table className={`table table-bordered borderedtable`}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Team ID</th>
                <th>Team Name</th>
                <th>Team Lead</th>
                <th>Lead Mobile</th>
                <th>Member Count</th>
                <th>Status</th>
                <th>Division</th>
                <th>Created By</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {(!filteredTeams || filteredTeams.length === 0) && (
                <tr>
                  <td colSpan={10}>
                    {loading ? 'Loading...' : 'NO DATA FOUND'}
                  </td>
                </tr>
              )}
              {filteredTeams && filteredTeams.length > 0 &&
                filteredTeams.map((team) => (
                  <tr
                    key={team.id}
                    className="animated-row"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td>{index++}</td>
                    <td>{team.teamId || team.id || "-"}</td>
                    <td>{team.teamName || team.name || "-"}</td>
                    <td>{team.teamHead?.name || team.teamLead?.name || team.lead?.name || (typeof team.teamLead === 'string' ? team.teamLead : (typeof team.lead === 'string' ? team.lead : '-'))}</td>
                    <td>{team.teamHead?.mobile || team.teamLeadMobile || team.leadMobile || "-"}</td>
                    <td>{Array.isArray(team.teamMembers) ? team.teamMembers.length : (Array.isArray(team.members) ? team.members.length : (team.memberCount || team.members || "-"))}</td>
                    <td>
                      <span className={`badge ${(team.status || (team.isActive ? 'Active' : 'Inactive')) === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                        {team.status || (team.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td>{team.divisionName || team.division?.name || team.subZone?.zone?.division?.name || (typeof team.division === 'string' ? team.division : '-')}</td>
                    <td>{team.createdBy || team.created_by || team.createdByUser || '-'}</td>
                    <td className={styles.delcol}>
                      <button
                        className="btn btn-sm btn-info me-2"
                        onClick={() => navigate(`/teams/${team.id || team.teamId}`)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ErrorModal isOpen={isModalOpen} message={error} onClose={closeModal} />
      )}

      {isViewModalOpen && selectedTeam && (
        <TeamViewModal 
          isOpen={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)}
          team={selectedTeam}
          isAdmin={isAdmin}
        />
      )}
    </>
  );
}

export default TeamsHome;
