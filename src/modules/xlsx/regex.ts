/*
Some distinct examples from the timetable

Course:
Big Data Analytics / Mining Massive Datasets (MDS-2A) ✓																
Web Programming (BCS-8A) ✓							
Web Programming (BCS-6A) ✓		
Differential Equations (Cal II) (BSE-2A) ✓
Object Oriented Programming Lab (BSE-2A1, BSE-2A2)	✓	
Data Structures Lab (BCS-4H1 & BCS-4H2)	✓										

Reserved for EE Department							X
Reserved for FAST School of Management	X

Rooms:
Mostly in 2nd/3rd Column
*/

export const COURSE_REGEX =
  /^(?<full>(?<title>[\d\w\s]+.*)[\ \t]+?(?:\((?<sections>[B|M][\d\w\-\,\&\ ]+)\)))/m;

export const DAY_REGEX =
  /\b((mon|tues|wed(nes)?|thur(s)?|fri|sat(ur)?|sun)(day)?)\b/i;

export const TIME12_REGEX =
  /(?<full>(?<hour>(?:[0-9])|(?:0[1-9])|(?:1[0-2])):(?<minute>(?:[0-5])(?:[0-9]))\s(?<period>(?:(?:A|P)\.*M)|(?:noon)))/i;

export const TIME24_REGEX =
  /(?<full>(?<hour>(?:[0-9])|(?:0[0-9])|(?:1[0-9])|(?:2[0-3])):(?<minute>(?:[0-5])(?:[0-9])))/i;
