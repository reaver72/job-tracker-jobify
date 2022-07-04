import { useEffect, useState } from "react";
import { FormRow, Alert } from "../../components";
import { useAppContext } from "../../context/appContext";
import Wrapper from "../../assets/wrappers/DashboardFormPage";
const axios = require("axios");

const Profile = () => {
	useEffect(() => {
		const getUser = async () => {
			const { data } = await axios.get("https://nest-job-tracker.herokuapp.com/api/v1/auth/currentUser", {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
      setName(data.firstname);
      setLastName(data.lastname);
      setEmail(data.email);
      setLocation(data.location);
		};
		getUser();
	}, []);
	const [firstname, setName] = useState("");
	const [email, setEmail] = useState("");
	const [lastname, setLastName] = useState("");
	const [location, setLocation] = useState("");
	const { showAlert, displayAlert, updateUser, isLoading } = useAppContext();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!firstname || !email || !lastname || !location) {
			displayAlert();
			return;
		}
		updateUser({ firstname, email, lastname, location });
	};

	return (
		<Wrapper>
			<form className="form" onSubmit={handleSubmit}>
				<h3>profile</h3>
				{showAlert && <Alert />}
				<div className="form-center">
					<FormRow
						type="text"
						name="first name"
						value={firstname}
						handleChange={(e) => setName(e.target.value)}
					/>
					<FormRow
						type="text"
						labelText="last name"
						name="lastName"
						value={lastname}
						handleChange={(e) => setLastName(e.target.value)}
					/>
					<FormRow
						type="email"
						name="email"
						value={email}
						handleChange={(e) => setEmail(e.target.value)}
					/>
					<FormRow
						type="text"
						name="location"
						value={location}
						handleChange={(e) => setLocation(e.target.value)}
					/>
					<button className="btn btn-block" type="submit" disabled={isLoading}>
						{isLoading ? "Please Wait..." : "save changes"}
					</button>
				</div>
			</form>
		</Wrapper>
	);
};

export default Profile;
