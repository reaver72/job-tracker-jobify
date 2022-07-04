import { useAppContext } from '../context/appContext'
import { useEffect } from 'react'
import Loading from './Loading'
import Job from './Job'
import Wrapper from '../assets/wrappers/JobsContainer'
import PageBtnContainer from './PageBtnContainer'
import Avatar from "react-avatar"
const JobsContainer = () => {
  const {
    getJobs,
    jobs,
    isLoading,
    page,
    totalJobs,
    search,
    searchStatus,
    searchType,
    sort,
    totalPages,
  } = useAppContext()
  useEffect(() => {
    getJobs()
    // eslint-disable-next-line
  }, [page, search, searchStatus, searchType, sort])
  if (isLoading) {
    return <Loading center />
  }
  const jobStatus = () => {
    
  }
  if (jobs.length === 0) {
    return (
      <Wrapper>
        <h2>No jobs to display...</h2>
      </Wrapper>
    )
  }

  return (
		<Wrapper>
			<h5>
				{totalJobs} job{jobs.length > 1 && "s"} found
			</h5>
			<div className="jobs">
				{jobs.map((job) => {
					return <Job key={job.job_id} {...job} jobStatus={jobStatus} />;
				})}
			</div>
			{totalPages > 1 && <PageBtnContainer />}
		</Wrapper>
	);
}

export default JobsContainer
