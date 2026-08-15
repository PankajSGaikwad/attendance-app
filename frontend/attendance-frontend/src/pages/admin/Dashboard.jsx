import {
  Activity,
  ArrowUpRight,
  CalendarCheck2,
  Clock3,
  Users,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

function Dashboard() {
  const bars = [
    72, 84, 77, 91, 88,
    96, 82, 90, 86, 98,
    92, 95, 89, 94, 97,
    88, 91, 96, 99, 93,
  ];

  const attendanceRows = [
    [
      "Pankaj Gaikwad",
      "Engineering",
      "General",
      "09:03",
      "Present",
    ],
    [
      "Rahul Sharma",
      "Operations",
      "Morning",
      "09:11",
      "Late",
    ],
    [
      "Amit Patil",
      "Finance",
      "General",
      "08:57",
      "Present",
    ],
    [
      "Sneha Kulkarni",
      "HR",
      "General",
      "09:02",
      "Present",
    ],
  ];

  return (
    <div>

      <PageHeader
        eyebrow="MANAGEMENT OVERVIEW"
        title="Admin dashboard"
        description="Monitor workforce attendance and operational health."
      />

      {/* STATISTICS */}

      <div className="stats-grid">

        <StatCard
          label="Total employees"
          value="248"
          hint="+12 this month"
          icon={Users}
        />

        <StatCard
          label="Present today"
          value="231"
          hint="93.1% of workforce"
          icon={CalendarCheck2}
          tone="green"
        />

        <StatCard
          label="Late today"
          value="12"
          hint="4.8% of workforce"
          icon={Clock3}
          tone="violet"
        />

        <StatCard
          label="Attendance rate"
          value="94.7%"
          hint="+1.8% vs last month"
          icon={Activity}
          tone="cyan"
        />

      </div>

      {/* MAIN GRID */}

      <div className="dashboard-grid admin-grid">

        {/* ATTENDANCE CHART */}

        <section className="panel chart-panel">

          <div className="panel-title">

            <div>

              <div className="eyebrow">
                LAST 20 DAYS
              </div>

              <h2>
                Attendance trend
              </h2>

            </div>

            <span className="badge present">
              94.7%
            </span>

          </div>

          <div className="bar-chart">

            {bars.map((value, index) => (

              <div
                className="bar-wrap"
                key={index}
              >

                <div
                  className="bar"
                  style={{
                    height: `${value}%`,
                  }}
                />

              </div>

            ))}

          </div>

          <div className="chart-labels">

            <span>
              26 Jul
            </span>

            <span>
              05 Aug
            </span>

            <span>
              14 Aug
            </span>

          </div>

        </section>

        {/* TODAY'S PULSE */}

        <section className="panel">

          <div className="panel-title">

            <div>

              <div className="eyebrow">
                LIVE
              </div>

              <h2>
                Today's pulse
              </h2>

            </div>

            <span className="live-pill">
              <i />
              Live
            </span>

          </div>

          <div className="pulse-list">

            <div className="pulse-row">

              <span>
                <i className="dot green" />
                Present
              </span>

              <strong>
                231
              </strong>

            </div>

            <div className="pulse-row">

              <span>
                <i className="dot violet" />
                Late
              </span>

              <strong>
                12
              </strong>

            </div>

            <div className="pulse-row">

              <span>
                <i className="dot red" />
                Absent
              </span>

              <strong>
                5
              </strong>

            </div>

          </div>

          <button className="secondary-btn full">

            Open attendance

            <ArrowUpRight
              size={16}
            />

          </button>

        </section>

      </div>

      {/* ATTENDANCE TABLE */}

      <section className="panel table-panel">

        <div className="panel-title">

          <div>

            <div className="eyebrow">
              RECENT ACTIVITY
            </div>

            <h2>
              Today's attendance
            </h2>

          </div>

        </div>

        <div className="table-wrap">

          <table>

            <thead>

              <tr>

                <th>
                  Employee
                </th>

                <th>
                  Department
                </th>

                <th>
                  Shift
                </th>

                <th>
                  Time
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {attendanceRows.map(
                (row) => (

                  <tr key={row[0]}>

                    <td>
                      {row[0]}
                    </td>

                    <td>
                      {row[1]}
                    </td>

                    <td>
                      {row[2]}
                    </td>

                    <td>
                      {row[3]}
                    </td>

                    <td>

                      <span
                        className={`badge ${row[4].toLowerCase()}`}
                      >
                        {row[4]}
                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;