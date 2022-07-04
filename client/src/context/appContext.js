import React, { useReducer, useContext, useEffect } from "react";

import reducer from "./reducer";
import axios from "axios";
import {
	DISPLAY_ALERT,
	CLEAR_ALERT,
	SETUP_USER_BEGIN,
	SETUP_USER_SUCCESS,
	SETUP_USER_ERROR,
	TOGGLE_SIDEBAR,
	LOGOUT_USER,
	UPDATE_USER_BEGIN,
	UPDATE_USER_SUCCESS,
	UPDATE_USER_ERROR,
	HANDLE_CHANGE,
	CLEAR_VALUES,
	CREATE_JOB_BEGIN,
	CREATE_JOB_SUCCESS,
	CREATE_JOB_ERROR,
	GET_JOBS_BEGIN,
	GET_JOBS_SUCCESS,
	SET_EDIT_JOB,
	DELETE_JOB_BEGIN,
	EDIT_JOB_BEGIN,
	EDIT_JOB_SUCCESS,
	EDIT_JOB_ERROR,
	SHOW_STATS_BEGIN,
	SHOW_STATS_SUCCESS,
	CLEAR_FILTERS,
	CHANGE_PAGE,
} from "./actions";

const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

const initialState = {
	isLoading: false,
	showAlert: false,
	alertText: "",
	alertType: "",
	user: user ? JSON.parse(user) : null,
	token: token,
	userLocation: "",
	showSidebar: false,
	isEditing: false,
	editJobId: "",
	position: "",
	company: "",
	jobLocation: "",
	jobTypeOptions: ["full_time", "part_time", "remote", "internship"],
	jobType: "full_time",
	statusOptions: ["interview", "declined", "pending"],
	status: "pending",
	jobs: [],
	totalJobs: 0,
	totalPages: 1,
	page: 1,
	stats: {},
	monthlyApplications: [],
	search: "",
	searchStatus: "all",
	searchType: "all",
	sort: "latest",
	sortOptions: ["latest", "oldest", "a-z", "z-a"],
};

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	// axios
	const authFetch = axios.create({
		baseURL: "https://nest-job-tracker.herokuapp.com/api/v1",
	});
	// request

	authFetch.interceptors.request.use(
		(config) => {
			config.headers.common["Authorization"] = `Bearer ${state.token}`;
			return config;
		},
		(error) => {
			return Promise.reject(error);
		}
	);
	// response

	authFetch.interceptors.response.use(
		(response) => {
			return response;
		},
		(error) => {
			if (error.response.status === 401) {
				logoutUser();
			}
			return Promise.reject(error);
		}
	);
	// prevent server idling
	setInterval(async () => {
		await axios.get("https://nest-job-tracker.herokuapp.com/");
	}, 1000 * 60 * 10);

	const displayAlert = () => {
		dispatch({ type: DISPLAY_ALERT });
		clearAlert();
	};

	const clearAlert = () => {
		setTimeout(() => {
			dispatch({ type: CLEAR_ALERT });
		}, 2000);
	};

	const addUserToLocalStorage = (user, token) => {
		localStorage.setItem("user", JSON.stringify(user));
		localStorage.setItem("token", token);
		console.log(token);
	};

	const removeUserFromLocalStorage = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	};

	const setupUser = async ({ currentUser, endPoint, alertText }) => {
		dispatch({ type: SETUP_USER_BEGIN });
		try {
			const { data } = await axios.post(
				`https://nest-job-tracker.herokuapp.com/api/v1/auth/${endPoint}`,
				currentUser
			);
			const { user, token } = data;
			dispatch({
				type: SETUP_USER_SUCCESS,
				payload: { user, token, alertText },
			});
			addUserToLocalStorage(user, token);
		} catch (error) {
			dispatch({
				type: SETUP_USER_ERROR,
				payload: { msg: error.response.data.message },
			});
		}
		clearAlert();
	};
	const toggleSidebar = () => {
		dispatch({ type: TOGGLE_SIDEBAR });
	};

	const logoutUser = () => {
		dispatch({ type: LOGOUT_USER });
		removeUserFromLocalStorage();
	};
	const updateUser = async (currentUser) => {
		dispatch({ type: UPDATE_USER_BEGIN });
		try {
			const { data } = await authFetch.patch("/auth/updateUser", currentUser);
			console.log(data);
			const { user, token } = data;
			dispatch({
				type: UPDATE_USER_SUCCESS,
				payload: { user, token },
			});
			addUserToLocalStorage(user, token);
		} catch (error) {
			if (error.response.status !== 401) {
				dispatch({
					type: UPDATE_USER_ERROR,
					payload: { msg: error.response.data.message },
				});
			}
			if (error.response.status == 422) {
				dispatch({
					type: UPDATE_USER_ERROR,
					payload: { msg: error.response.data.message },
				});
			}
		}
		clearAlert();
	};

	const handleChange = ({ name, value }) => {
		dispatch({ type: HANDLE_CHANGE, payload: { name, value } });
	};
	const clearValues = () => {
		dispatch({ type: CLEAR_VALUES });
	};
	const createJob = async () => {
		dispatch({ type: CREATE_JOB_BEGIN });
		try {
			const { position, company, jobLocation, jobType, status } = state;
			await authFetch.post("/jobs", {
				position,
				company,
				jobLocation,
				jobType,
				status,
			});
			dispatch({ type: CREATE_JOB_SUCCESS });
			dispatch({ type: CLEAR_VALUES });
		} catch (error) {
			if (error.response.status === 401) return;
			dispatch({
				type: CREATE_JOB_ERROR,
				payload: { msg: error.response.data.message },
			});
		}
		clearAlert();
	};

	const getJobs = async () => {
		const { page, search, searchStatus, searchType, sort } = state;

		let url = `https://nest-job-tracker.herokuapp.com/api/v1/jobs?page=${page}&status=${searchStatus}&jobType=${searchType}&sort=${sort}`;
		if (search) {
			url = url + `&search=${search}`;
		}
		dispatch({ type: GET_JOBS_BEGIN });
		try {
			const { data } = await authFetch(url);
			const { jobs, totalJobs, totalPages } = data;
			dispatch({
				type: GET_JOBS_SUCCESS,
				payload: {
					jobs,
					totalJobs,
					totalPages,
				},
			});
		} catch (error) {
			logoutUser();
		}
		clearAlert();
	};

	const setEditJob = (id) => {
		console.log(id);
		dispatch({ type: SET_EDIT_JOB, payload: { id } });
	};
	const editJob = async () => {
		dispatch({ type: EDIT_JOB_BEGIN });

		try {
			const { position, company, jobLocation, jobType, status } = state;
			await authFetch.patch(`/jobs/${state.editJobId}`, {
				company,
				position,
				jobLocation,
				jobType,
				status,
			});
			dispatch({ type: EDIT_JOB_SUCCESS });
			dispatch({ type: CLEAR_VALUES });
		} catch (error) {
			if (error.response.status === 401) return;
			dispatch({
				type: EDIT_JOB_ERROR,
				payload: { msg: error.response.data.message },
			});
		}
		clearAlert();
	};
	const deleteJob = async (jobId) => {
		dispatch({ type: DELETE_JOB_BEGIN });
		try {
			await authFetch.delete(`/jobs/${jobId}`);
			getJobs();
		} catch (error) {
			logoutUser();
		}
	};
	const showStats = async () => {
		dispatch({ type: SHOW_STATS_BEGIN });
		try {
			const { data } = await authFetch("/jobs/stats");
			dispatch({
				type: SHOW_STATS_SUCCESS,
				payload: {
					stats: data.jobStatus,
					monthlyApplications: data.monthlyApplications,
				},
			});
		} catch (error) {
			logoutUser();
		}
		clearAlert();
	};
	const clearFilters = () => {
		dispatch({ type: CLEAR_FILTERS });
	};
	const changePage = (page) => {
		dispatch({ type: CHANGE_PAGE, payload: { page } });
	};
	return (
		<AppContext.Provider
			value={{
				...state,
				displayAlert,
				setupUser,
				toggleSidebar,
				logoutUser,
				updateUser,
				handleChange,
				clearValues,
				createJob,
				getJobs,
				setEditJob,
				deleteJob,
				editJob,
				showStats,
				clearFilters,
				changePage,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

const useAppContext = () => {
	return useContext(AppContext);
};

export { AppProvider, initialState, useAppContext };
