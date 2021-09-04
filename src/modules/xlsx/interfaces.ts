export interface ICourseSection {
  title: string;
  section: string;
  time_start: number;
  time_end: number;
  day: number;
  room: string;
}

// selected Course and section
export interface SelectedCS {
  [course: string]: string[]; //sections agains course
}

export interface IJSONOBJ {
  [sectionkey: string]: ISection;
}

export interface IJSON {
  [coursekey: string]: IJSONOBJ;
}

export interface ICOURSE_REGEX {
  full: string;
  title: string;
  sections: string;
}

export interface ITIME24_REGEX {
  full: string;
  hour: string;
  minute: string;
}

export interface ITIME12_REGEX extends ITIME24_REGEX {
  period: string;
}

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

export enum XLSXCourseHoursEnum {
  Course1 = "8:00-9:30",
  Course2 = "9:30-11:00",
  Course3 = "11:00-12:30",
  Course4 = "12:30-14:00",
  Course5 = "14:00-15:30",
  Course6 = "15:30-17:00",
  Course7 = "17:00-18:30",
  Course8 = "18:30-20:00",
}

export interface ITeacher {
  name: string;
  category?: "permanent" | "visiting";
}

export interface IRoom {
  name: string;
  location?: string;
  type?: "lab" | "room" | "hall";
}

export interface IRange<Type> {
  s: Type;
  e: Type;
}

export interface Timeslot {
  day: WeekdaysEnum;
  room: IRoom;
  time: IRange<number>;
}

export interface ISection {
  title: string;
  section: string;
  timeslots: Timeslot[];
  teacher?: ITeacher;
  level?: "bachelor" | "master";
  dept?: string;
  semester?: number;
}

export interface ITime {
  hour: number;
  minutes: number;
  is24: boolean;
  period?: "am" | "pm";
}
