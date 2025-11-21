import { Box, useTheme } from "@mui/material";
import moment from "moment-timezone";
import type { ReactNode } from "react";

interface MultiTimezoneGutterProps {
  value?: Date;
  children?: ReactNode;
  resource?: any;
}

const MultiTimezoneGutter = ({ value, children }: MultiTimezoneGutterProps) => {
  const theme = useTheme();
  
  if (!value) {
    return <div>{children}</div>;
  }

  const m = moment(value);
  const userTz = moment.tz.guess();
  const indiaTime = m.clone().tz("Asia/Kolkata");
  const philippinesTime = m.clone().tz("Asia/Manila");
  const australiaTime = m.clone().tz("Australia/Sydney");
  
  // Check if user is in one of the target timezones (including variations)
  const isIndia = userTz.includes("Kolkata") || userTz === "Asia/Calcutta";
  const isPhilippines = userTz.includes("Manila");
  const isAustralia = userTz.includes("Sydney") || userTz.includes("Melbourne") || userTz.includes("Brisbane") || userTz.includes("Australia");
  const isInTargetTz = isIndia || isPhilippines || isAustralia;

  // Build timezone list with user's timezone first
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
    // User is in a different timezone
    timezones.push({ flag: "", time: m.format("h:mm A"), isCurrent: true });
    timezones.push({ flag: "🇮🇳", time: indiaTime.format("h:mm A"), isCurrent: false });
    timezones.push({ flag: "🇵🇭", time: philippinesTime.format("h:mm A"), isCurrent: false });
    timezones.push({ flag: "🇦🇺", time: australiaTime.format("h:mm A"), isCurrent: false });
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        px: 1.5,
        gap: 0.3,
        fontSize: "0.7rem",
        lineHeight: 1.6,
        height: "100%",
        justifyContent: "center",
      }}
    >
      {timezones.map((tz, index) => (
        <Box
          key={index}
          sx={{
            fontWeight: tz.isCurrent ? 600 : 400,
            color: tz.isCurrent ? theme.palette.text.primary : theme.palette.text.secondary,
            fontSize: tz.isCurrent ? "0.75rem" : "0.7rem",
            textAlign: tz.isCurrent ? "right" : "left",
            width: "100%",
          }}
        >
          {tz.flag} {tz.time}
        </Box>
      ))}
    </Box>
  );
};

export default MultiTimezoneGutter;
