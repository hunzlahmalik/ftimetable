import { WeekdaysEnumEN } from "../xlsx/interfaces";
import { WeeklySchedule } from "./interfaces";

export function newSchedule(): WeeklySchedule {
  return {
    [WeekdaysEnumEN.Monday]: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
    },
    [WeekdaysEnumEN.Tuesday]: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
    },
    [WeekdaysEnumEN.Wednesday]: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
    },
    [WeekdaysEnumEN.Thursday]: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
    },
    [WeekdaysEnumEN.Friday]: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
    },
    [WeekdaysEnumEN.Saturday]: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
    },
  };
}
