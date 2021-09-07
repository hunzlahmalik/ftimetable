import React from "react";
import { PageHeader, Button, Divider, InputNumber, Layout, Row } from "antd";
import { XLSXParser } from "../modules/xlsx/XLSXParser";
import { XLSXUtils } from "../modules/xlsx/XLSXUtils";
import { XLSXInput } from "../components/XLSXInput";
import { CourseInput } from "../components/CourseInput";
import { SectionInput } from "../components/SectionInput";
import { Timetable } from "../modules/timetable/Timetable";
import { Courses, XData } from "../modules/xlsx/interfaces";
import { WeeklySchedule } from "../modules/timetable/interfaces";
import { TableView } from "../components/TableView";
import { WorkBook } from "xlsx/types";
import { Convert } from "../components/Convert";
import ReactDOM from "react-dom";

export default function Home(): JSX.Element {
  const [showConverter, setShowConverter] = React.useState(false);
  const [file, setFile] = React.useState<Blob>();
  const [wb, setwb] = React.useState<WorkBook>();
  const [sheet, setSheet] = React.useState(0);
  const [sheets, setSheets] = React.useState(0);
  const [xlsxParser, setParser] = React.useState<XLSXParser>();
  const [xdata, setxData] = React.useState<XData>();
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
      setxData(xlsxParser.data);
    }
  }, [xlsxParser]);

  React.useEffect(() => {
    if (wb) {
      setSheets(wb.SheetNames.length);
      const ws = XLSXUtils.loadSheet({ wb: wb, sheet: sheet });
      XLSXUtils.fillMerges(ws);
      setParser(new XLSXParser(ws));
      if (xlsxParser) setxData(xlsxParser.data);
    }
  }, [sheet, wb]);

  React.useEffect(() => {
    if (xlsxParser) setxData(xlsxParser.data);
  }, [xlsxParser, xlsxParser?.data]);

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
      setxData(xlsxParser.data);
    }
  };

  return (
    <Layout className="outerPadding">
      <br></br>
      <h3 style={{ textAlign: "center" }}>
        Help each other in righteousness and piety, and do not help each other
        in sin and aggression.
        <a href="https://quran.com/5/2">Surah Al-Ma&apos;idah Verse 2</a>
      </h3>
      <PageHeader
        style={{ textAlign: "center" }}
        className="site-page-header"
        title="FAST NUCE Timetable Generator"
      />
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
        <Row>
          <Button type="primary" size="middle" onClick={timetableGenerate}>
            Generate
          </Button>
          <Divider type="vertical" />
          <Button
            type="primary"
            size="middle"
            onClick={() => {
              setShowConverter(true);
            }}
          >
            Converter
          </Button>
          {showConverter ? <Convert courses={xdata} /> : ""}
        </Row>
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
