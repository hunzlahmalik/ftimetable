import {
  ICourseSection,
  IRange,
  WeekdaysEnumEN,
  XLSXCourseHoursEnum,
} from "../xlsx/interfaces";

export interface TimetableOpts {
  avoidTime?: IRange<number>[];
}

// type Partial<T> = {
//   [P in keyof T]?: T[P];
// };

export type WeeklySchedule = {
  [key in WeekdaysEnumEN]: {
    [key2 in XLSXCourseHoursEnum]: ICourseSection | null | undefined;
  };
};
