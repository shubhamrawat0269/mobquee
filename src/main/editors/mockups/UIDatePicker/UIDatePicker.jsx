import React from "react";
import "./UIDatePickerStyle.css";

export default function UIDatePicker(props) {
  const uiData = props.data;

  const border = 10;
  const containerWidth = parseInt(uiData.frame.width) - 0.25 * border;
  const containerHeight = parseInt(uiData.frame.height) - 0.25 * border;

  const monthArray = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let showDate =
    uiData.mode === "Date" || uiData.mode === "DateAndTime"
      ? "table-cell"
      : "none";
  let showTime =
    uiData.mode === "Time" || uiData.mode === "DateAndTime"
      ? "table-cell"
      : "none";
  let showAMPM =
    showTime !== "none" && uiData.timeFormat === "12 Hour"
      ? "table-cell"
      : "none";

  var currentDate = new Date();
  const year = currentDate.getFullYear();
  let date = currentDate.getDate();
  if (date < 10) date = "0" + date;
  let month = currentDate.getMonth();
  month = monthArray[month];
  let hour = currentDate.getHours();
  if (hour < 10) hour = "0" + hour;
  let minute = currentDate.getMinutes();
  if (minute < 10) minute = "0" + minute;

  const ampm = hour >= 12 && minute > 0 ? "PM" : "AM";

  return (
    <section
      id="datepicker"
      className="date-picker-section"
      style={{ height: `calc(${containerHeight}px)`, width: containerWidth }}
    >
      <h4 id="year" className="date-picker-label" style={{ display: showDate }}>
        {year}
      </h4>
      <h4
        id="month"
        className="date-picker-label"
        style={{ display: showDate }}
      >
        {month}
      </h4>
      <h4 id="date" className="date-picker-label" style={{ display: showDate }}>
        {date}
      </h4>
      <h4 id="hour" className="date-picker-label" style={{ display: showTime }}>
        {hour}
      </h4>
      <h4
        id="minute"
        className="date-picker-label"
        style={{ display: showTime }}
      >
        {minute}
      </h4>
      <h4 id="ampm" className="date-picker-label" style={{ display: showAMPM }}>
        {ampm}
      </h4>
    </section>
  );
}
