export interface Range<Type> {
  s: Type;
  e: Type;
}

export type TimeRange = Range<number>;

export interface Period {
  ctitle: string; //course title
  stitle: string; //section title
  day: number; // day, Monday being 0
  room: string;
  time: Range<number>; //starting and ending time in Minutes
}

export interface Timeslot {
  day: number; // day, Monday being 0
  room: string;
  time: TimeRange; //starting and ending time in Minutes
}

export interface ITeacher {
  name: string;
  permanent?: boolean;
}

export interface Time24 {
  hour: number;
  minutes: number;
}

export interface Time12 extends Time24 {
  period: "am" | "pm";
}

export interface Section {
  ctitle: string;
  stitle: string;
  timeslots: Timeslot[];
  teacher?: ITeacher;
  level?: "bachelor" | "master";
  dept?: string;
  semester?: number;
}

// For XLSX file
export interface Sections {
  [section: string]: Section;
}

export interface Courses {
  [course: string]: Sections;
}

export interface XData {
  version?: number;
  wsJSON: Record<string, unknown>[];
  courses: Courses;
  tperiod: number; //time of one period
  timings: TimeRange[];
  startEndTime: TimeRange;
  days: string[];
}

// REGEX
export interface REGEX {
  full: string;
}

export interface COURSE_R extends REGEX {
  title: string;
  sections: string;
}

export interface TIME24_R extends REGEX {
  hour: string;
  minute: string;
}

export interface TIME12_R extends TIME24_R {
  period: string;
}

// ENUMS
export enum WeekdaysEnum {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
  Unknown,
}

export enum WeekdaysEnumEN {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  // Sunday = "Sunday",
}

export enum DayCoursesEnum {
  Course1,
  Course2,
  Course3,
  Course4,
  Course5,
  Course6,
  Course7,
  Course8,
}
