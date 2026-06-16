"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ShadCN */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* Recharts */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";

/* Phosphor */
import {
  Buildings,
  CurrencyCircleDollar,
  ArrowsClockwise,
  Lightning,
  WifiHigh,
  Broom,
  ShoppingCart,
  Users,
  TrendDown,
  Receipt,
  Truck,
  ChartPie,
  ChartBar,
  Info,
  Percent,
  CalendarBlank,
  Wallet,
  PiggyBank,
  ArrowDown,
  Sparkle,
} from "@phosphor-icons/react";

/* ── helpers ─────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtShort = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`;
  return `₹${n}`;
};

const COLORS = [
  "#6366f1",
  "#0d9488",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

/* ── animation variants ──────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
} as const;
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/* ── component ───────────────────────────────────────── */
export default function BudgetTracker() {
  /* ── form state ── */
  const [rent, setRent] = useState(40000);
  const [flatmates, setFlatmates] = useState(4);

  const [depositMultiplier, setDepositMultiplier] = useState("2");
  const [brokerageType, setBrokerageType] = useState("50");
  const [customBrokerage, setCustomBrokerage] = useState(15000);
  const [setupCosts, setSetupCosts] = useState(8000);

  const [maintenance, setMaintenance] = useState(3000);
  const [maintenanceFreq, setMaintenanceFreq] = useState("monthly");
  const [groceries, setGroceries] = useState(12000);
  const [electricity, setElectricity] = useState(1500);
  const [wifi, setWifi] = useState(1000);
  const [maid, setMaid] = useState(4000);

  /* NEW: optional extras */
  const [gas, setGas] = useState(500);
  const [water, setWater] = useState(300);
  const [miscMonthly, setMiscMonthly] = useState(1000);

  /* ── per-expense toggles ── */
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    rent: true,
    deposit: true,
    brokerage: true,
    setup: true,
    maintenance: true,
    groceries: true,
    electricity: true,
    wifi: true,
    maid: true,
    gas: true,
    water: true,
    misc: true,
  });

  const toggle = useCallback(
    (key: string) =>
      setEnabled((prev) => ({ ...prev, [key]: !prev[key] })),
    [],
  );

  /* ── derived (gated by toggles) ── */
  const e = enabled; // shorthand

  const activeRent = e.rent ? rent : 0;
  const deposit = e.deposit ? rent * Number(depositMultiplier) : 0;

  const brokerage = useMemo(() => {
    if (!e.brokerage) return 0;
    if (brokerageType === "50") return rent * 0.5;
    if (brokerageType === "100") return rent;
    if (brokerageType === "custom") return customBrokerage;
    return 0;
  }, [rent, brokerageType, customBrokerage, e.brokerage]);

  const activeSetup = e.setup ? setupCosts : 0;

  const maintenanceMonthly =
    maintenanceFreq === "yearly" ? maintenance / 12 : maintenance;
  const activeMaintenance = e.maintenance ? maintenanceMonthly : 0;
  const activeGroceries = e.groceries ? groceries : 0;
  const activeElectricity = e.electricity ? electricity : 0;
  const activeWifi = e.wifi ? wifi : 0;
  const activeMaid = e.maid ? maid : 0;
  const activeGas = e.gas ? gas : 0;
  const activeWater = e.water ? water : 0;
  const activeMisc = e.misc ? miscMonthly : 0;

  const totalUtilities =
    activeMaintenance +
    activeGroceries +
    activeElectricity +
    activeWifi +
    activeMaid +
    activeGas +
    activeWater +
    activeMisc;

  const totalRecurring = activeRent + totalUtilities;
  const totalMoveIn = activeRent + deposit + brokerage + activeSetup + totalUtilities;

  const ppRecurring = totalRecurring / flatmates;
  const ppMoveIn = totalMoveIn / flatmates;
  const savings = ppMoveIn - ppRecurring;
  const savingsPct = ppMoveIn > 0 ? ((savings / ppMoveIn) * 100).toFixed(0) : "0";

  /* ── chart data ── */
  const timelineData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        name: `M${i + 1}`,
        value: i === 0 ? ppMoveIn : ppRecurring,
        fill: i === 0 ? "#4f46e5" : "#0d9488",
      })),
    [ppMoveIn, ppRecurring],
  );

  const pieData = useMemo(
    () =>
      [
        { name: "Rent", value: activeRent },
        { name: "Maintenance", value: activeMaintenance },
        { name: "Groceries", value: activeGroceries },
        { name: "Electricity", value: activeElectricity },
        { name: "Wi-Fi", value: activeWifi },
        { name: "Maid", value: activeMaid },
        { name: "Gas", value: activeGas },
        { name: "Water", value: activeWater },
        { name: "Misc", value: activeMisc },
      ].filter((d) => d.value > 0),
    [activeRent, activeMaintenance, activeGroceries, activeElectricity, activeWifi, activeMaid, activeGas, activeWater, activeMisc],
  );

  const moveInPieData = useMemo(
    () =>
      [
        { name: "First Month Rent", value: activeRent },
        { name: "Deposit", value: deposit },
        { name: "Brokerage", value: brokerage },
        { name: "Setup Costs", value: activeSetup },
        { name: "Utilities", value: totalUtilities },
      ].filter((d) => d.value > 0),
    [activeRent, deposit, brokerage, activeSetup, totalUtilities],
  );

  const cumulativeData = useMemo(
    () => {
      let total = 0;
      return Array.from({ length: 12 }, (_, i) => {
        total += i === 0 ? ppMoveIn : ppRecurring;
        return { name: `M${i + 1}`, cumulative: Math.round(total) };
      });
    },
    [ppMoveIn, ppRecurring],
  );

  /* ── helpers ── */
  const numChange = useCallback(
    (setter: (v: number) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setter(Number(e.target.value) || 0),
    [],
  );

  /* ── JSX ── */
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
    >
      {/* ═══════════════ LEFT COLUMN ═══════════════ */}
      <div className="lg:col-span-5 space-y-5">
        {/* Core Details */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-sm border-slate-100/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[15px] text-slate-800">
                <Buildings className="w-[18px] h-[18px] text-teal-500" weight="duotone" />
                Core House Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <CurrencyInput
                label="Monthly Rent (Total)"
                value={rent}
                onChange={numChange(setRent)}
                hint="Total rent before splitting among flatmates"
                isOn={e.rent}
                onToggle={() => toggle("rent")}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    Number of Flatmates
                  </Label>
                  <Badge
                    variant="secondary"
                    className="bg-teal-50 text-teal-700 font-semibold text-sm px-2.5 border-0"
                  >
                    {flatmates}
                  </Badge>
                </div>
                <Slider
                  value={[flatmates]}
                  onValueChange={(v) => {
                    const arr = Array.isArray(v) ? v : [v];
                    if (arr[0] !== undefined) setFlatmates(arr[0]);
                  }}
                  min={1}
                  max={6}
                  step={1}
                />
                <div className="flex justify-between mt-1.5 text-[10px] text-slate-300">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* One-Time Costs */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-sm border-slate-100/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[15px] text-slate-800">
                  <CurrencyCircleDollar className="w-[18px] h-[18px] text-indigo-500" weight="duotone" />
                  One-Time Move-in Costs
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-indigo-500 border-indigo-200 bg-indigo-50">
                  Month 1 only
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className={!e.deposit ? "opacity-40 transition-opacity" : "transition-opacity"}>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Switch size="sm" checked={e.deposit} onCheckedChange={() => toggle("deposit")} />
                    <span className={!e.deposit ? "line-through" : ""}>Security Deposit</span>
                  </Label>
                  <Select
                    value={depositMultiplier}
                    onValueChange={(v) => { if (v) setDepositMultiplier(v); }}
                    disabled={!e.deposit}
                  >
                    <SelectTrigger className="bg-white border-slate-200 h-9 text-sm disabled:bg-slate-50 disabled:cursor-not-allowed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Deposit</SelectItem>
                      <SelectItem value="1">1 Month Rent</SelectItem>
                      <SelectItem value="2">2 Months Rent</SelectItem>
                      <SelectItem value="3">3 Months Rent</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-400 mt-1">{fmt(deposit)}</p>
                </div>
                <div className={!e.brokerage ? "opacity-40 transition-opacity" : "transition-opacity"}>
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Switch size="sm" checked={e.brokerage} onCheckedChange={() => toggle("brokerage")} />
                    <span className={!e.brokerage ? "line-through" : ""}>Brokerage Fee</span>
                  </Label>
                  <Select
                    value={brokerageType}
                    onValueChange={(v) => { if (v) setBrokerageType(v); }}
                    disabled={!e.brokerage}
                  >
                    <SelectTrigger className="bg-white border-slate-200 h-9 text-sm disabled:bg-slate-50 disabled:cursor-not-allowed">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50% of Rent</SelectItem>
                      <SelectItem value="100">1 Month Rent</SelectItem>
                      <SelectItem value="none">No Broker</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {brokerageType !== "custom" ? fmt(brokerage) : ""}
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {brokerageType === "custom" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <CurrencyInput
                      label="Custom Brokerage"
                      value={customBrokerage}
                      onChange={numChange(setCustomBrokerage)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <CurrencyInput
                label="Initial Setup & Movers"
                value={setupCosts}
                onChange={numChange(setSetupCosts)}
                hint="Packers & movers, repairs, initial groceries, cleaning supplies"
                icon={<Truck className="w-4 h-4 text-slate-400" />}
                isOn={e.setup}
                onToggle={() => toggle("setup")}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Recurring Utilities */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-sm border-slate-100/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-teal-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[15px] text-slate-800">
                  <ArrowsClockwise className="w-[18px] h-[18px] text-teal-500" weight="duotone" />
                  Recurring Monthly
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-teal-600 border-teal-200 bg-teal-50">
                  Every month
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Maintenance row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <CurrencyInput
                    label="Maintenance"
                    value={maintenance}
                    onChange={numChange(setMaintenance)}
                    hint={maintenanceFreq === "yearly" ? `Monthly: ${fmt(maintenanceMonthly)}` : undefined}
                    isOn={e.maintenance}
                    onToggle={() => toggle("maintenance")}
                  />
                </div>
                <div className="w-[110px]">
                  <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Frequency
                  </Label>
                  <Select
                    value={maintenanceFreq}
                    onValueChange={(v) => { if (v) setMaintenanceFreq(v); }}
                  >
                    <SelectTrigger className="bg-white border-slate-200 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Main utilities */}
              <div className="grid grid-cols-2 gap-3">
                <CurrencyInput
                  label="Groceries"
                  value={groceries}
                  onChange={numChange(setGroceries)}
                  icon={<ShoppingCart className="w-3.5 h-3.5 text-slate-400" />}
                  isOn={e.groceries}
                  onToggle={() => toggle("groceries")}
                />
                <CurrencyInput
                  label="Electricity"
                  value={electricity}
                  onChange={numChange(setElectricity)}
                  icon={<Lightning className="w-3.5 h-3.5 text-slate-400" />}
                  isOn={e.electricity}
                  onToggle={() => toggle("electricity")}
                />
                <CurrencyInput
                  label="Wi-Fi"
                  value={wifi}
                  onChange={numChange(setWifi)}
                  icon={<WifiHigh className="w-3.5 h-3.5 text-slate-400" />}
                  isOn={e.wifi}
                  onToggle={() => toggle("wifi")}
                />
                <CurrencyInput
                  label="Maid / Cook"
                  value={maid}
                  onChange={numChange(setMaid)}
                  icon={<Broom className="w-3.5 h-3.5 text-slate-400" />}
                  isOn={e.maid}
                  onToggle={() => toggle("maid")}
                />
              </div>

              {/* Extras accordion */}
              <Accordion className="border-t border-slate-100 pt-1">
                <AccordionItem value="extras" className="border-b-0">
                  <AccordionTrigger className="text-xs text-slate-400 py-2 hover:no-underline">
                    Additional expenses (Gas, Water, Misc)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <CurrencyInput
                        label="Gas"
                        value={gas}
                        onChange={numChange(setGas)}
                        isOn={e.gas}
                        onToggle={() => toggle("gas")}
                      />
                      <CurrencyInput
                        label="Water"
                        value={water}
                        onChange={numChange(setWater)}
                        isOn={e.water}
                        onToggle={() => toggle("water")}
                      />
                      <CurrencyInput
                        label="Misc"
                        value={miscMonthly}
                        onChange={numChange(setMiscMonthly)}
                        isOn={e.misc}
                        onToggle={() => toggle("misc")}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══════════════ RIGHT COLUMN ═══════════════ */}
      <div className="lg:col-span-7 space-y-5">
        {/* Highlight Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Move-in */}
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-5 sm:p-6 rounded-2xl shadow-lg shadow-indigo-200/50 relative overflow-hidden"
          >
            <div className="absolute -right-3 -bottom-3 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
            <h3 className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest mb-0.5">
              Month 1 · Move-in
            </h3>
            <p className="text-[10px] text-indigo-300 mb-3">Total upfront cash</p>
            <motion.div
              key={totalMoveIn}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight"
            >
              {fmt(totalMoveIn)}
            </motion.div>
            <div className="bg-indigo-800/40 rounded-lg p-2.5 mt-4 border border-indigo-400/20">
              <div className="text-[11px] text-indigo-200 flex items-center gap-1">
                <Users weight="fill" className="w-3.5 h-3.5" />
                Your share (1/{flatmates})
              </div>
              <div className="text-xl font-bold mt-0.5">{fmt(ppMoveIn)}</div>
            </div>
          </motion.div>

          {/* Recurring */}
          <motion.div
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-5 sm:p-6 rounded-2xl shadow-lg shadow-teal-200/50 relative overflow-hidden"
          >
            <div className="absolute -right-3 -bottom-3 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
            <h3 className="text-teal-200 text-[11px] font-semibold uppercase tracking-widest mb-0.5">
              Month 2+ · Recurring
            </h3>
            <p className="text-[10px] text-teal-300 mb-3">Stabilized burn rate</p>
            <motion.div
              key={totalRecurring}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight"
            >
              {fmt(totalRecurring)}
            </motion.div>
            <div className="bg-teal-800/40 rounded-lg p-2.5 mt-4 border border-teal-400/20">
              <div className="text-[11px] text-teal-200 flex items-center gap-1">
                <Users weight="fill" className="w-3.5 h-3.5" />
                Your share (1/{flatmates})
              </div>
              <div className="text-xl font-bold mt-0.5">{fmt(ppRecurring)}</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Savings indicator */}
        <motion.div variants={fadeUp}>
          <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-amber-100 p-1.5 rounded-lg">
                <ArrowDown className="w-4 h-4 text-amber-600" weight="bold" />
              </div>
              <div>
                <p className="text-[11px] text-amber-500 font-medium uppercase tracking-wide">Month-over-month drop</p>
                <p className="text-lg font-bold text-amber-700">{fmt(savings)}<span className="text-xs font-medium ml-1">({savingsPct}%)</span></p>
              </div>
            </div>
            <Separator orientation="vertical" className="hidden sm:block h-8" />
            <p className="text-xs text-amber-600/80 leading-relaxed">
              After the initial move-in shock, your per-person expenses drop by <strong>{savingsPct}%</strong> from Month 2 onwards. That&apos;s {fmt(savings)} less each month.
            </p>
          </div>
        </motion.div>

        {/* Breakdown Table */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-sm border-slate-100/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[15px] text-slate-800">
                <Receipt className="w-[18px] h-[18px] text-slate-400" weight="duotone" />
                Per Person Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/70 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Category</th>
                      <th className="px-4 py-2.5 text-right font-medium">Month 1</th>
                      <th className="px-4 py-2.5 text-right font-medium">Month 2+</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-[13px]">
                    <Row label="Rent" m1={activeRent / flatmates} m2={activeRent / flatmates} off={!e.rent} />
                    <Row label="Security Deposit" sub="Refundable" m1={deposit / flatmates} off={!e.deposit} />
                    <Row label="Brokerage" m1={brokerage / flatmates} off={!e.brokerage} />
                    <Row label="Setup & Movers" m1={activeSetup / flatmates} off={!e.setup} />
                    <Row
                      label="Maintenance"
                      sub={maintenanceFreq === "yearly" ? "Yearly → monthly" : undefined}
                      m1={activeMaintenance / flatmates}
                      m2={activeMaintenance / flatmates}
                      off={!e.maintenance}
                    />
                    <Row label="Groceries" m1={activeGroceries / flatmates} m2={activeGroceries / flatmates} off={!e.groceries} />
                    <Row label="Electricity" m1={activeElectricity / flatmates} m2={activeElectricity / flatmates} off={!e.electricity} />
                    <Row label="Wi-Fi" m1={activeWifi / flatmates} m2={activeWifi / flatmates} off={!e.wifi} />
                    <Row label="Maid / Cook" m1={activeMaid / flatmates} m2={activeMaid / flatmates} off={!e.maid} />
                    {(gas > 0 || water > 0 || miscMonthly > 0) && (
                      <Row
                        label="Other"
                        sub="Gas, Water, Misc"
                        m1={(activeGas + activeWater + activeMisc) / flatmates}
                        m2={(activeGas + activeWater + activeMisc) / flatmates}
                        off={!e.gas && !e.water && !e.misc}
                      />
                    )}
                    <tr className="bg-slate-50 font-semibold text-sm">
                      <td className="px-4 py-3 text-slate-900">Total Per Person</td>
                      <td className="px-4 py-3 text-right text-indigo-600">{fmt(ppMoveIn)}</td>
                      <td className="px-4 py-3 text-right text-teal-600">{fmt(ppRecurring)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts via Tabs */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-sm border-slate-100/80">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-[15px] text-slate-800 mb-1">
                <Sparkle className="w-[18px] h-[18px] text-slate-400" weight="duotone" />
                Visualizations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-9 mb-4">
                  <TabsTrigger value="timeline" className="text-xs gap-1.5 data-[state=active]:text-indigo-700">
                    <ChartBar className="w-3.5 h-3.5" /> Timeline
                  </TabsTrigger>
                  <TabsTrigger value="breakdown" className="text-xs gap-1.5 data-[state=active]:text-teal-700">
                    <ChartPie className="w-3.5 h-3.5" /> Split
                  </TabsTrigger>
                  <TabsTrigger value="cumulative" className="text-xs gap-1.5 data-[state=active]:text-amber-700">
                    <TrendDown className="w-3.5 h-3.5" /> Cumulative
                  </TabsTrigger>
                </TabsList>

                {/* Timeline Bar */}
                <TabsContent value="timeline" className="mt-0">
                  <p className="text-xs text-slate-400 mb-3">Per-person expense across 12 months — see the Month 1 spike.</p>
                  <div className="h-56 sm:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timelineData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
                        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v: number) => fmtShort(v)} />
                        <RTooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
                          formatter={(value: any) => [fmt(Number(value)), "Per Person"]}
                        />
                        <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={32}>
                          {timelineData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                {/* Pie Breakdown */}
                <TabsContent value="breakdown" className="mt-0">
                  <p className="text-xs text-slate-400 mb-3">How your recurring monthly total splits across categories.</p>
                  <div className="h-56 sm:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius="55%"
                          outerRadius="80%"
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <RTooltip
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                          formatter={(value: any, name: any) => [fmt(Number(value)), name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        {d.name}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Cumulative Area */}
                <TabsContent value="cumulative" className="mt-0">
                  <p className="text-xs text-slate-400 mb-3">Cumulative per-person spend over 12 months.</p>
                  <div className="h-56 sm:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cumulativeData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
                        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v: number) => fmtShort(v)} />
                        <RTooltip
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                          formatter={(value: any) => [fmt(Number(value)), "Total Spent"]}
                        />
                        <Area type="monotone" dataKey="cumulative" stroke="#6366f1" strokeWidth={2} fill="url(#gradArea)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Move-in pie */}
        <motion.div variants={fadeUp}>
          <Card className="shadow-sm border-slate-100/80">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-[15px] text-slate-800">
                <Wallet className="w-[18px] h-[18px] text-slate-400" weight="duotone" />
                Move-in Cost Composition
              </CardTitle>
              <p className="text-xs text-slate-400">Where your first-month money goes.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={moveInPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius="50%"
                        outerRadius="80%"
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {moveInPieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <RTooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                        formatter={(value: any, name: any) => [fmt(Number(value)), name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {moveInPieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-slate-600">{d.name}</span>
                      </div>
                      <span className="font-medium text-slate-800">{fmt(d.value)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-slate-800">Total</span>
                    <span className="text-indigo-600">{fmt(totalMoveIn)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Row component ── */
function Row({
  label,
  sub,
  m1,
  m2,
  off,
}: {
  label: string;
  sub?: string;
  m1?: number;
  m2?: number;
  off?: boolean;
}) {
  return (
    <tr className={`hover:bg-slate-50/50 transition-colors ${off ? "opacity-35" : ""}`}>
      <td className="px-4 py-2.5 text-slate-800">
        <span className={off ? "line-through" : ""}>{label}</span>
        {sub && (
          <span className="block text-[11px] text-slate-400 font-normal">
            {sub}
          </span>
        )}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums">
        {!off && m1 !== undefined && m1 > 0 ? fmt(m1) : <span className="text-slate-200">—</span>}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums">
        {!off && m2 !== undefined && m2 > 0 ? fmt(m2) : <span className="text-slate-200">—</span>}
      </td>
    </tr>
  );
}

/* ── CurrencyInput component ── */
function CurrencyInput({
  label,
  value,
  onChange,
  hint,
  icon,
  isOn = true,
  onToggle,
}: {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hint?: string;
  icon?: React.ReactNode;
  isOn?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className={!isOn ? "opacity-40 transition-opacity" : "transition-opacity"}>
      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
        {onToggle && (
          <Switch
            size="sm"
            checked={isOn}
            onCheckedChange={onToggle}
          />
        )}
        {icon}
        <span className={!isOn ? "line-through" : ""}>{label}</span>
        {hint && (
          <Tooltip>
            <TooltipTrigger className="inline-flex">
              <Info className="w-3.5 h-3.5 text-slate-300 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] text-xs">
              {hint}
            </TooltipContent>
          </Tooltip>
        )}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none text-sm">
          ₹
        </span>
        <Input
          type="number"
          value={value || ""}
          onChange={onChange}
          disabled={!isOn}
          className="pl-7 bg-white border-slate-200 focus-visible:ring-teal-500 focus-visible:border-teal-500 h-9 text-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
