import {
  DayCoursesEnum,
  Period,
  TimeRange,
  WeekdaysEnumEN,
} from "../xlsx/interfaces";

export interface TimetableOpts {
  avoidTime?: TimeRange[];
}

export type WeeklySchedule = {
  [key in WeekdaysEnumEN]: {
    [key in DayCoursesEnum]: Period | null | undefined;
  };
};
