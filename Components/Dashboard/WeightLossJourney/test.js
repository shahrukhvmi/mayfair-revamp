"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ClipboardList,
  Flag,
  User,
  TrendingDown,
  Award,
  BarChart3,
  CheckCircle,
} from "lucide-react";

import GetBmiJourney from "@/api/GetBmiJourney";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";

/* =================================
   HELPERS (SINGLE SOURCE = KG)
================================= */

// remove duplicate entries (keep latest per day)
const normalizeJourney = (data) => {
  const map = new Map();

  data.forEach((item) => {
    map.set(item.order_date, item); // overwrite → latest
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.order_date) - new Date(b.order_date)
  );
};

// always use KG
const getWeightKg = (item) => Number(item.weight_kg);

// kg → st/lb (DISPLAY ONLY)
const formatWeight = (kg, unit) => {
  if (unit === "kg") return `${kg} kg`;

  const totalLb = kg * 2.20462;
  const st = Math.floor(totalLb / 14);
  const lb = Math.round(totalLb % 14);

  return `${st} st ${lb} lb`;
};

// chart data (kg only)
const prepareChartData = (data) =>
  normalizeJourney(data).map((item) => ({
    date: item.order_date_readable,
    value: getWeightKg(item),
  }));

// stats (kg only)
const calculateStats = (data) => {
  const normalized = normalizeJourney(data);
  const values = normalized.map(getWeightKg);

  const start = values[0];
  const current = values.at(-1);

  return {
    start,
    current,
    lowest: Math.min(...values),
    avg: Number(
      (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
    ),
    change: Number((current - start).toFixed(1)),
    percentage: Number((((current - start) / start) * 100).toFixed(1)),
  };
};

/* =================================
   PAGE
================================= */

export default function WeightJourneyPage() {
  const { authUserDetail } = useAuthUserDetailStore();
  const userId = authUserDetail?.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [unit, setUnit] = useState("kg");

  const getJourney = useMutation({
    mutationFn: (id) => GetBmiJourney(id),
    onSuccess: (res) => {
      setData(res?.data?.bmi_journey || []);
      setLoading(false);
    },
    onError: () => {
      toast.error("Failed to load journey");
      setLoading(false);
    },
  });

  useEffect(() => {
    if (userId) getJourney.mutate(userId);
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#47317c]" />
      </div>
    );
  }

  if (!data.length) {
    return <EmptyJourneyState />;
  }

  const stats = calculateStats(data);
  const chartData = prepareChartData(data);

  return (
    <div className="p-6 space-y-10 min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Weight Loss Journey</h1>
          <p className="text-sm text-slate-500">
            Your personalised progress overview
          </p>
        </div>
        <UnitTabs unit={unit} setUnit={setUnit} />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
        <JourneyStatCard
          title="Total Orders"
          value={data.length}
          description="Orders placed & approved"
          badge="Approved"
          icon={ClipboardList}
        />

        <JourneyStatCard
          title="Starting Weight"
          value={formatWeight(stats.start, unit)}
          description="First recorded weight"
          badge="Baseline"
          icon={Flag}
        />

        <JourneyStatCard
          title="Current Weight"
          value={formatWeight(stats.current, unit)}
          description="Most recent update"
          badge="Latest"
          icon={User}
        />

        <JourneyStatCard
          title="Total Change"
          value={formatWeight(stats.change, unit)}
          description="Overall change since start"
          badge={`${stats.percentage}%`}
          icon={TrendingDown}
          highlight
        />

        <JourneyStatCard
          title="Lowest Weight"
          value={formatWeight(stats.lowest, unit)}
          description="Lowest recorded point"
          badge="Best"
          icon={Award}
        />

        <JourneyStatCard
          title="Average Weight"
          value={formatWeight(stats.avg, unit)}
          description="Average over period"
          badge="Avg"
          icon={BarChart3}
        />
      </div>

      {/* CHART */}
      <ChartCard title="Weight Progression">
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(v) => formatWeight(v, unit)}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#47317c"
              strokeWidth={2.6}
              dot={{ r: 4, fill: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

/* =================================
   UI COMPONENTS
================================= */

const UnitTabs = ({ unit, setUnit }) => (
  <div className="inline-flex bg-white rounded-full p-1 border shadow">
    {["kg", "st"].map((u) => (
      <button
        key={u}
        onClick={() => setUnit(u)}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition
          ${
            unit === u
              ? "bg-[#47317c] text-white"
              : "text-[#47317c] hover:bg-[#47317c]/10"
          }`}
      >
        {u === "kg" ? "KG" : "St / Lb"}
      </button>
    ))}
  </div>
);

const JourneyStatCard = ({
  title,
  value,
  description,
  badge,
  icon: Icon,
  highlight,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-3xl bg-white p-6 shadow
      ${highlight ? "ring-1 ring-[#47317c]/40" : ""}`}
  >
    <div className="flex justify-between items-center mb-3">
      <Icon className="text-[#47317c]" />
      {badge && (
        <span className="text-xs font-semibold text-[#47317c] flex gap-1">
          <CheckCircle size={14} /> {badge}
        </span>
      )}
    </div>
    <p className="text-xs uppercase tracking-widest text-slate-500">
      {title}
    </p>
    <p className="text-2xl font-bold mt-2">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{description}</p>
  </motion.div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-3xl p-6 shadow">
    <h3 className="text-sm font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const EmptyJourneyState = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-xl font-semibold">No Weight Progression Yet</h2>
      <p className="text-gray-500 mt-2">
        Your journey will appear once tracking starts.
      </p>
    </div>
  </div>
);
