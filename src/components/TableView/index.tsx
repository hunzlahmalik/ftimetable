import React from "react";
import { Table } from "antd";
import { WeeklySchedule } from "../../modules/timetable/interfaces";

export function TableView(props: { timetable: WeeklySchedule }): JSX.Element {
  const { timetable } = props;

  const columns: string[] = Object.keys(Object.entries(timetable)[0][1]) || [];
  // const rowsHead: string[] = Object.keys(timetable) || [];

  const tableCols: {
    title: string;
    dataIndex: string;
    key: string;
    render?: any;
  }[] = [];

  for (const col of ["Day/Period", ...columns]) {
    tableCols.push({ title: col, dataIndex: col, key: col });
  }
  const data = [];

  for (const [day, daySchedule] of Object.entries(timetable)) {
    const row: any = {};
    row["Day/Period"] = day;
    for (const [time, course] of Object.entries(daySchedule)) {
      if (course) {
        row[time] = `${course.title} ${course.section} ${course.room}`;
      } else row[time] = "";
    }
    data.push(row);
  }

  return (
    <Table
      bordered={true}
      pagination={false}
      size="middle"
      columns={tableCols}
      dataSource={data}
    />
  );
}
