import { Button } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import type {
  MenuOptions,
  Option,
} from "../../../components/hiring/HiringHeader/FilterView";
import Header from "../../../components/hiring/HiringHeader/Header";
import Layout from "../../../components/hiring/HiringLayout";
import JobBreadcrumbs from "./JobBreadcrumbs";
import JobsContainer from "./JobsContainer";

const TIME_FRAME = [
  { title: "Today", id: "today" },
  { title: "Yesterday", id: "yesterday" },
  { title: "This week", id: "thisweek" },
  { title: "Last week", id: "lastweek" },
  { title: "This month", id: "thismonth" },
  { title: "Last month", id: "lastmonth" },
  { title: "This quarter", id: "thisquarter" },
  { title: "Last quarter", id: "lastquarter" },
];

const REQUEST_TYPE = [
  {
    title: "Open",
    id: "open",
  },
  {
    title: "Closed",
    id: "closed",
  },
];

const Container = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const clientCode = (user as any)?.clientId || 999;

  const [recruiterList, setRecruiterList] = useState<any>({ data: { users: [] } });

  const memoizedRecruiterList: Array<MenuOptions> = useMemo(() => {
    return [];
  }, [recruiterList]);

  const [filters, setFilters] = useState<Option>({});

  const setFilterObject = useCallback((option: Option) => {
    setFilters((prev) => ({
      ...prev,
      ...option,
    }));
  }, []);

  const openView = useCallback(() => {
    navigate("/interviews?timeslot-booking=1");
  }, [navigate]);

  const options: Array<MenuOptions> = [
    {
      id: "recruiter",
      title: "Recruiter",
      options: memoizedRecruiterList,
    },
    {
      id: "timeFrame",
      title: "Time Frame",
      options: TIME_FRAME,
    },
    {
      id: "status",
      title: "Type",
      options: REQUEST_TYPE,
    },
  ];
  return (
    <Layout
      header={
        <Header
          options={options}
          filters={filters}
          breadCrumbs={<JobBreadcrumbs />}
          title={"Open Position"}
          setFilters={setFilterObject}
          onSearch={setSearchTerm}
          secondaryActions={
            <Button variant="outlined" onClick={openView}>
              Book and edit timeslots
            </Button>
          }
        />
      }
      body={
        <JobsContainer
          clientCode={clientCode}
          searchTerm={searchTerm}
          selectedRecruiter={filters.recruiter}
          selectedTimeFrame={filters.timeFrame}
          showActive={filters.status !== "closed"}
        />
      }
    />
  );
};

export default Container;
