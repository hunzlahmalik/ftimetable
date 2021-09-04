import {
  IJSON,
  IRange,
  ISection,
  WeekdaysEnum,
  WeekdaysEnumEN,
  XLSXCourseHoursEnum,
} from "../xlsx/interfaces";
import { isOverlap } from "../xlsx/utils";
import { XLSXParser } from "../xlsx/XLSXParser";
import { TimetableOpts, WeeklySchedule } from "./interfaces";
import { newSchedule } from "./utils";

export class Timetable {
  static generate(selected: IJSON, opts?: TimetableOpts): WeeklySchedule[] {
    let filtered = selected;

    if (opts) {
      const { avoidTime } = opts;
      if (avoidTime) {
        filtered = Timetable.filter(selected, avoidTime);
      }
    }

    return Timetable.clashFree(filtered);
  }

  static filter(selected: IJSON, avoidTime: IRange<number>[]): IJSON {
    const filtered: IJSON = {};

    const sectionOverlap = (section: ISection): boolean => {
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
  static clashFree(filtered: IJSON, periodDuration = 90): WeeklySchedule[] {
    const tables: WeeklySchedule[] = [];
    const courses = Object.keys(filtered);
    const maxdepth = courses.length; //XLSXParser.toXLSXJSON({ courses: filtered }).length;
    console.log(courses);
    console.log(maxdepth);
    const recursive = (table: WeeklySchedule, depth: number) => {
      if (depth === maxdepth) {
        tables.push(JSON.parse(JSON.stringify(table)));
        return;
      }
      // console.log(
      //   `filtered[courses[depth]]=${JSON.stringify(filtered[courses[depth]])}`
      // );
      for (const [, section] of Object.entries(filtered[courses[depth]])) {
        let clash = false;
        const sections = XLSXParser.toXLSXJSON({ section: section });
        for (const section of sections) {
          for (
            let i = Math.floor(section.time_start / periodDuration);
            i < Math.ceil(section.time_end / periodDuration);
            ++i
          ) {
            const day =
              WeekdaysEnumEN[
                WeekdaysEnum[section.day] as keyof typeof WeekdaysEnumEN
              ];
            const hour =
              XLSXCourseHoursEnum[
                Object.keys(XLSXCourseHoursEnum)[
                  i
                ] as keyof typeof XLSXCourseHoursEnum
              ];
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
            let i = Math.floor(section.time_start / periodDuration);
            i < Math.ceil(section.time_end / periodDuration);
            ++i
          ) {
            const day =
              WeekdaysEnumEN[
                WeekdaysEnum[section.day] as keyof typeof WeekdaysEnumEN
              ];
            const hour =
              XLSXCourseHoursEnum[
                Object.keys(XLSXCourseHoursEnum)[
                  i
                ] as keyof typeof XLSXCourseHoursEnum
              ];
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
