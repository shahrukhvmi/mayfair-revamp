"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
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
  ClipboardList,
  Flag,
  Scale,
  TrendingDown,
  TrendingUp,
  UserRound,
} from "lucide-react";

import GetBmiJourney from "@/api/GetBmiJourney";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useSignupStore from "@/store/signupStore";
import { PageHeader } from "@/Components/Dashboard/MyAccount/MyAccount";

/* ── Helpers ── */
const kgToStonesPounds = (kg) => {
  if (!kg) return { stones: 0, pounds: 0 };
  const totalPounds = kg * 2.20462;
  return { stones: Math.floor(totalPounds / 14), pounds: Math.round(totalPounds % 14) };
};

const getWeightByUnit = (item, unit) => {
  if (unit === "kg") return Number(item.weight_kg);
  if (item.weight_stones || item.weight_pounds) return item.weight_stones * 14 + (item.weight_pounds ?? 0);
  const { stones, pounds } = kgToStonesPounds(item.weight_kg);
  return stones * 14 + pounds;
};

const formatWeight = (value, unit) => {
  if (unit === "kg") return `${value} kg`;
  return `${Math.floor(value / 14)} st ${Math.round(value % 14)} lb`;
};

const getChangeMeta = (change) => {
  if (change > 0) return { type: "gain", tone: "red",   label: "Gained" };
  if (change < 0) return { type: "loss", tone: "green", label: "Lost" };
  return          { type: "same", tone: "gray",  label: "No change" };
};

const getChangeDescription = (type) => {
  if (type === "loss") return "Weight loss since your first record";
  if (type === "gain") return "Weight gain since your first record";
  return "No weight change since your first record";
};

const prepareChartData = (journey, unit) =>
  journey.map((item) => ({
    date: item.order_date_readable,
    value: Number(item.weight_kg),
    label: unit === "kg"
      ? `${item.weight_kg} kg`
      : (() => {
          const { stones, pounds } = item.weight_stones || item.weight_pounds
            ? { stones: item.weight_stones, pounds: item.weight_pounds ?? 0 }
            : kgToStonesPounds(item.weight_kg);
          return `${stones} st ${pounds} lb`;
        })(),
  }));

const calculateStats = (journey, unit) => {
  const values = journey.map((item) => getWeightByUnit(item, unit));
  return {
    start:   values[0],
    current: values[values.length - 1],
    lowest:  Math.min(...values),
    average: Number((values.reduce((t, v) => t + v, 0) / values.length).toFixed(1)),
  };
};

const getUserDisplayName = (user) => {
  const full = `${user?.fname || ""} ${user?.lname || ""}`.trim();
  return full || user?.name || "Patient";
};

/* ── Main ── */
export default function WeightLossJourney() {
  const { authUserDetail } = useAuthUserDetailStore();
  const { firstName } = useSignupStore();
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState(null);
  const [unit, setUnit]       = useState("kg");

  const getJourney = useMutation({
    mutationFn: (id) => GetBmiJourney(id),
    onSuccess:  (res) => { setData(res?.data || []); setLoading(false); },
    onError:    ()    => { toast.error("Failed to load journey"); setLoading(false); },
  });

  useEffect(() => { if (authUserDetail?.id) getJourney.mutate(authUserDetail.id); }, [authUserDetail?.id]);

  if (loading)                  return <JourneyLoader />;
  if (!data?.bmi_journey?.length) return <EmptyJourneyState />;

  const { bmi_journey: bmiJourney } = data;
  const stats       = calculateStats(bmiJourney, unit);
  const totalChange = stats.current - stats.start;
  const changeMeta  = getChangeMeta(totalChange);
  const percentage  = stats.start ? Math.abs((totalChange / stats.start) * 100).toFixed(1) : 0;
  const chartData   = prepareChartData(bmiJourney, unit);
  const displayName = authUserDetail?.fname?.trim() || firstName?.trim() || "Patient";

  return (
    <main className="inter-reg-font min-w-0 flex-1 bg-[#FBFBFD]">
      <div className="mx-auto flex w-full  flex-col gap-6 p-4 sm:p-5 lg:p-6 2xl:p-8 2xl:gap-8">

        {/* Header */}
        <PageHeader
          label="Weight Loss Journey"
          title={`${displayName}'s Progress`}
          subtitle="Review your recorded weight changes and track your progress throughout your treatment."
        />

        {/* Content card */}
        <section className="rounded-2xl border border-slate-200 bg-white">

          {/* Section heading + unit toggle */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between lg:p-5 2xl:p-6">
            <div>
              <h2 className="inter-bold-font text-[16px] lg:text-[17px] 2xl:text-[20px] text-slate-900">Progress overview</h2>
              <p className="inter-reg-font mt-0.5 text-[12px] 2xl:text-[13px] text-slate-500">Your weight statistics and progression chart.</p>
            </div>
            <UnitTabs unit={unit} setUnit={setUnit} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 lg:p-5 2xl:p-6 2xl:gap-4">
            <StatCard title="Starting weight"  value={formatWeight(stats.start, unit)}   description="Your first recorded weight"       badge="Baseline" icon={Flag}         />
            <StatCard title="Current weight"   value={formatWeight(stats.current, unit)} description="Your most recent weight"          badge="Latest"   icon={UserRound}    />
            <StatCard
              title="Total change"
              value={changeMeta.type === "same" ? formatWeight(0, unit) : formatWeight(Math.abs(totalChange), unit)}
              description={getChangeDescription(changeMeta.type)}
              badge={changeMeta.type === "same" ? "0%" : `${percentage}%`}
              icon={TrendingDown}
              tone={changeMeta.tone}
              showMinus={changeMeta.type === "loss"}
            />
            <StatCard title="Total orders"     value={bmiJourney.length}                description="Recorded treatment orders"       badge="Approved" icon={ClipboardList} />
          </div>

          {/* Chart */}
          <div className="mx-4 mb-4 overflow-hidden rounded-xl border border-slate-100 lg:mx-5 lg:mb-5 2xl:mx-6 2xl:mb-6">
            <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#47317c] text-white">
                  <TrendingDown size={15} strokeWidth={2} />
                </span>
                <div>
                  <h3 className="inter-bold-font text-[14px] 2xl:text-[15px] text-slate-900">Weight progression</h3>
                  <p className="inter-reg-font text-[11.5px] text-slate-500">Changes across your recorded treatment orders.</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                <Award size={13} strokeWidth={2} className="text-[#47317c]" />
                <span className="inter-medium-font text-[11.5px] text-slate-600">
                  {bmiJourney.length} records · {unit === "kg" ? "Kilograms" : "Stones / Pounds"}
                </span>
              </div>
            </div>
            <div className="px-2 pb-4 pt-5 sm:px-4">
              <div className="h-[300px] w-full sm:h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" strokeDasharray="4 4" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={26}
                      tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "var(--inter-reg)" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} width={60}
                      tickFormatter={(v) => unit === "kg" ? `${v}` : `${kgToStonesPounds(v).stones} st`}
                      tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "var(--inter-reg)" }} />
                    <Tooltip
                      cursor={{ stroke: "rgba(71,49,124,0.15)", strokeWidth: 1, strokeDasharray: "4 4" }}
                      content={<JourneyTooltip unit={unit} />}
                    />
                    <Line type="monotone" dataKey="value" stroke="#47317c" strokeWidth={2.5}
                      dot={{ r: 4, fill: "#fff", stroke: "#47317c", strokeWidth: 2.5 }}
                      activeDot={{ r: 6, fill: "#47317c", stroke: "#fff", strokeWidth: 2.5 }}
                      isAnimationActive animationDuration={800}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}

/* ── Unit Tabs ── */
const UnitTabs = ({ unit, setUnit }) => (
  <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
    {[{ value: "kg", label: "KG" }, { value: "st", label: "St / Lb" }].map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => setUnit(opt.value)}
        className={`inter-medium-font min-h-[34px] flex-1 cursor-pointer rounded-lg px-4 text-[12px] transition-all duration-150 sm:flex-none
          ${unit === opt.value
            ? "bg-[#47317c]/[0.09] text-[#47317c]"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

/* ── Stat Card ── */
const toneMap = {
  default: { icon: "bg-[#47317c]/[0.08] text-[#47317c]", badge: "border-[#47317c]/10 bg-[#47317c]/[0.05] text-[#47317c]", value: "text-slate-900", border: "border-slate-200" },
  green:   { icon: "bg-emerald-50 text-emerald-600",       badge: "border-emerald-200 bg-emerald-50 text-emerald-700",       value: "text-emerald-600", border: "border-emerald-200" },
  red:     { icon: "bg-red-50 text-red-500",                badge: "border-red-200 bg-red-50 text-red-600",                   value: "text-red-500",    border: "border-red-200" },
  gray:    { icon: "bg-slate-100 text-slate-500",           badge: "border-slate-200 bg-slate-100 text-slate-600",            value: "text-slate-700",  border: "border-slate-200" },
};

const StatCard = ({ title, value, description, badge, icon: Icon, tone = "default", showMinus = false }) => {
  const TrendIcon = tone === "green" ? TrendingDown : tone === "red" ? TrendingUp : Icon;
  const s = toneMap[tone] || toneMap.default;
  return (
    <article className={`rounded-xl border bg-white p-4 2xl:p-5 ${s.border}`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.icon}`}>
          <TrendIcon size={17} strokeWidth={2} />
        </span>
        {badge && (
          <span className={`inter-medium-font inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] ${s.badge}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="inter-medium-font text-[10px] uppercase tracking-[0.12em] text-slate-400">{title}</p>
        <p className={`inter-bold-font mt-1.5 text-[21px] 2xl:text-[24px] leading-tight tracking-[-0.02em] ${s.value}`}>
          {showMinus ? "−" : ""}{value}
        </p>
        <p className="inter-reg-font mt-1.5 text-[11.5px] 2xl:text-[12.5px] leading-snug text-slate-500">{description}</p>
      </div>
    </article>
  );
};

/* ── Tooltip ── */
const JourneyTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="min-w-[140px] rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <p className="inter-medium-font text-[10px] uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <p className="inter-bold-font mt-1 text-[14px] text-[#47317c]">
        {unit === "kg" ? `${item?.value} kg` : item?.label}
      </p>
    </div>
  );
};

/* ── Loader ── */
const pulse = "animate-pulse rounded-full bg-[#47317c]/[0.07]";

const JourneyLoader = () => (
  <main className="min-w-0 flex-1 bg-[#FBFBFD]">
    <div className="mx-auto flex w-full flex-col gap-6 p-4 sm:p-5 lg:p-6 2xl:p-8 2xl:gap-8">

      {/* PageHeader skeleton */}
      <div className="rounded-2xl border border-[#47317c]/[0.08] bg-white p-4 sm:p-5 lg:p-6">
        <div className={`h-3 w-28 ${pulse}`} />
        <div className={`mt-3 h-7 w-52 ${pulse}`} />
        <div className={`mt-2.5 h-3 w-80 ${pulse}`} />
      </div>

      {/* Content card */}
      <section className="rounded-2xl border border-slate-200 bg-white">

        {/* Section heading + unit toggle */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between lg:p-5 2xl:p-6">
          <div>
            <div className={`h-4 w-36 ${pulse}`} />
            <div className={`mt-2 h-3 w-56 ${pulse}`} />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-xl bg-[#47317c]/[0.07]" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 lg:p-5 2xl:p-6 2xl:gap-4">
          {[0, 1, 2, 3].map((i) => (
            <article key={i} className="rounded-xl border border-slate-200 bg-white p-4 2xl:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="h-9 w-9 animate-pulse rounded-xl bg-[#47317c]/[0.07]" />
                <div className={`h-5 w-16 ${pulse}`} />
              </div>
              <div className="mt-4 space-y-2">
                <div className={`h-3 w-24 ${pulse}`} />
                <div className={`h-7 w-28 ${pulse}`} />
                <div className={`h-3 w-36 ${pulse}`} />
              </div>
            </article>
          ))}
        </div>

        {/* Chart area */}
        <div className="mx-4 mb-4 overflow-hidden rounded-xl border border-slate-100 lg:mx-5 lg:mb-5 2xl:mx-6 2xl:mb-6">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-[#47317c]/[0.07]" />
              <div>
                <div className={`h-3.5 w-32 ${pulse}`} />
                <div className={`mt-1.5 h-3 w-48 ${pulse}`} />
              </div>
            </div>
            <div className={`h-7 w-36 ${pulse}`} />
          </div>
          <div className="px-4 pb-4 pt-5">
            <div className="h-[300px] w-full animate-pulse rounded-xl bg-[#47317c]/[0.05] sm:h-[360px]" />
          </div>
        </div>

      </section>
    </div>
  </main>
);

/* ── Empty ── */
const EmptyJourneyState = () => (
  <main className="inter-reg-font min-w-0 flex-1">
    <div className="mx-auto flex w-full flex-col gap-6 p-4 sm:p-5 lg:p-6">
      <div className="flex min-h-[480px] flex-col items-center justify-center rounded-2xl  px-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#47317c]/[0.08] text-[#47317c]">
          <Scale size={24} strokeWidth={1.8} />
        </span>
        <h2 className="inter-bold-font mt-5 text-[20px] text-slate-900">No weight progression yet</h2>
        <p className="inter-reg-font mt-2 max-w-sm text-[13px] leading-[1.7] text-slate-500">
          Your journey will appear once tracking starts.
        </p>
      </div>
    </div>
  </main>
);
