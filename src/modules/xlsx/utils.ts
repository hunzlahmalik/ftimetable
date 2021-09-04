import { ITime, WeekdaysEnum, IRange, ITIME24_REGEX } from "./interfaces";
import { TIME24_REGEX } from "./regex";

export function mintToHour(
  tminutes: number,
  format: "12" | "24" = "24"
): ITime {
  const hours = Math.floor(tminutes / 60);
  const minutes = tminutes % 60;
  return {
    hour: format === "24" ? hours : hours > 12 ? hours - 12 : hours,
    minutes: minutes,
    is24: format === "24",
    period: format === "12" ? (hours >= 12 ? "pm" : "am") : undefined,
  };
}

export function hourToMint(time: ITime): number {
  return (
    time.hour * 60 +
    time.minutes +
    (time.is24 && time.period == "pm" ? 12 * 60 : 0)
  );
}

export function timeToStr(time: ITime): string {
  return `${time.hour < 10 ? 0 : ""}${time.hour}:${time.minutes < 10 ? 0 : ""}${
    time.minutes
  }${time.is24 ? "" : " "}${
    time.is24 ? "" : time.period !== undefined ? time.period : ""
  }`;
}

export function strToMints(time: string): number {
  if (TIME24_REGEX.test(time)) {
    const matches = time.match(TIME24_REGEX);
    if (matches && matches.groups) {
      const tdata = matches.groups as unknown as ITIME24_REGEX;
      return Number(tdata.hour) * 60 + Number(tdata.minute);
    }
  }
  return -1;
}

/**
 * String day to number
 * @example
 * // returns 0
 * toWeekdays("  Monday askd aaudaskd")
 * // returns 3
 * toWeekdays("  Wednesday askd aaudaskd")
 * // returns 7
 * toWeekdays("  asdfjkasfaknk")
 * @param {string|unknown} str - day string to convert to number
 * @returns number of day
 */
export function toWeekdays(str: string | unknown): WeekdaysEnum {
  if (typeof str !== "string") return WeekdaysEnum.Unknown;
  const e: WeekdaysEnum | undefined =
    WeekdaysEnum[str.trim().split(/\s+/)[0] as keyof typeof WeekdaysEnum];
  return e !== undefined ? e : WeekdaysEnum.Unknown;
}

/**
 * day number to string
 * @example
 * // returns Monday
 * weekdaysToStr(0)
 * // returns Wednesday
 * weekdaysToStr(3)
 * // returns Wednesday
 * weekdaysToStr(WeekdaysEnum.Wednesday)
 * // returns Unknown
 * toWeekdays(7)
 * @param {number} e - number to convert to day string
 * @returns string of day
 */
export function weekdaysToStr(e: WeekdaysEnum): string {
  return WeekdaysEnum[e] !== undefined
    ? WeekdaysEnum[e]
    : WeekdaysEnum[WeekdaysEnum.Unknown];
}

export function isOverlap(
  timeA: IRange<number>,
  timeB: IRange<number>
): boolean {
  return (
    timeB.s <= timeA.s &&
    timeB.s >= timeA.e &&
    timeB.e <= timeA.s &&
    timeB.e >= timeA.e
  );
}
