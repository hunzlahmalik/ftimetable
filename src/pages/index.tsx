import React from "react";
import { Button, Divider, InputNumber, Layout } from "antd";
import { XLSXParser } from "../modules/xlsx/XLSXParser";
import { XLSXUtils } from "../modules/xlsx/XLSXUtils";
import { XLSXInput } from "../components/XLSXInput";
import { CourseInput } from "../components/CourseInput";
import { SectionInput } from "../components/SectionInput";
import { Timetable } from "../modules/timetable/Timetable";
import { IJSON } from "../modules/xlsx/interfaces";
import { WeeklySchedule } from "../modules/timetable/interfaces";
import { TableView } from "../components/TableView";
import { Header } from "antd/lib/layout/layout";

export default function Home(): JSX.Element {
  const [file, setFile] = React.useState<Blob>();
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
    if (file) handleFile(file);
  }, [sheet]);
  const handleFile = (inputfile: Blob) => {
    setFile(inputfile);
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = async (e) => {
      if (!(e && e.target)) throw new Error("e.target is null!");

      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSXUtils.read(bstr, { type: rABS ? "binary" : "array" });
      /* Get first worksheet */
      setSheets(wb.SheetNames.length);
      const ws = wb.Sheets[wb.SheetNames[sheet]];
      // Merging the cells
      XLSXUtils.fillMerges(ws);
      setParser(new XLSXParser(ws));

      // setCoursesData(xlsxParser.getCoursesTitle());
      // console.log(xlsxParser.getCoursesTitle().length);
    };
    if (rABS) reader.readAsBinaryString(inputfile);
    else reader.readAsArrayBuffer(inputfile);
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
    const allcourses = xlsxParser?.courses;
    if (allcourses) {
      const selected: IJSON = {};
      for (const [ctitle, sections] of Object.entries(selectedCourseSection)) {
        for (const section of sections) {
          if (!(ctitle in selected)) selected[ctitle] = {};
          selected[ctitle][section] = allcourses[ctitle][section];
        }
      }
      console.log(selected);
      const tables = Timetable.generate(selected);
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
              <TableView
                key={index + Math.random() * 100}
                timetable={finalTable}
              />
            </>
          );
        })}
      </Layout>
    </Layout>
  );
}
