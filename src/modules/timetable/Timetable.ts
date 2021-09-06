import {
  Courses,
  Section,
  TimeRange,
  WeekdaysEnum,
  WeekdaysEnumEN,
  DayCoursesEnum,
  XData,
} from "../xlsx/interfaces";
import { isOverlap } from "../xlsx/utils";
import { XLSXParser } from "../xlsx/XLSXParser";
import { TimetableOpts, WeeklySchedule } from "./interfaces";
import { newSchedule } from "./utils";

export class Timetable {
  static generate(selected: XData, opts?: TimetableOpts): WeeklySchedule[] {
    let filtered = selected.courses;

    if (opts) {
      const { avoidTime } = opts;
      if (avoidTime) {
        filtered = Timetable.filter(selected.courses, avoidTime);
      }
    }

    return Timetable.clashFree({
      wsJSON: [],
      courses: filtered,
      tperiod: selected.tperiod,
      timings: selected.timings,
      days: selected.days,
      startEndTime: selected.startEndTime,
    });
  }

  static filter(selected: Courses, avoidTime: TimeRange[]): Courses {
    const filtered: Courses = {};

    const sectionOverlap = (section: Section): boolean => {
      for (const slot of section.timeslots) {
        for (const blockedTime of avoidTime) {
          if (isOverlap(slot.time, blockedTime)) {
            return true;
          }
        }
      }
      return false;
    };

    for (const [ctitle, course] of Object.entries(selected)) {
      for (const [stitle, section] of Object.entries(course)) {
        if (!sectionOverlap(section)) {
          if (!(ctitle in filtered)) filtered[ctitle] = {};
          filtered[ctitle][stitle] = section;
        }
      }
    }

    return filtered;
  }

  //idea taken from @Hamza Zaheer
  static clashFree(filtered: XData): WeeklySchedule[] {
    const tables: WeeklySchedule[] = [];
    const filteredC: Courses = filtered.courses;
    const periodDuration = filtered.tperiod;
    const courses = Object.keys(filteredC);
    const maxdepth = courses.length;
    const startend = filtered.startEndTime;

    console.log(courses);
    console.log(maxdepth);

    const recursive = (table: WeeklySchedule, depth: number) => {
      if (depth === maxdepth) {
        tables.push(JSON.parse(JSON.stringify(table)));
        return;
      }

      for (const [, section] of Object.entries(filteredC[courses[depth]])) {
        let clash = false;
        const sections = XLSXParser.toXLSXJSON({ section: section });
        for (const section of sections) {
          for (
            let i = Math.floor((section.time.s - startend.s) / periodDuration);
            i < Math.ceil((section.time.e - startend.s) / periodDuration);
            ++i
          ) {
            const day =
              WeekdaysEnumEN[
                WeekdaysEnum[section.day] as keyof typeof WeekdaysEnumEN
              ];

            const hour = i as DayCoursesEnum;
            if (table[day][hour]) {
              clash = true;
            } else {
              table[day][hour] = section;
            }
          }
        }

        if (!clash) recursive(table, depth + 1);

        for (const section of sections) {
          for (
            let i = Math.floor((section.time.s - startend.s) / periodDuration);
            i < Math.ceil((section.time.e - startend.s) / periodDuration);
            ++i
          ) {
            const day =
              WeekdaysEnumEN[
                WeekdaysEnum[section.day] as keyof typeof WeekdaysEnumEN
              ];
            const hour = i as DayCoursesEnum;
            if (JSON.stringify(table[day][hour]) === JSON.stringify(section)) {
              table[day][hour] = null;
            }
          }
        }
      }
    };

    recursive(newSchedule(), 0);

    return tables;
  }
}
