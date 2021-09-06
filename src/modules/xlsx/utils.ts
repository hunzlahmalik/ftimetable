import { Time24, WeekdaysEnum, Range, TIME24_R } from "./interfaces";
import { TIME24_REGEX } from "./regex";

export function mintToHour(tminutes: number): Time24 {
  const hours = Math.floor(tminutes / 60);
  const minutes = tminutes % 60;
  return {
    hour: hours,
    minutes: minutes,
  };
}

export function hourToMint(time: Time24): number {
  return time.hour * 60 + time.minutes;
}

export function timeToStr(time: Time24): string {
  return `${time.hour < 10 ? 0 : ""}${time.hour}:${time.minutes < 10 ? 0 : ""}${
    time.minutes
  }`;
}

export function strToMint(time: string): number {
  if (TIME24_REGEX.test(time)) {
    const matches = time.match(TIME24_REGEX);
    if (matches && matches.groups) {
      const tdata = matches.groups as unknown as TIME24_R;
      return Number(tdata.hour) * 60 + Number(tdata.minute);
    }
  }
  return -1;
}

export function mintToStr(time: number): string {
  return timeToStr(mintToHour(time));
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

export function isOverlap(timeA: Range<number>, timeB: Range<number>): boolean {
  return (
    timeB.s <= timeA.s &&
    timeB.s >= timeA.e &&
    timeB.e <= timeA.s &&
    timeB.e >= timeA.e
  );
}
