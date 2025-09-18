import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

// Set default timezone for the whole app
const MELBOURNE_TZ = "Australia/Melbourne";

// set default timezone to Melbourne
dayjs.tz.setDefault(MELBOURNE_TZ);

export function today() {
  return dayjs();
}

export const formatDate = (date: string | Date, format = "DD/MM/YYYY") => {
  return dayjs(date).format(format);
};

export function currentWeek() {
  return {
    start: dayjs().startOf("isoWeek").format("YYYY-MM-DD"),
    end: dayjs().endOf("isoWeek").format("YYYY-MM-DD"),
  };
}

export default dayjs;
