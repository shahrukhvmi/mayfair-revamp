"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Award,
  Check,
  ClipboardList,
  Flag,
  Scale,
  TrendingDown,
  TrendingUp,
  UserRound,
} from "lucide-react";

import GetBmiJourney from "@/api/GetBmiJourney";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";

/* =========================================================
   Helpers
========================================================= */

const kgToStonesPounds = (kg) => {
  if (!kg) {
    return {
      stones: 0,
      pounds: 0,
    };
  }

  const totalPounds = kg * 2.20462;
  const stones = Math.floor(totalPounds / 14);
  const pounds = Math.round(totalPounds % 14);

  return {
    stones,
    pounds,
  };
};

const getWeightByUnit = (item, unit) => {
  if (unit === "kg") {
    return Number(item.weight_kg);
  }

  if (item.weight_stones || item.weight_pounds) {
    return item.weight_stones * 14 + (item.weight_pounds ?? 0);
  }

  const { stones, pounds } = kgToStonesPounds(item.weight_kg);

  return stones * 14 + pounds;
};

const formatWeight = (value, unit) => {
  if (unit === "kg") {
    return `${value} kg`;
  }

  const stones = Math.floor(value / 14);
  const pounds = Math.round(value % 14);

  return `${stones} st ${pounds} lb`;
};

const getChangeMeta = (change) => {
  if (change > 0) {
    return {
      type: "gain",
      tone: "red",
      label: "Gained",
    };
  }

  if (change < 0) {
    return {
      type: "loss",
      tone: "green",
      label: "Lost",
    };
  }

  return {
    type: "same",
    tone: "gray",
    label: "No change",
  };
};

const getChangeDescription = (type) => {
  if (type === "loss") {
    return "Weight loss since your first record";
  }

  if (type === "gain") {
    return "Weight gain since your first record";
  }

  return "No weight change since your first record";
};

const prepareChartData = (journey, unit) =>
  journey.map((item) => ({
    date: item.order_date_readable,
    value: Number(item.weight_kg),

    label:
      unit === "kg"
        ? `${item.weight_kg} kg`
        : (() => {
            const { stones, pounds } =
              item.weight_stones || item.weight_pounds
                ? {
                    stones: item.weight_stones,
                    pounds: item.weight_pounds ?? 0,
                  }
                : kgToStonesPounds(item.weight_kg);

            return `${stones} st ${pounds} lb`;
          })(),
  }));

const calculateStats = (journey, unit) => {
  const values = journey.map((item) => getWeightByUnit(item, unit));

  return {
    start: values[0],

    current: values[values.length - 1],

    lowest: Math.min(...values),

    average: Number(
      (
        values.reduce((total, value) => total + value, 0) / values.length
      ).toFixed(1),
    ),
  };
};

const getUserDisplayName = (user) => {
  const firstName = user?.fname || user?.first_name || user?.firstName || "";

  const lastName = user?.lname || user?.last_name || user?.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user?.name || "Patient";
};

/* =========================================================
   Main page
========================================================= */

export default function WeightLossJourney() {
  const { authUserDetail } = useAuthUserDetailStore();

  const userId = authUserDetail?.id;

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState(null);

  const [unit, setUnit] = useState("kg");

  const getJourney = useMutation({
    mutationFn: (id) => GetBmiJourney(id),

    onSuccess: (response) => {
      setData(response?.data || []);
      setLoading(false);
    },

    onError: () => {
      toast.error("Failed to load journey");

      setLoading(false);
    },
  });

  useEffect(() => {
    if (userId) {
      getJourney.mutate(userId);
    }
  }, [userId]);

  if (loading) {
    return <JourneyLoader />;
  }

  if (!data?.bmi_journey?.length) {
    return <EmptyJourneyState />;
  }

  const { bmi_journey: bmiJourney } = data;

  const stats = calculateStats(bmiJourney, unit);

  const totalChange = stats.current - stats.start;

  const changeMeta = getChangeMeta(totalChange);

  const percentage = stats.start
    ? Math.abs((totalChange / stats.start) * 100).toFixed(1)
    : 0;

  const chartData = prepareChartData(bmiJourney, unit);

  const displayName = getUserDisplayName(authUserDetail);

  const displayEmail = authUserDetail?.email || "Not available";

  return (
    <main className="mont-reg-font min-w-0 flex-1 bg-[#f4f5fb] p-3 sm:p-4 lg:p-5 xl:p-6">
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4">
        {/* Header */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white px-5 py-6 shadow-[0_16px_42px_rgba(71,49,124,0.075)] sm:px-6 lg:px-7">
          <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[#47317c]/[0.06] blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mont-bold-font mb-2 text-[11px] uppercase tracking-[0.16em] text-[#47317c]">
                Progress tracking
              </p>

              <h1 className="mont-bold-font text-[28px] leading-tight tracking-[-0.04em] text-slate-950 sm:text-[32px]">
                Weight Loss Journey
              </h1>

              <p className="mont-reg-font mt-2.5 max-w-2xl text-[13px] leading-[1.7] text-slate-500 sm:text-[14px]">
                Review your recorded weight changes and track your progress
                throughout your treatment journey.
              </p>
            </div>

            {/* Account */}
            <div className="flex w-full min-w-0 items-center gap-3.5 rounded-[18px] border border-[#47317c]/10 bg-[#faf8fd] px-4 py-3.5 lg:w-[310px]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#47317c] text-white shadow-[0_8px_18px_rgba(71,49,124,0.2)]">
                <UserRound size={19} strokeWidth={2} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="mont-medium-font text-[10px] uppercase tracking-[0.12em] text-[#47317c]/55">
                  Logged in as
                </p>

                <p
                  title={displayEmail}
                  className="mont-reg-font mt-0.5 truncate text-[11px] leading-4 text-slate-500"
                >
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white p-4 shadow-[0_16px_42px_rgba(71,49,124,0.075)] sm:p-5 lg:p-6">
          {/* Section heading and units */}
          <div className="flex flex-col gap-4 border-b border-[#47317c]/[0.07] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#47317c]/[0.08] text-[#47317c]">
                <Scale size={20} strokeWidth={2} />
              </span>

              <div className="min-w-0">
                <h2 className="mont-bold-font text-[20px] leading-7 text-slate-950 sm:text-[23px]">
                  Progress overview
                </h2>

                <p className="mont-reg-font mt-0.5 text-[12px] leading-5 text-slate-500 sm:text-[13px]">
                  Your latest weight statistics and progression chart.
                </p>
              </div>
            </div>

            <UnitTabs unit={unit} setUnit={setUnit} />
          </div>

          {/* Statistics */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <JourneyStatCard
              title="Starting weight"
              value={formatWeight(stats.start, unit)}
              description="Your first recorded weight"
              badge="Baseline"
              icon={Flag}
            />

            <JourneyStatCard
              title="Current weight"
              value={formatWeight(stats.current, unit)}
              description="Your most recent weight"
              badge="Latest"
              icon={UserRound}
            />

            <JourneyStatCard
              title="Total change"
              value={
                changeMeta.type === "same"
                  ? formatWeight(0, unit)
                  : formatWeight(Math.abs(totalChange), unit)
              }
              description={getChangeDescription(changeMeta.type)}
              badge={changeMeta.type === "same" ? "0%" : `${percentage}%`}
              icon={TrendingDown}
              tone={changeMeta.tone}
              showMinus={changeMeta.type === "loss"}
            />

            <JourneyStatCard
              title="Total orders"
              value={bmiJourney.length}
              description="Recorded treatment orders"
              badge="Approved"
              icon={ClipboardList}
            />
          </div>

          {/* Chart */}
          <ChartCard unit={unit} journey={bmiJourney}>
            <div className="h-[320px] w-full sm:h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 15,
                    right: 15,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(71,49,124,0.09)"
                    strokeDasharray="4 4"
                  />

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={26}
                    tick={{
                      fill: "#64748b",
                      fontSize: 11,
                      fontFamily: "var(--mont-reg)",
                    }}
                    dy={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={64}
                    tickFormatter={(value) => {
                      if (unit === "kg") {
                        return `${value}`;
                      }

                      const { stones } = kgToStonesPounds(value);

                      return `${stones} st`;
                    }}
                    tick={{
                      fill: "#64748b",
                      fontSize: 11,
                      fontFamily: "var(--mont-reg)",
                    }}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "rgba(71,49,124,0.2)",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                    content={<JourneyTooltip unit={unit} />}
                  />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#47317c"
                    strokeWidth={3}
                    dot={{
                      r: 4.5,
                      fill: "#ffffff",
                      stroke: "#47317c",
                      strokeWidth: 2.5,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#47317c",
                      stroke: "#ffffff",
                      strokeWidth: 3,
                    }}
                    isAnimationActive
                    animationDuration={900}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   Unit tabs
========================================================= */

const UnitTabs = ({ unit, setUnit }) => {
  return (
    <div className="inline-flex w-full rounded-[14px] border border-[#47317c]/10 bg-[#f7f5fa] p-1 sm:w-auto">
      {[
        {
          value: "kg",
          label: "KG",
        },
        {
          value: "st",
          label: "St / Lb",
        },
      ].map((option) => {
        const isActive = unit === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setUnit(option.value)}
            className={`mont-medium-font min-h-[40px] flex-1 cursor-pointer rounded-[10px] px-5 py-2 text-[12px] transition-all duration-200 sm:flex-none ${
              isActive
                ? "bg-[#47317c] text-white shadow-[0_6px_16px_rgba(71,49,124,0.2)]"
                : "text-slate-500 hover:bg-white hover:text-[#47317c]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

/* =========================================================
   Statistic card
========================================================= */

const JourneyStatCard = ({
  title,
  value,
  description,
  badge,
  icon: Icon,
  tone = "default",
  showMinus = false,
}) => {
  const TrendIcon =
    tone === "green" ? TrendingDown : tone === "red" ? TrendingUp : Icon;

  const toneClasses = {
    default: {
      iconWrapper: "bg-[#47317c]/[0.08] text-[#47317c]",
      badge: "border-[#47317c]/10 bg-[#47317c]/[0.05] text-[#47317c]",
      value: "text-slate-950",
      border: "border-[#47317c]/10",
    },

    green: {
      iconWrapper: "bg-emerald-50 text-emerald-600",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      value: "text-emerald-600",
      border: "border-emerald-200",
    },

    red: {
      iconWrapper: "bg-red-50 text-red-600",
      badge: "border-red-200 bg-red-50 text-red-700",
      value: "text-red-600",
      border: "border-red-200",
    },

    gray: {
      iconWrapper: "bg-slate-100 text-slate-500",
      badge: "border-slate-200 bg-slate-100 text-slate-600",
      value: "text-slate-700",
      border: "border-slate-200",
    },
  };

  const styles = toneClasses[tone] || toneClasses.default;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className={`relative overflow-hidden rounded-[20px] border bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(71,49,124,0.08)] ${styles.border}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[#47317c]/[0.035] blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${styles.iconWrapper}`}
        >
          <TrendIcon size={20} strokeWidth={2} />
        </span>

        {badge && (
          <span
            className={`mont-medium-font inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] ${styles.badge}`}
          >
            <Check size={13} strokeWidth={2.5} />

            {badge}
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <p className="mont-medium-font text-[10px] uppercase tracking-[0.12em] text-slate-400">
          {title}
        </p>

        <p
          className={`mont-bold-font mt-2 text-[23px] leading-tight tracking-[-0.03em] sm:text-[25px] ${styles.value}`}
        >
          {showMinus ? "−" : ""}
          {value}
        </p>

        <p className="mont-reg-font mt-2.5 text-[11.5px] leading-[1.65] text-slate-500">
          {description}
        </p>
      </div>
    </motion.article>
  );
};

/* =========================================================
   Chart
========================================================= */

const ChartCard = ({ unit, journey, children }) => {
  return (
    <div className="mt-5 overflow-hidden rounded-[22px] border border-[#47317c]/10 bg-white">
      <div className="flex flex-col gap-3 border-b border-[#47317c]/[0.07] bg-[#faf9fc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#47317c] text-white shadow-[0_7px_16px_rgba(71,49,124,0.18)]">
            <TrendingDown size={18} strokeWidth={2} />
          </span>

          <div>
            <h3 className="mont-bold-font text-[17px] text-slate-950">
              Weight progression
            </h3>

            <p className="mont-reg-font mt-0.5 text-[11.5px] leading-5 text-slate-500">
              Changes across your recorded treatment orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-[11px] border border-[#47317c]/10 bg-white px-3 py-2">
          <Award size={15} strokeWidth={2} className="text-[#47317c]" />

          <span className="mont-medium-font text-[11px] text-slate-600">
            {journey.length} records ·{" "}
            {unit === "kg" ? "Kilograms" : "Stones / Pounds"}
          </span>
        </div>
      </div>

      <div className="px-2 pb-4 pt-5 sm:px-5">{children}</div>
    </div>
  );
};

const JourneyTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const item = payload[0]?.payload;

  return (
    <div className="min-w-[150px] rounded-[13px] border border-[#47317c]/10 bg-white px-3.5 py-3 shadow-[0_12px_30px_rgba(71,49,124,0.14)]">
      <p className="mont-medium-font text-[10px] uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p className="mont-bold-font mt-1.5 text-[14px] text-[#47317c]">
        {unit === "kg" ? `${item?.value} kg` : item?.label}
      </p>
    </div>
  );
};

/* =========================================================
   Loading state
========================================================= */

const JourneyLoader = () => {
  return (
    <main className="min-w-0 flex-1 bg-[#f4f5fb] p-3 sm:p-4 lg:p-5 xl:p-6">
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4">
        <div className="animate-pulse rounded-[26px] border border-[#47317c]/10 bg-white p-6">
          <div className="h-4 w-32 rounded-full bg-[#47317c]/[0.07]" />

          <div className="mt-4 h-9 w-80 max-w-full rounded-full bg-[#47317c]/[0.07]" />

          <div className="mt-3 h-4 w-[460px] max-w-full rounded-full bg-[#47317c]/[0.06]" />

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[178px] rounded-[20px] bg-[#47317c]/[0.05]"
              />
            ))}
          </div>
        </div>

        <div className="animate-pulse rounded-[26px] border border-[#47317c]/10 bg-white p-6">
          <div className="h-[390px] rounded-[22px] bg-[#47317c]/[0.05]" />
        </div>
      </div>
    </main>
  );
};

/* =========================================================
   Empty state
========================================================= */

const EmptyJourneyState = () => {
  return (
    <main className="mont-reg-font min-w-0 flex-1 bg-[#f4f5fb] p-3 sm:p-4 lg:p-5 xl:p-6">
      <div className="mx-auto w-full max-w-[1560px]">
        <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[26px] border border-[#47317c]/10 bg-white px-5 text-center shadow-[0_16px_42px_rgba(71,49,124,0.07)]">
          <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#47317c]/[0.08] text-[#47317c]">
            <Scale size={28} strokeWidth={1.9} />
          </span>

          <h2 className="mont-bold-font mt-5 text-[22px] text-slate-950">
            No weight progression yet
          </h2>

          <p className="mont-reg-font mt-2 max-w-md text-[13px] leading-6 text-slate-500">
            Your weight loss journey will appear here once weight tracking
            starts with your treatment orders.
          </p>
        </div>
      </div>
    </main>
  );
};
