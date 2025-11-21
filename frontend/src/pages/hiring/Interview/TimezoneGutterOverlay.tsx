import { Box, useTheme } from "@mui/material";
import moment from "moment-timezone";
import { useEffect, useRef, useState } from "react";

interface TimezoneGutterOverlayProps {
  min: Date;
  max: Date;
  step: number;
  timeslots: number;
}

const TimezoneGutterOverlay = ({ min, max, step, timeslots }: TimezoneGutterOverlayProps) => {
  const theme = useTheme();
  const gutterRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const calendarContent = document.querySelector(".rbc-time-content");
    const timeHeader = document.querySelector(".rbc-time-header");
    
    if (timeHeader) {
      setHeaderHeight(timeHeader.clientHeight);
    }
    
    if (!calendarContent) return;

    const handleScroll = () => {
      setScrollTop(calendarContent.scrollTop);
    };

    calendarContent.addEventListener("scroll", handleScroll);
    return () => calendarContent.removeEventListener("scroll", handleScroll);
  }, []);

  const userTz = moment.tz.guess();
  const isIndia = userTz.includes("Kolkata") || userTz === "Asia/Calcutta";
  const isPhilippines = userTz.includes("Manila");
  const isAustralia = userTz.includes("Sydney") || userTz.includes("Melbourne") || userTz.includes("Brisbane") || userTz.includes("Australia");

  const slots: Date[] = [];
  const current = moment(min);
  const end = moment(max);

  while (current.isBefore(end)) {
    slots.push(current.toDate());
    current.add(60, "minutes");
  }

  return (
    <Box
      ref={gutterRef}
      sx={{
        position: "absolute",
        left: 0,
        top: headerHeight,
        width: "140px",
        height: `calc(100% - ${headerHeight}px)`,
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          transform: `translateY(-${scrollTop}px)`,
        }}
      >
        {slots.map((slot, index) => {

          const m = moment(slot);
          const indiaTime = m.clone().tz("Asia/Kolkata");
          const philippinesTime = m.clone().tz("Asia/Manila");
          const australiaTime = m.clone().tz("Australia/Sydney");

          const timezones = [];
          if (isIndia) {
            timezones.push({ flag: "🇮🇳", time: indiaTime.format("h:mm A"), isCurrent: true });
            timezones.push({ flag: "🇵🇭", time: philippinesTime.format("h:mm A"), isCurrent: false });
            timezones.push({ flag: "🇦🇺", time: australiaTime.format("h:mm A"), isCurrent: false });
          } else if (isPhilippines) {
            timezones.push({ flag: "🇵🇭", time: philippinesTime.format("h:mm A"), isCurrent: true });
            timezones.push({ flag: "🇮🇳", time: indiaTime.format("h:mm A"), isCurrent: false });
            timezones.push({ flag: "🇦🇺", time: australiaTime.format("h:mm A"), isCurrent: false });
          } else if (isAustralia) {
            timezones.push({ flag: "🇦🇺", time: australiaTime.format("h:mm A"), isCurrent: true });
            timezones.push({ flag: "🇮🇳", time: indiaTime.format("h:mm A"), isCurrent: false });
            timezones.push({ flag: "🇵🇭", time: philippinesTime.format("h:mm A"), isCurrent: false });
          } else {
            timezones.push({ flag: "", time: m.format("h:mm A"), isCurrent: true });
            timezones.push({ flag: "🇮🇳", time: indiaTime.format("h:mm A"), isCurrent: false });
            timezones.push({ flag: "🇵🇭", time: philippinesTime.format("h:mm A"), isCurrent: false });
            timezones.push({ flag: "🇦🇺", time: australiaTime.format("h:mm A"), isCurrent: false });
          }

          return (
            <Box
              key={index}
              sx={{
                height: "60px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 0.5,
                px: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              {timezones.map((tz, tzIndex) => (
                <Box
                  key={tzIndex}
                  sx={{
                    fontSize: tz.isCurrent ? "0.85rem" : "0.75rem",
                    fontWeight: tz.isCurrent ? 600 : 400,
                    color: tz.isCurrent ? theme.palette.text.primary : theme.palette.text.secondary,
                    textAlign: tz.isCurrent ? "right" : "left",
                    lineHeight: 1.2,
                  }}
                >
                  {tz.flag} {tz.time}
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default TimezoneGutterOverlay;
