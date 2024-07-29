import React from "react";
import "./TimeLine.css";
import {
  formatTime,
  formatDuration,
  parseTime,
  calculatePercentage,
} from "./utils";

const totalHours = 24;

interface Segment {
  type: "working" | "non-working";
  startPercent: number;
  widthPercent: number;
  tooltip: string;
  status?: string;
}

interface WorkingHour {
  start: string;
  end: string;
  title: string;
  status?: string;
}

interface TimeLineProps {
  workingHours: WorkingHour[];
  breakpoint?: "md" | "lg";
  workingColor?: string;
  nonWorkingColor?: string;
  height?: string;
  borderRadius?: string;
  timeFormat?: "12h" | "24h";
  notWorkingCaption?: string;
  renderTooltip?: (segment: Segment) => React.ReactNode;
}

const TimeLine = ({
  workingHours,
  breakpoint = "lg",
  workingColor = "#76c7c0",
  nonWorkingColor = "#e0e0e0",
  height = "40px",
  borderRadius = "12px",
  timeFormat = "12h",
  notWorkingCaption = "Not working at this time ",
  renderTooltip,
}: TimeLineProps) => {
  const allSegments: Segment[] = [];
  let previousEnd = 0;

  if (!workingHours || workingHours.length === 0) {
    return (
      <div className="timeline-container">
        <div
          className="timeline"
          style={{
            height,
            borderRadius,
            backgroundColor: nonWorkingColor,
          }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <div
            className="segment"
            style={{
              height,
              backgroundColor: nonWorkingColor,
            }}
          >
            <div className="tooltip">{notWorkingCaption}</div>
            <span>{notWorkingCaption}</span>
          </div>
        </div>
      </div>
    );
  }

  workingHours
    .sort((a, b) => parseTime(a.start) - parseTime(b.start))
    .forEach((shift) => {
      const startPercent = (parseTime(shift.start) / totalHours) * 100;
      const widthPercent = calculatePercentage(shift.start, shift.end);

      if (startPercent > previousEnd) {
        const nonWorkingDuration =
          (startPercent - previousEnd) * (totalHours / 100) * 60;
        allSegments.push({
          type: "non-working",
          startPercent: previousEnd,
          widthPercent: startPercent - previousEnd,
          tooltip: `${notWorkingCaption} (${formatDuration(
            nonWorkingDuration
          )})`,
        });
      }

      allSegments.push({
        type: "working",
        status: shift.status,
        startPercent,
        widthPercent,
        tooltip: `${formatTime(shift.start, timeFormat)} - ${formatTime(
          shift.end,
          timeFormat
        )}: ${shift.title}`,
      });

      previousEnd = startPercent + widthPercent;
    });

  if (previousEnd < 100) {
    const nonWorkingDuration = (100 - previousEnd) * (totalHours / 100) * 60;
    allSegments.push({
      type: "non-working",
      startPercent: previousEnd,
      widthPercent: 100 - previousEnd,
      tooltip: `${notWorkingCaption} (${formatDuration(nonWorkingDuration)})`,
    });
  }

  const intervalHours = breakpoint === "md" ? 4 : 2;
  const intervals = Array.from(
    { length: totalHours / intervalHours + 1 },
    (_, i) => i * intervalHours
  ).slice(1, -1);

  return (
    <div className="timeline-container">
      <div
        className="timeline"
        style={{
          height,
          borderRadius,
          backgroundColor: nonWorkingColor,
        }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={allSegments.length ? allSegments[0].startPercent : 0}
      >
        {allSegments.map((segment, index) => (
          <div
            key={index}
            className="segment"
            style={{
              left: `${segment.startPercent}%`,
              width: `${segment.widthPercent}%`,
              backgroundColor:
                segment.type === "working" ? workingColor : "transparent",
                zIndex: segment.type === "working" ? 10 : "auto",
            }}
            data-tooltip={segment.tooltip}
          >
            {renderTooltip ? (
              <div className="tooltip">{renderTooltip(segment)}</div>
            ) : (
              <div className="tooltip tooltip-d">{segment.tooltip}</div>
            )}
          </div>
        ))}
        {intervals.map((interval) => (
          <React.Fragment key={interval}>
            <div
              className="interval"
              style={{
                left: `${(interval / totalHours) * 100}%`,
                height,
              }}
              aria-hidden="true"
            >
              <span className="interval-label">
                {formatTime(
                  `${String(interval).padStart(2, "0")}:00`,
                  timeFormat
                )}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimeLine;
