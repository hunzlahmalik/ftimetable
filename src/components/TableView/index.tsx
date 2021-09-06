import React from "react";
import { Table } from "antd";
import { WeeklySchedule } from "../../modules/timetable/interfaces";
import { mintToStr } from "../../modules/xlsx/utils";
import { XData } from "../../modules/xlsx/interfaces";

export function TableView(props: {
  timetable: WeeklySchedule;
  data?: XData;
}): JSX.Element {
  const { timetable, data } = props;
  if (data) {
    const { timings } = data;

    const columns: string[] = [];
    for (const time of timings) {
      columns.push(`${mintToStr(time.s)}-${mintToStr(time.e)}`);
    }
    console.log(`timings=${JSON.stringify(timings)}`);
    console.log(`columns=${columns}`);

    const tableCols: {
      title: string;
      dataIndex: string;
      key: string;
      render?: any;
    }[] = [];

    for (const col of ["Day/Period", ...columns]) {
      tableCols.push({ title: col, dataIndex: col, key: col });
    }
    const tabledata = [];

    for (const [day, daySchedule] of Object.entries(timetable)) {
      const row: any = {};
      row["Day/Period"] = day;
      for (const [time, course] of Object.entries(daySchedule)) {
        if (course) {
          row[
            columns[Object.keys(daySchedule).indexOf(time)]
          ] = `${course.ctitle} ${course.stitle} ${course.room}`;
        } else row[time] = "";
      }
      tabledata.push(row);
    }

    return (
      <Table
        bordered={true}
        pagination={false}
        size="middle"
        columns={tableCols}
        dataSource={tabledata}
      />
    );
  }

  return (
    <Table
      bordered={true}
      pagination={false}
      size="middle"
      columns={[]}
      dataSource={[]}
    />
  );
}
