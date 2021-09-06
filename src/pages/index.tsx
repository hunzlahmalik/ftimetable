import React from "react";
import { Button, Divider, InputNumber, Layout } from "antd";
import { XLSXParser } from "../modules/xlsx/XLSXParser";
import { XLSXUtils } from "../modules/xlsx/XLSXUtils";
import { XLSXInput } from "../components/XLSXInput";
import { CourseInput } from "../components/CourseInput";
import { SectionInput } from "../components/SectionInput";
import { Timetable } from "../modules/timetable/Timetable";
import { Courses } from "../modules/xlsx/interfaces";
import { WeeklySchedule } from "../modules/timetable/interfaces";
import { TableView } from "../components/TableView";
import { Header } from "antd/lib/layout/layout";
import { hourToMint } from "../modules/xlsx/utils";
import { WorkBook } from "xlsx/types";

export default function Home(): JSX.Element {
  const [file, setFile] = React.useState<Blob>();
  const [wb, setwb] = React.useState<WorkBook>();
  const [sheet, setSheet] = React.useState(0);
  const [sheets, setSheets] = React.useState(0);
  const [xlsxParser, setParser] = React.useState<XLSXParser>();
  const [coursesData, setCoursesData] = React.useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = React.useState<string[]>([]);
  const [finalTables, setFinalTables] = React.useState<WeeklySchedule[]>([]);
  const [selectedCourseSection, setSelectedCourseSection] = React.useState<{
    [course: string]: string[]; //sections agains course
  }>({});
  // const [table, setTable] = React.useState<WeeklySchedule>();

  React.useEffect(() => {
    if (xlsxParser) {
      setCoursesData(xlsxParser.getCoursesTitle());
      console.log(xlsxParser.getCoursesTitle().length);
    }
  }, [xlsxParser]);

  React.useEffect(() => {
    if (wb) {
      setSheets(wb.SheetNames.length);
      const ws = XLSXUtils.loadSheet({ wb: wb, sheet: sheet });
      XLSXUtils.fillMerges(ws);
      setParser(new XLSXParser(ws));
    }
  }, [sheet, wb]);

  const handleFile = (inputfile: Blob) => {
    setFile(inputfile);
    XLSXUtils.loadFile({ file: inputfile, wbHandler: setwb });
  };

  const handleCourses = (courses: string[]) => {
    console.log(courses);
    setSelectedCourses(courses);

    const difference = selectedCourses.filter((x) => !courses.includes(x));
    for (const diff of difference) {
      handleSections(diff, []);
    }
  };

  const handleSections = (course: string, sections: string[]) => {
    selectedCourseSection[course] = sections;
    setSelectedCourseSection(selectedCourseSection);
    console.log(selectedCourseSection);
  };

  const timetableGenerate = () => {
    const allcourses = xlsxParser?.data.courses;
    if (allcourses) {
      const selected: Courses = {};
      for (const [ctitle, sections] of Object.entries(selectedCourseSection)) {
        for (const section of sections) {
          if (!(ctitle in selected)) selected[ctitle] = {};
          selected[ctitle][section] = allcourses[ctitle][section];
        }
      }
      console.log(selected);
      const tables = Timetable.generate({
        wsJSON: [],
        courses: selected,
        tperiod: xlsxParser.data.tperiod,
        timings: xlsxParser.data.timings,
        days: xlsxParser.data.days,
        startEndTime: xlsxParser.data.startEndTime,
      });
      console.log(tables);
      setFinalTables(tables);
    }
  };

  return (
    <Layout className="outerPadding">
      <Header>FAST NUCE Timetable Generator</Header>
      <Layout className="container">
        <XLSXInput dataHandler={handleFile} />
        Sheet Number:
        <InputNumber
          min={0}
          max={sheets}
          defaultValue={0}
          onChange={setSheet}
        />
        <CourseInput data={coursesData} dataHandler={handleCourses} />
        {selectedCourses.map((course) => {
          return (
            <SectionInput
              key={course}
              course={course}
              data={xlsxParser ? xlsxParser.getSectionsName(course) : []}
              dataHandler={handleSections}
            />
          );
        })}
        <Button type="primary" size="middle" onClick={timetableGenerate}>
          Generate
        </Button>
        {finalTables.map((finalTable, index) => {
          return (
            <>
              <Divider />
              <TableView timetable={finalTable} data={xlsxParser?.data} />
            </>
          );
        })}
      </Layout>
    </Layout>
  );
}
