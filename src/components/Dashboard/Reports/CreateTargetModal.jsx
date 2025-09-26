import React, { useMemo, useState } from "react";
import { useAuth } from "@/Auth";
import Loading from "@/components/Loading";
import ErrorModal from "@/components/ErrorModal";
import {
	DialogActionTrigger,
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogRoot,
	DialogTrigger,
} from "@/components/ui/dialog";

function CreateTargetModal({ onCreated }) {
	const { axiosAPI } = useAuth();
	const API_BASE = import.meta.env.VITE_API_URL || "";

	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [isErrorOpen, setIsErrorOpen] = useState(false);
	const [successMsg, setSuccessMsg] = useState(null);

	// Form fields
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [targetType, setTargetType] = useState("sales"); // sales | customer
	const [assignmentType, setAssignmentType] = useState("team"); // team | employee
	const [budgetNumber, setBudgetNumber] = useState("");
	const [budgetUnit, setBudgetUnit] = useState("count"); // tons | bags | count
	const [timeFrame, setTimeFrame] = useState("months");
	const [timeFrameValue, setTimeFrameValue] = useState(1);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [priority, setPriority] = useState("medium"); // low | medium | high | critical
	const [notes, setNotes] = useState("");
	const [isRecurring, setIsRecurring] = useState(false);

	const divisionParam = useMemo(() => {
		const currentDivisionId = localStorage.getItem("currentDivisionId");
		if (!currentDivisionId || currentDivisionId === "all") return undefined;
		const asNumber = Number(currentDivisionId);
		return Number.isFinite(asNumber) ? asNumber : undefined;
	}, []);

	const resetForm = () => {
		setName("");
		setDescription("");
		setTargetType("sales");
		setAssignmentType("team");
		setBudgetNumber("");
		setBudgetUnit("count");
		setTimeFrame("months");
		setTimeFrameValue(1);
		setStartDate("");
		setEndDate("");
		setPriority("medium");
		setNotes("");
		setIsRecurring(false);
	};

	const handleCreate = async () => {
		if (!name || !targetType || !assignmentType || !budgetNumber || !budgetUnit || !timeFrame || !timeFrameValue || !startDate || !endDate) {
			setError("Please fill all required fields");
			setIsErrorOpen(true);
			return;
		}
		try {
			setLoading(true);
			const payload = {
				name,
				description,
				targetType,
				assignmentType,
				budgetNumber: Number(budgetNumber),
				budgetUnit,
				timeFrame,
				timeFrameValue: Number(timeFrameValue),
				startDate,
				endDate,
				isRecurring,
				priority,
				notes,
				...(divisionParam ? { divisionId: divisionParam } : {}),
			};

			let response;
			try {
				const url = `${API_BASE}/targets/targets`;
				console.log("Creating target via", url, payload);
				response = await axiosAPI.post(url, payload);
			} catch (err) {
				const status = err?.response?.status;
				if (status === 404) {
					const url2 = `${API_BASE}/targets`;
					console.warn("/targets/targets returned 404. Retrying with", url2);
					response = await axiosAPI.post(url2, payload);
				} else {
					throw err;
				}
			}

			setSuccessMsg(response?.data?.message || "Target created successfully");
			if (onCreated) onCreated();
			resetForm();
			setTimeout(() => {
				setSuccessMsg(null);
				setIsOpen(false);
			}, 800);
		} catch (e) {
			console.error(e);
			setError(e?.response?.data?.message || "Failed to create target");
			setIsErrorOpen(true);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenChange = (next) => {
		if (typeof next === "boolean") {
			setIsOpen(next);
		} else if (next && typeof next === "object" && "open" in next) {
			setIsOpen(!!next.open);
		} else {
			setIsOpen((prev) => !prev);
		}
	};

	return (
		<DialogRoot
			open={isOpen}
			onOpenChange={handleOpenChange}
			placement={"center"}
			size={"lg"}
			modal={true}
			closeOnInteractOutside={true}
			closeOnEsc={true}
		>
			<DialogTrigger asChild>
				<button className="homebtn">+ Create Target</button>
			</DialogTrigger>
			<DialogContent className="mdl">
				<DialogBody>
					<h3 className={`px-3 pb-3 mdl-title`}>Create Target</h3>

					<div className="row">
						<div className={`col-6 inputcolumn-mdl`}>
							<label>Name :</label>
							<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter target name" />
						</div>
						<div className={`col-6 inputcolumn-mdl`}>
							<label>Target Type :</label>
							<select value={targetType} onChange={(e) => setTargetType(e.target.value)}>
								<option value="sales">Sales</option>
								<option value="customer">Customer</option>
							</select>
						</div>
					</div>

					<div className="row">
						<div className={`col-6 inputcolumn-mdl`}>
							<label>Assignment Type :</label>
							<select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)}>
								<option value="team">Team</option>
								<option value="employee">Employee</option>
							</select>
						</div>
						<div className={`col-6 inputcolumn-mdl`}>
							<label>Budget Number :</label>
							<input type="number" value={budgetNumber} onChange={(e) => setBudgetNumber(e.target.value)} placeholder="e.g. 100000" />
						</div>
					</div>

					<div className="row">
						<div className={`col-6 inputcolumn-mdl`}>
							<label>Budget Unit :</label>
							<select value={budgetUnit} onChange={(e) => setBudgetUnit(e.target.value)}>
								<option value="count">Count</option>
								<option value="bags">Bags</option>
								<option value="tons">Tons</option>
							</select>
						</div>
						<div className={`col-3 inputcolumn-mdl`}>
							<label>Time Frame :</label>
							<select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
								<option value="months">Months</option>
							</select>
						</div>
						<div className={`col-3 inputcolumn-mdl`}>
							<label>Value :</label>
							<input type="number" value={timeFrameValue} onChange={(e) => setTimeFrameValue(e.target.value)} />
						</div>
					</div>

					<div className="row">
						<div className={`col-6 inputcolumn-mdl`}>
							<label>Start Date :</label>
							<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
						</div>
						<div className={`col-6 inputcolumn-mdl`}>
							<label>End Date :</label>
							<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
						</div>
					</div>

					<div className="row">
						<div className={`col-6 inputcolumn-mdl`}>
							<label>Priority :</label>
							<select value={priority} onChange={(e) => setPriority(e.target.value)}>
								<option value="low">Low</option>
								<option value="medium">Medium</option>
								<option value="high">High</option>
								<option value="critical">Critical</option>
							</select>
						</div>
						<div className={`col-6 inputcolumn-mdl`}>
							<label>Recurring :</label>
							<input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
						</div>
					</div>

					<div className="row">
						<div className={`col-12 inputcolumn-mdl`}>
							<label>Description :</label>
							<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the target"></textarea>
						</div>
						<div className={`col-12 inputcolumn-mdl`}>
							<label>Notes :</label>
							<textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes"></textarea>
						</div>
					</div>

					{!loading && !successMsg && (
						<div className="row pt-3 mt-3 justify-content-center">
							<div className={`col-6`}>
								<button type="button" className={`submitbtn`} onClick={handleCreate}>Create</button>
								<DialogActionTrigger asChild>
									<button type="button" className={`cancelbtn`}>Close</button>
								</DialogActionTrigger>
							</div>
						</div>
					)}

					{loading && (
						<div className="row pt-3 mt-3 justify-content-center">
							<div className={`col-6`}>
								<Loading />
							</div>
						</div>
					)}

					{successMsg && (
						<div className="row pt-3 mt-3 justify-content-center">
							<div className={`col-6`}>
								<DialogActionTrigger asChild>
									<button type="button" className={`submitbtn`}>{successMsg}</button>
								</DialogActionTrigger>
							</div>
						</div>
					)}

					{isErrorOpen && (
						<ErrorModal isOpen={isErrorOpen} message={error} onClose={() => setIsErrorOpen(false)} />
					)}
				</DialogBody>
				<DialogCloseTrigger className="inputcolumn-mdl-close" />
			</DialogContent>
		</DialogRoot>
	);
}

export default CreateTargetModal;
