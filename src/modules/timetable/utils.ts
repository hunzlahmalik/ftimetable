import { XLSXCourseHoursEnum, WeekdaysEnumEN } from "../xlsx/interfaces";
import { WeeklySchedule } from "./interfaces";

export function newSchedule(): WeeklySchedule {
  return {
    [WeekdaysEnumEN.Monday]: {
      [XLSXCourseHoursEnum.Course1]: null,
      [XLSXCourseHoursEnum.Course2]: null,
      [XLSXCourseHoursEnum.Course3]: null,
      [XLSXCourseHoursEnum.Course4]: null,
      [XLSXCourseHoursEnum.Course5]: null,
      [XLSXCourseHoursEnum.Course6]: null,
      [XLSXCourseHoursEnum.Course7]: null,
      [XLSXCourseHoursEnum.Course8]: null,
    },
    [WeekdaysEnumEN.Tuesday]: {
      [XLSXCourseHoursEnum.Course1]: null,
      [XLSXCourseHoursEnum.Course2]: null,
      [XLSXCourseHoursEnum.Course3]: null,
      [XLSXCourseHoursEnum.Course4]: null,
      [XLSXCourseHoursEnum.Course5]: null,
      [XLSXCourseHoursEnum.Course6]: null,
      [XLSXCourseHoursEnum.Course7]: null,
      [XLSXCourseHoursEnum.Course8]: null,
    },
    [WeekdaysEnumEN.Wednesday]: {
      [XLSXCourseHoursEnum.Course1]: null,
      [XLSXCourseHoursEnum.Course2]: null,
      [XLSXCourseHoursEnum.Course3]: null,
      [XLSXCourseHoursEnum.Course4]: null,
      [XLSXCourseHoursEnum.Course5]: null,
      [XLSXCourseHoursEnum.Course6]: null,
      [XLSXCourseHoursEnum.Course7]: null,
      [XLSXCourseHoursEnum.Course8]: null,
    },
    [WeekdaysEnumEN.Thursday]: {
      [XLSXCourseHoursEnum.Course1]: null,
      [XLSXCourseHoursEnum.Course2]: null,
      [XLSXCourseHoursEnum.Course3]: null,
      [XLSXCourseHoursEnum.Course4]: null,
      [XLSXCourseHoursEnum.Course5]: null,
      [XLSXCourseHoursEnum.Course6]: null,
      [XLSXCourseHoursEnum.Course7]: null,
      [XLSXCourseHoursEnum.Course8]: null,
    },
    [WeekdaysEnumEN.Friday]: {
      [XLSXCourseHoursEnum.Course1]: null,
      [XLSXCourseHoursEnum.Course2]: null,
      [XLSXCourseHoursEnum.Course3]: null,
      [XLSXCourseHoursEnum.Course4]: null,
      [XLSXCourseHoursEnum.Course5]: null,
      [XLSXCourseHoursEnum.Course6]: null,
      [XLSXCourseHoursEnum.Course7]: null,
      [XLSXCourseHoursEnum.Course8]: null,
    },
    [WeekdaysEnumEN.Saturday]: {
      [XLSXCourseHoursEnum.Course1]: null,
      [XLSXCourseHoursEnum.Course2]: null,
      [XLSXCourseHoursEnum.Course3]: null,
      [XLSXCourseHoursEnum.Course4]: null,
      [XLSXCourseHoursEnum.Course5]: null,
      [XLSXCourseHoursEnum.Course6]: null,
      [XLSXCourseHoursEnum.Course7]: null,
      [XLSXCourseHoursEnum.Course8]: null,
    },
  };
}
