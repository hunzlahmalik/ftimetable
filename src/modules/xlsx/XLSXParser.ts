/**
 * @author Hunzlah Malik
 */

import { WorkSheet } from "xlsx/types";
import { XLSXUtils } from "./XLSXUtils";
import {
  ICOURSE_REGEX,
  IJSON,
  ICourseSection,
  WeekdaysEnum,
  Timeslot,
  IRoom,
  ITime,
  ITIME12_REGEX,
  ISection,
  IJSONOBJ,
} from "./interfaces";
import { COURSE_REGEX, TIME12_REGEX } from "./regex";
import { hourToMint, toWeekdays } from "./utils";

/**
 * Used for parsing and extracting data from XLSX docs
 * @class
 */
export class XLSXParser {
  coursesJSON: ICourseSection[] = [];
  courses: IJSON = {};

  constructor(
    private readonly ws: WorkSheet,
    private readonly skipRows: number = 3,
    private readonly periodRow: number = 2,
    private readonly periodTimeOffset: number | undefined = undefined
  ) {
    this.courses = this.parseCourses();
    this.coursesJSON = XLSXParser.toXLSXJSON({ courses: this.courses });
  }

  getCoursesTitle(): string[] {
    return Object.keys(this.courses);
  }

  getSectionsName(courseTitle: string): string[] {
    return courseTitle in this.courses
      ? Object.keys(this.courses[courseTitle])
      : [];
  }

  getSection(courseTitle: string, sectionName: string): ISection | undefined {
    return this.courses[courseTitle][sectionName] || undefined;
  }

  /**
   * Converts the xlsx sheet to JSON
   * @returns {IJSON} my type of JSON object
   */
  parseCourses(): IJSON {
    const localCourses: IJSON = {};

    // sheet to json
    let jsonObj = XLSXUtils.utils.sheet_to_json(this.ws, {
      header: 0,
      defval: null,
      blankrows: true,
    }) as Record<string, unknown>[];
    let periodTimeOffset = 0;
    if (!this.periodTimeOffset) {
      //getting the starting time
      const stime = this.getStartTime(jsonObj, this.periodRow);
      if (stime) {
        periodTimeOffset =
          hourToMint(stime) - hourToMint({ hour: 7, minutes: 0, is24: true });
        console.log(
          `stime=${JSON.stringify(stime)},periodTimeOffset=${periodTimeOffset}`
        );
      }
    }

    // getting the time
    const prow = this.getTimerow(jsonObj[this.periodRow - 1], periodTimeOffset); //periodRow-1 beacause the first row is header

    // removing the rows we don't need
    jsonObj.splice(0, this.skipRows);

    // recreating the json using new header
    jsonObj = XLSXUtils.utils.sheet_to_json(
      XLSXUtils.utils.json_to_sheet(jsonObj),
      { header: ["day", "room", ...prow.map(String)] }
    );

    /**
     * Correctly add the timeslot to timeslots
     * @param {Timeslot[]} timeslots - current timeslots list
     * @param {{day: WeekdaysEnum; room: IRoom; t: number}} newslot - day,room and time you want to add to current slots
     * @returns {Timeslot[]}
     */
    const correctTimeslots = (
      timeslots: Timeslot[],
      newslot: { day: WeekdaysEnum; room: IRoom; t: number }
    ): Timeslot[] => {
      for (const slot of timeslots) {
        if (JSON.stringify(slot) === JSON.stringify(newslot)) return timeslots;
        else if (
          slot.day === newslot.day &&
          slot.room.name === newslot.room.name
        ) {
          if (slot.time.s <= -1) slot.time.s = newslot.t - 10;
          if (slot.time.e === -1 || slot.time.e < newslot.t + 10)
            slot.time.e = newslot.t + 10;
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

    // converting the json to {IJSON}
    for (const row of jsonObj) {
      for (const [key, value] of Object.entries(row)) {
        if (typeof value !== "string") continue;
        if (COURSE_REGEX.test(value)) {
          // found the course
          const matches = value.match(COURSE_REGEX);
          if (matches && matches.groups) {
            // match found in course
            const cdata = matches.groups as unknown as ICOURSE_REGEX;
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
                    room: { name: String(row.room) },
                    t: Number(key) ? Number(key) : -1,
                  }
                );
              } else {
                // new course or data
                if (!(cdata.title in localCourses))
                  localCourses[cdata.title] = {}; // if new course
                localCourses[cdata.title][section] = {
                  title: cdata.title,
                  section: section,
                  timeslots: [
                    {
                      day: toWeekdays(row.day),
                      room: { name: String(row.room) },
                      time: {
                        s: Number(key) ? Number(key) - 10 : -1,
                        e: Number(key) ? Number(key) + 10 : -1,
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
   * @param {IJSON} courses
   * @returns {ICourseSection} list of courses
   */
  static toXLSXJSON(params: {
    courses?: IJSON;
    course?: IJSONOBJ;
    section?: ISection;
  }): ICourseSection[] {
    const lst: ICourseSection[] = [];
    if (params.courses) {
      for (const [, value] of Object.entries(params.courses)) {
        for (const [, section] of Object.entries(value)) {
          for (const slot of section.timeslots) {
            lst.push({
              title: section.title,
              section: section.section,
              time_start: slot.time.s,
              time_end: slot.time.e,
              day: slot.day,
              room: slot.room.name,
            });
          }
        }
      }
    }
    if (params.course) {
      for (const [, section] of Object.entries(params.course)) {
        for (const slot of section.timeslots) {
          lst.push({
            title: section.title,
            section: section.section,
            time_start: slot.time.s,
            time_end: slot.time.e,
            day: slot.day,
            room: slot.room.name,
          });
        }
      }
    }
    if (params.section) {
      for (const slot of params.section.timeslots) {
        lst.push({
          title: params.section.title,
          section: params.section.section,
          time_start: slot.time.s,
          time_end: slot.time.e,
          day: slot.day,
          room: slot.room.name,
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
   * @param {ICourseSection} obj 
   * @param {string} delimiter 
   * @returns {string}
   */
  static toStr(obj: ICourseSection, delimiter = ","): string {
    return (
      obj.title +
      delimiter +
      obj.section +
      delimiter +
      obj.time_start +
      delimiter +
      obj.time_end +
      delimiter +
      obj.day +
      delimiter +
      obj.room
    );
  }

  private getTimerow(
    periodRow: Record<string, unknown>,
    timeOffset: number
  ): number[] {
    const lst: number[] = [];
    let hour = 0;
    for (const [, value] of Object.entries(periodRow))
      if (typeof value === "number") {
        lst.push(value - timeOffset + hour * 60);
        if (value === 60) hour++; // incrementing time
      }
    return lst;
  }

  private getStartTime(
    data: Record<string, unknown>[],
    srow = 0
  ): ITime | undefined {
    for (let i = srow; i < data.length; i++) {
      for (const [, value] of Object.entries(data[i])) {
        if (typeof value !== "string" || !TIME12_REGEX.test(value)) continue;

        const matches = value.match(TIME12_REGEX);

        if (matches && matches.groups) {
          const timedata = matches.groups as unknown as ITIME12_REGEX;
          return {
            hour: Number(timedata.hour),
            minutes: Number(timedata.minute),
            is24: false,
            period:
              timedata.period == "am" || timedata.period == "a.m"
                ? "am"
                : timedata.period == "pm" || timedata.period == "p.m"
                ? "pm"
                : undefined,
          };
        }
      }
    }
  }
}
