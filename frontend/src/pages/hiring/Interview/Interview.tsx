import { Button, Collapse } from "@mui/material";
import moment from "moment";
import { memo, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInterviews } from "../../../hooks/hiring/useInterviews";
import { useAuth } from "../../../contexts/AuthContext";
import Header from "../../../components/hiring/HiringHeader/Header";
import Layout from "../../../components/hiring/HiringLayout";
// TODO: Phase 2B - Restore timeslot booking functionality
// import TimeslotBooking from "../HireV3/TimeslotBooking";
import InterviewBody from "./InterviewBody";
import InterviewCalendar from "./InterviewCalendar";
import InterviewHeader from "./InterviewHeader";

const now = moment();
const monday = now.clone().weekday(1);
const friday = now.clone().weekday(5);

const Interview = () => {
  const [selectedView, setSelectedView] = useState<"list" | "calendar">(
    "calendar",
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const [startDate, setStartDate] = useState(monday);
  const [endDate, setEndDate] = useState(friday);

  const [active, setActive] = useState(
    searchParams.get("timeslot-booking") === "1",
  );

  const closeView = useCallback(() => {
    setSearchParams({
      "timeslot-booking": "0",
    });
    setActive(false);
  }, [setSearchParams]);

  const openView = useCallback(() => {
    setSearchParams({
      "timeslot-booking": "1",
    });
    setActive(true);
  }, [setSearchParams]);

  const goToNextWeek = useCallback(() => {
    setStartDate((prev) => prev.clone().add({ week: 1 }));
    setEndDate((prev) => prev.clone().add({ week: 1 }));
  }, []);
  const goToPrevWeek = useCallback(() => {
    setStartDate((prev) => prev.clone().subtract({ week: 1 }));
    setEndDate((prev) => prev.clone().subtract({ week: 1 }));
  }, []);

  const goToThisWeek = useCallback(() => {
    setStartDate(monday);
    setEndDate(friday);
  }, []);

  const handleCalendarNavigate = useCallback((newDate: moment.Moment) => {
    const newMonday = newDate.clone().weekday(1);
    const newFriday = newDate.clone().weekday(5);
    setStartDate(newMonday);
    setEndDate(newFriday);
  }, []);

  const { user } = useAuth();

  // Memoize clientId to prevent infinite re-renders from user object changes
  const clientId = useMemo(() => (user as any)?.clientId || 999, [(user as any)?.clientId]);

  // Memoize date strings to prevent infinite re-renders
  const startDateISO = useMemo(() => startDate.clone().utc().startOf("day").toISOString(), [startDate.valueOf()]);
  const endDateISO = useMemo(() => endDate.clone().utc().endOf("day").toISOString(), [endDate.valueOf()]);

  // Memoize filters to prevent infinite re-renders
  const interviewFilters = useMemo(() => ({
    clientId,
    startDate: startDateISO,
    endDate: endDateISO,
  }), [clientId, startDateISO, endDateISO]);

  const { data, loading: isFetching, error } = useInterviews(interviewFilters);

  const isError = !!error;

  return (
    <Layout
      header={
        <InterviewHeader
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          startDate={startDate}
          endDate={endDate}
          isFetching={isFetching}
          goToNextWeek={goToNextWeek}
          goToPrevWeek={goToPrevWeek}
          goToThisWeek={goToThisWeek}
          onBookTimeslots={openView}
        />
      }
      body={
        <>
          <Collapse in={selectedView === "list"} key={"list"}>
            <InterviewBody
              filteredData={data || []}
              key={data?.map((el: any) => el.eventId || el.id).join("") || "empty"}
            ></InterviewBody>
          </Collapse>
          <Collapse in={selectedView === "calendar"} key="calendar">
            <InterviewCalendar
              filteredData={data || []}
              startDate={startDate}
              onNavigate={handleCalendarNavigate}
            ></InterviewCalendar>
          </Collapse>
        </>
      }
    ></Layout>
  );
};

export default memo(Interview);
