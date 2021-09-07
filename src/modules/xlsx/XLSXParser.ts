/**
 * @author Hunzlah Malik
 */

import { WorkSheet } from "xlsx/types";
import { XLSXUtils } from "./XLSXUtils";
import {
  COURSE_R,
  Courses,
  Period,
  Timeslot,
  Time24,
  TIME12_R,
  Section,
  XData,
  Sections,
  TimeRange,
  WeekdaysEnumEN,
} from "./interfaces";
import { COURSE_REGEX, TIME12_REGEX } from "./regex";
import { hourToMint, toWeekdays } from "./utils";

/**
 * Used for parsing and extracting data from XLSX docs
 * @class
 */
export class XLSXParser {
  data: XData;
  private jsonObj: Record<string, unknown>[] = [];
  private startTime = 0;

  constructor(
    private readonly ws: WorkSheet,
    private readonly skipRows: number = 3,
    private readonly periodRow: number = 2,
    private readonly periodTime: number = 90,
    private readonly coursesPerDay = 8
  ) {
    const courses = this.parseCourses();
    console.log(
      `actualStartEndTime=${JSON.stringify(
        XLSXParser.getStartEndTime(courses)
      )}`
    );
    this.data = {
      wsJSON: this.jsonObj,
      courses: courses,
      timings: this.getTimings(courses), //cols
      days: this.getDays(), //rows
      tperiod: this.periodTime,
      startEndTime: XLSXParser.getStartEndTime(courses),
    };
    // this.coursesJSON = XLSXParser.toXLSXJSON({ courses: this.courses });
  }

  /**
   * To get the list of all courses names
   * @param {Courses} - Courses Obj
   * @returns {string[]} list of courses names
   */
  getCoursesTitle(): string[] {
    return Object.keys(this.data.courses);
  }

  /**
   * To get the list of a course sections.
   * @returns list of section names
   */
  getSectionsName(courseTitle: string): string[] {
    return courseTitle in this.data.courses
      ? Object.keys(this.data.courses[courseTitle])
      : [];
  }

  /**
   * To get the data of specific section
   * @param courseTitle Course Name
   * @param sectionName Section Name
   * @returns {Section} Section data
   */
  getSection(courseTitle: string, sectionName: string): Section | undefined {
    return this.data.courses[courseTitle][sectionName] || undefined;
  }

  getTimings(courses: Courses): TimeRange[] {
    const stime = XLSXParser.getStartEndTime(courses).s;
    const lst: TimeRange[] = [];
    for (let i = 0; i < this.coursesPerDay; i++) {
      lst.push({
        s: i * this.periodTime + stime,
        e: i * this.periodTime + stime + this.periodTime,
      });
    }
    return lst;
  }

  getDays(): string[] {
    return Object.values(WeekdaysEnumEN);
  }

  /**
   * Converts the xlsx sheet to JSON
   * @returns {Courses} my type of JSON object
   */
  parseCourses(): Courses {
    const localCourses: Courses = {};

    // sheet to json
    this.jsonObj = XLSXUtils.utils.sheet_to_json(this.ws, {
      header: 0,
      defval: null,
      blankrows: true,
    }) as Record<string, unknown>[];

    this.startTime = hourToMint({
      hour: this.getStartTime(this.jsonObj, this.periodRow)?.hour,
      minutes: 0,
    });
    console.log(`startTime=${this.startTime}`);

    // getting the time
    const prow = this.getTimerow(
      this.jsonObj[this.periodRow - 1],
      this.startTime
    ); //periodRow-1 beacause the first row is header
    console.log(`prow=${prow}`);

    // removing the rows we don't need
    this.jsonObj.splice(0, this.skipRows);

    // recreating the json using new header
    this.jsonObj = XLSXUtils.utils.sheet_to_json(
      XLSXUtils.utils.json_to_sheet(this.jsonObj),
      { header: ["day", "room", ...prow.map(String)] }
    );

    /**
     * Correctly add the timeslot to timeslots
     * @param {Timeslot[]} timeslots - current timeslots list
     * @param {{day: number; room: string; t: number}} newslot - day, room and time you want to add to current slots
     * @returns {Timeslot[]}
     */
    const correctTimeslots = (
      timeslots: Timeslot[],
      newslot: { day: number; room: string; t: number }
    ): Timeslot[] => {
      for (const slot of timeslots) {
        if (JSON.stringify(slot) === JSON.stringify(newslot)) return timeslots;
        else if (slot.day === newslot.day && slot.room === newslot.room) {
          if (slot.time.s <= -1) slot.time.s = newslot.t - 10;
          if (slot.time.e === -1 || slot.time.e < newslot.t)
            slot.time.e = newslot.t;
          return timeslots;
        }
      }
      timeslots.push({
        day: newslot.day,
        room: newslot.room,
        time: { s: newslot.t - 10, e: -1 },
      });
      return timeslots;
    };

    // converting the json to {Courses}
    for (const row of this.jsonObj) {
      for (const [key, value] of Object.entries(row)) {
        if (typeof value !== "string") continue;
        if (COURSE_REGEX.test(value)) {
          // found the course
          const matches = value.match(COURSE_REGEX);
          if (matches && matches.groups) {
            // match found in course
            const cdata = matches.groups as unknown as COURSE_R;
            for (const section of cdata.sections.split(/[\,\ \&]+/)) {
              if (
                cdata.title in localCourses &&
                section in localCourses[cdata.title]
              ) {
                // all ready exsisting course and section
                localCourses[cdata.title][section].timeslots = correctTimeslots(
                  localCourses[cdata.title][section].timeslots,
                  {
                    day: toWeekdays(row.day),
                    room: String(row.room),
                    t: Number(key) ? Number(key) : -1,
                  }
                );
              } else {
                // new course or data
                if (!(cdata.title in localCourses))
                  localCourses[cdata.title] = {}; // if new course
                // already exsit course with but this section is new
                localCourses[cdata.title][section] = {
                  ctitle: cdata.title,
                  stitle: section,
                  timeslots: [
                    {
                      day: toWeekdays(row.day),
                      room: String(row.room),
                      time: {
                        s: Number(key) ? Number(key) - 10 : -1,
                        e: Number(key) ? Number(key) : -1,
                      },
                    },
                  ],
                };
              }
            }
          }
        }
      }
    }

    return localCourses;
  }

  /**
   * Converts the key type JSON to list of Course&Section
   * @param {Courses} courses
   * @returns {Period} list of courses
   */
  static toXLSXJSON(params: {
    courses?: Courses;
    sections?: Sections;
    section?: Section;
  }): Period[] {
    const lst: Period[] = [];
    if (params.courses) {
      for (const [, value] of Object.entries(params.courses)) {
        for (const [, section] of Object.entries(value)) {
          for (const slot of section.timeslots) {
            lst.push({
              ctitle: section.ctitle,
              stitle: section.stitle,
              time: slot.time,
              day: slot.day,
              room: slot.room,
            });
          }
        }
      }
    }
    if (params.sections) {
      for (const [, section] of Object.entries(params.sections)) {
        for (const slot of section.timeslots) {
          lst.push({
            ctitle: section.ctitle,
            stitle: section.stitle,
            time: slot.time,
            day: slot.day,
            room: slot.room,
          });
        }
      }
    }
    if (params.section) {
      for (const slot of params.section.timeslots) {
        lst.push({
          ctitle: params.section.ctitle,
          stitle: params.section.stitle,
          time: slot.time,
          day: slot.day,
          room: slot.room,
        });
      }
    }
    return lst;
  }

  /**
   * Convert CourseSection to string
   * @example
   * // returns "Advanced Computer Vision,MDS-4A,510,600,2,Aud-Old"
   * toStr({
      title: 'Advanced Computer Vision',
      section: 'MDS-4A',
      time_start: 510,
      time_end: 600,
      day: 2,
      room: 'Aud-Old'
    })
   * @param {Period} obj 
   * @param {string} delimiter 
   * @returns {string}
   */
  static toStr(obj: Period, delimiter = ","): string {
    return (
      obj.ctitle +
      delimiter +
      obj.stitle +
      delimiter +
      obj.time.s +
      delimiter +
      obj.time.e +
      delimiter +
      obj.day +
      delimiter +
      obj.room
    );
  }

  private getTimerow(
    periodRow: Record<string, unknown>,
    offset: number
  ): number[] {
    const lst: number[] = [];
    let hour = 0;
    for (const [, value] of Object.entries(periodRow))
      if (typeof value === "number") {
        lst.push(value + offset + hour * 60);
        if (value === 60) hour++; // incrementing time
      }
    return lst;
  }

  private getStartTime(data: Record<string, unknown>[], srow = 0): Time24 {
    for (let i = srow; i < data.length; i++) {
      for (const [, value] of Object.entries(data[i])) {
        if (typeof value !== "string" || !TIME12_REGEX.test(value)) continue;

        const matches = value.match(TIME12_REGEX);

        if (matches && matches.groups) {
          const timedata = matches.groups as unknown as TIME12_R;
          return {
            hour:
              Number(timedata.hour) +
              (timedata.period === "am" || timedata.period === "a.m"
                ? 0
                : timedata.period === "pm" ||
                  timedata.period === "p.m" ||
                  timedata.period === "noon"
                ? Number(timedata.hour) > 12
                  ? 12
                  : 0
                : 0),
            minutes: Number(timedata.minute),
          };
        }
      }
    }
    return { hour: 0, minutes: 0 };
  }

  static getStartEndTime(localCourses: Courses): TimeRange {
    let min = 24 * 60,
      max = -1;
    for (const [, course] of Object.entries(localCourses)) {
      for (const [, section] of Object.entries(course)) {
        for (const slot of section.timeslots) {
          if (slot.time.s < min) {
            min = slot.time.s;
          }
          if (slot.time.e > max) {
            max = slot.time.e;
          }
        }
      }
    }
    return { s: min, e: max };
  }

  static setTimeOffset(localCourses: Courses, offset: number): void {
    for (const [, course] of Object.entries(localCourses)) {
      for (const [, section] of Object.entries(course)) {
        for (const slot of section.timeslots) {
          slot.time.s += offset;
          slot.time.e += offset;
        }
      }
    }
  }

  // for converting
  static to_csv(localCourses: Courses): string {
    const data = [];
    data.push([
      "course_title",
      "section",
      "start_time",
      "end_time",
      "day",
      "room",
    ]);
    for (const c of XLSXParser.toXLSXJSON({ courses: localCourses })) {
      data.push([c.ctitle, c.stitle, c.time.s, c.time.e, c.day, c.room]);
    }
    return XLSXParser.makeCSV(data);
  }

  static to_lststr(localCourses: Courses): string {
    let data = `["course_title", "section", "start_time", "end_time", "day", "room"]\n`;
    for (const c of XLSXParser.toXLSXJSON({ courses: localCourses })) {
      data += `["${c.ctitle}", "${c.stitle}", "${c.time.s}", "${c.time.e}", "${c.day}", "${c.room}"]\n`;
    }
    return data;
  }

  /**
   * Function returns the content as a CSV string
   * See https://stackoverflow.com/a/20623188/64904
   * Parameter content:
   *   [
   *.     [header1, header2, ...],
   *.     [data1, data2, ...]
   *.     ...
   *.  ]
   * NB Does not support Date items
   */
  static makeCSV(content: (string | number)[][]): string {
    let csv = "";
    content.forEach((value) => {
      value.forEach((item, i) => {
        const innerValue = item === null ? "" : item.toString();
        let result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0) {
          result = '"' + result + '"';
        }
        if (i > 0) {
          csv += ",";
        }
        csv += result;
      });
      csv += "\n";
    });
    return csv;
  }
}
