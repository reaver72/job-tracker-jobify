import moment from 'moment'
import { FaLocationArrow, FaBriefcase, FaCalendarAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/appContext'
import Wrapper from '../assets/wrappers/Job'
import JobInfo from './JobInfo'
import Avatar from "react-avatar"
const Job = ({
  job_id,
  job_position,
  job_company,
  job_jobLocation,
  job_jobType,
  job_createdAt,
  job_status,
}) => {
  const { setEditJob, deleteJob } = useAppContext()
  let date = moment(job_createdAt)
  date = date.format('MMM Do, YYYY')
  return (
		<Wrapper>
			<header>
				{/* <div className='main-icon'>{company.charAt(0)}</div> */}
				<div className="info">
					<div className="cName">
						<Avatar
							name={job_company}
							size="55px"
							color={"#5786F1"}
              round={10}
						/>
						<div className='sep_pc'>
							<h5>{job_position}</h5>
							<p>{job_company}</p>
						</div>
					</div>
				</div>
			</header>
			<div className="content">
				<div className="content-center">
					<JobInfo icon={<FaLocationArrow />} text={job_jobLocation} />
					<JobInfo icon={<FaCalendarAlt />} text={date} />
					<JobInfo icon={<FaBriefcase />} text={job_jobType} />
					<div className={`status ${job_status}`}>{job_status}</div>
				</div>
				<footer>
					<div className="actions">
						<Link
							to="/add-job"
							className="btn edit-btn"
							onClick={() => setEditJob(job_id)}
						>
							Edit
						</Link>
						<button
							type="button"
							className="btn delete-btn"
							onClick={() => deleteJob(job_id)}
						>
							Delete
						</button>
					</div>
				</footer>
			</div>
		</Wrapper>
	);
}

export default Job
