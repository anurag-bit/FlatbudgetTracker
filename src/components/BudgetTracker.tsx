"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import LZString from "lz-string";
import * as XLSX from "xlsx";

export type RentMode = "equal" | "percent" | "amount";
export type Flatmate = {
  id: string;
  name: string;
  rentMode: RentMode;
  rentValue: number;
};
export type SetupItem = {
  id: string;
  name: string;
  cost: number;
  paidBy: "all" | string;
};

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
import { Button } from "@/components/ui/button";

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
  ShareNetwork,
  FilePdf,
  FileXls,
  Plus,
  Trash,
  ListChecks,
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
  const [flatmates, setFlatmates] = useState<Flatmate[]>([
    { id: uuidv4(), name: "Roommate A", rentMode: "equal", rentValue: 0 },
    { id: uuidv4(), name: "Roommate B", rentMode: "equal", rentValue: 0 },
    { id: uuidv4(), name: "Roommate C", rentMode: "equal", rentValue: 0 },
    { id: uuidv4(), name: "Roommate D", rentMode: "equal", rentValue: 0 },
  ]);

  const [depositMultiplier, setDepositMultiplier] = useState("2");
  const [brokerageType, setBrokerageType] = useState("50");
  const [customBrokerage, setCustomBrokerage] = useState(15000);
  
  const [setupItems, setSetupItems] = useState<SetupItem[]>([
    { id: uuidv4(), name: "Packers & Movers", cost: 8000, paidBy: "all" },
  ]);

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

  const toggle = (key: string) => {
    setEnabled((prev) => ({ ...prev, [key]: prev[key] === false ? true : false }));
  };
  const e = enabled;

  const [viewingFlatmateId, setViewingFlatmateId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  /* ── URL Sync ── */
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      try {
        const hash = window.location.hash.replace("#", "");
        const decoded = LZString.decompressFromEncodedURIComponent(hash);
        if (decoded) {
          const state = JSON.parse(decoded);
          if (state.rent !== undefined) setRent(state.rent);
          if (state.flatmates) {
            setFlatmates(state.flatmates);
            if (state.flatmates.length > 0) setViewingFlatmateId(state.flatmates[0].id);
          }
          if (state.depositMultiplier) setDepositMultiplier(state.depositMultiplier);
          if (state.brokerageType) setBrokerageType(state.brokerageType);
          if (state.customBrokerage) setCustomBrokerage(state.customBrokerage);
          if (state.setupItems) setSetupItems(state.setupItems);
          if (state.maintenance !== undefined) setMaintenance(state.maintenance);
          if (state.maintenanceFreq) setMaintenanceFreq(state.maintenanceFreq);
          if (state.groceries !== undefined) setGroceries(state.groceries);
          if (state.electricity !== undefined) setElectricity(state.electricity);
          if (state.wifi !== undefined) setWifi(state.wifi);
          if (state.maid !== undefined) setMaid(state.maid);
          if (state.gas !== undefined) setGas(state.gas);
          if (state.water !== undefined) setWater(state.water);
          if (state.miscMonthly !== undefined) setMiscMonthly(state.miscMonthly);
          if (state.enabled) setEnabled(state.enabled);
        }
      } catch (err) {
        console.error("Failed to load state from URL");
      }
    } else {
      if (flatmates.length > 0) setViewingFlatmateId(flatmates[0].id);
    }
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const state = {
      rent, flatmates, depositMultiplier, brokerageType, customBrokerage, setupItems,
      maintenance, maintenanceFreq, groceries, electricity, wifi, maid, gas, water, miscMonthly,
      enabled
    };
    const encoded = LZString.compressToEncodedURIComponent(JSON.stringify(state));
    window.history.replaceState(null, "", `#${encoded}`);
  }, [isLoaded, rent, flatmates, depositMultiplier, brokerageType, customBrokerage, setupItems, maintenance, maintenanceFreq, groceries, electricity, wifi, maid, gas, water, miscMonthly, enabled]);


  /* ── derived values ── */
  const activeRent = e.rent ? rent : 0;
  
  // Deposit
  let deposit = 0;
  if (e.deposit && depositMultiplier !== "0") {
    deposit = activeRent * parseInt(depositMultiplier);
  }

  // Brokerage
  let brokerage = 0;
  if (e.brokerage) {
    if (brokerageType === "50") brokerage = activeRent * 0.5;
    else if (brokerageType === "100") brokerage = activeRent;
    else if (brokerageType === "custom") brokerage = customBrokerage;
  }

  // Setup
  const activeSetup = e.setup ? setupItems.reduce((acc, item) => acc + item.cost, 0) : 0;

  // Recurring
  const activeMaintenance = e.maintenance ? maintenance : 0;
  const maintenanceMonthly = maintenanceFreq === "yearly" ? activeMaintenance / 12 : activeMaintenance;
  
  const activeGroceries = e.groceries ? groceries : 0;
  const activeElectricity = e.electricity ? electricity : 0;
  const activeWifi = e.wifi ? wifi : 0;
  const activeMaid = e.maid ? maid : 0;

  const activeGas = e.gas ? gas : 0;
  const activeWater = e.water ? water : 0;
  const activeMisc = e.misc ? miscMonthly : 0;

  const totalUtilities =
    maintenanceMonthly +
    activeGroceries +
    activeElectricity +
    activeWifi +
    activeMaid +
    activeGas +
    activeWater +
    activeMisc;

  const totalRecurring = activeRent + totalUtilities;
  const totalMoveIn = activeRent + deposit + brokerage + activeSetup + totalUtilities;

  // Split Logic
  const flatmatesCount = flatmates.length || 1;

  const rentShares = useMemo(() => {
    if (!e.rent) return flatmates.map(() => 0);
    let totalAssigned = 0;
    let equalCount = 0;
    const shares = flatmates.map(f => {
      if (f.rentMode === "amount") {
        totalAssigned += f.rentValue;
        return f.rentValue;
      } else if (f.rentMode === "percent") {
        const val = (activeRent * f.rentValue) / 100;
        totalAssigned += val;
        return val;
      } else {
        equalCount++;
        return -1;
      }
    });
    const remainder = Math.max(0, activeRent - totalAssigned);
    const equalShare = equalCount > 0 ? remainder / equalCount : 0;
    return shares.map(s => s === -1 ? equalShare : s);
  }, [e.rent, activeRent, flatmates]);

  const ppRent = (fIndex: number) => rentShares[fIndex] || 0;
  const ppDeposit = (fIndex: number) => activeRent > 0 ? (ppRent(fIndex) / activeRent) * deposit : deposit / flatmatesCount;
  const ppBrokerage = (fIndex: number) => activeRent > 0 ? (ppRent(fIndex) / activeRent) * brokerage : brokerage / flatmatesCount;
  
  const ppUtilities = totalUtilities / flatmatesCount;
  const ppSetup = activeSetup / flatmatesCount;

  const ppRecurring = (fIndex: number) => ppRent(fIndex) + ppUtilities;
  const ppMoveIn = (fIndex: number) => ppRent(fIndex) + ppDeposit(fIndex) + ppBrokerage(fIndex) + ppSetup + ppUtilities;

  const getViewingFlatmateIndex = () => {
    const idx = flatmates.findIndex(f => f.id === viewingFlatmateId);
    return idx === -1 ? 0 : idx;
  };
  const viewingIndex = getViewingFlatmateIndex();

  const vPpRecurring = ppRecurring(viewingIndex);
  const vPpMoveIn = ppMoveIn(viewingIndex);
  const savings = vPpMoveIn - vPpRecurring;
  const savingsPct = vPpMoveIn > 0 ? ((savings / vPpMoveIn) * 100).toFixed(0) : "0";

  const setupBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    flatmates.forEach(f => balances[f.id] = 0);
    if (!e.setup) return balances;

    setupItems.forEach(item => {
      const perPerson = item.cost / flatmatesCount;
      flatmates.forEach(f => {
        if (balances[f.id] !== undefined) balances[f.id] -= perPerson;
      });
      if (item.paidBy === "all") {
        flatmates.forEach(f => {
          if (balances[f.id] !== undefined) balances[f.id] += perPerson;
        });
      } else if (balances[item.paidBy] !== undefined) {
        balances[item.paidBy] += item.cost;
      }
    });
    return balances;
  }, [setupItems, flatmates, e.setup, flatmatesCount]);

  /* ── chart data ── */
  const timelineData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        name: `M${i + 1}`,
        value: i === 0 ? vPpMoveIn : vPpRecurring,
        fill: i === 0 ? "#4f46e5" : "#0d9488",
      })),
    [vPpMoveIn, vPpRecurring],
  );

  const pieData = useMemo(
    () =>
      [
        { name: "Rent", value: ppRent(viewingIndex) },
        { name: "Maintenance", value: activeMaintenance / flatmatesCount },
        { name: "Groceries", value: activeGroceries / flatmatesCount },
        { name: "Electricity", value: activeElectricity / flatmatesCount },
        { name: "Wi-Fi", value: activeWifi / flatmatesCount },
        { name: "Maid", value: activeMaid / flatmatesCount },
        { name: "Gas", value: activeGas / flatmatesCount },
        { name: "Water", value: activeWater / flatmatesCount },
        { name: "Misc", value: activeMisc / flatmatesCount },
      ].filter((d) => d.value > 0),
    [activeMaintenance, activeGroceries, activeElectricity, activeWifi, activeMaid, activeGas, activeWater, activeMisc, ppRent, viewingIndex, flatmatesCount],
  );

  const moveInPieData = useMemo(
    () =>
      [
        { name: "First Month Rent", value: ppRent(viewingIndex) },
        { name: "Deposit", value: ppDeposit(viewingIndex) },
        { name: "Brokerage", value: ppBrokerage(viewingIndex) },
        { name: "Setup Costs", value: ppSetup },
        { name: "Utilities", value: ppUtilities },
      ].filter((d) => d.value > 0),
    [ppRent, ppDeposit, ppBrokerage, ppSetup, ppUtilities, viewingIndex],
  );

  const cumulativeData = useMemo(
    () => {
      let total = 0;
      return Array.from({ length: 12 }, (_, i) => {
        total += i === 0 ? vPpMoveIn : vPpRecurring;
        return { name: `M${i + 1}`, cumulative: Math.round(total) };
      });
    },
    [vPpMoveIn, vPpRecurring],
  );

  /* ── helpers ── */
  const numChange = useCallback(
    (setter: (v: number) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setter(Number(e.target.value) || 0),
    [],
  );

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const breakdownData = flatmates.map((f, i) => ({
      "Name": f.name,
      "Monthly Rent": ppRent(i),
      "Utilities": ppUtilities,
      "Total Recurring": ppRecurring(i),
      "Deposit": ppDeposit(i),
      "Brokerage": ppBrokerage(i),
      "Setup Share": ppSetup,
      "Total Move-In": ppMoveIn(i),
      "Setup Balance": setupBalances[f.id] || 0
    }));
    const ws1 = XLSX.utils.json_to_sheet(breakdownData);
    XLSX.utils.book_append_sheet(wb, ws1, "Per Person Breakdown");

    const checklistData = setupItems.map(item => ({
      "Item": item.name,
      "Cost": item.cost,
      "Paid By": item.paidBy === "all" ? "Everyone (Split)" : flatmates.find(f => f.id === item.paidBy)?.name || item.paidBy
    }));
    const ws2 = XLSX.utils.json_to_sheet(checklistData);
    XLSX.utils.book_append_sheet(wb, ws2, "Move-In Checklist");

    XLSX.writeFile(wb, "Flatbudget_Export.xlsx");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    } catch (err) {
      alert("Failed to copy link");
    }
  };

  const printPDF = () => {
    window.print();
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

  /* ── JSX ── */
  return (
    <div className="print-friendly">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          .print-friendly { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
        }
      `}} />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
      >
        {/* ═══════════════ LEFT COLUMN ═══════════════ */}
        <div className="lg:col-span-5 space-y-5 no-print">
          
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Parameters</h2>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={copyLink} className="h-8 gap-1.5 text-xs text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100">
                <ShareNetwork className="w-4 h-4" /> Share Link
              </Button>
              <Button size="sm" variant="outline" onClick={exportExcel} className="h-8 gap-1.5 text-xs text-green-600 border-green-200 bg-green-50 hover:bg-green-100">
                <FileXls className="w-4 h-4" /> Excel
              </Button>
              <Button size="sm" variant="outline" onClick={printPDF} className="h-8 gap-1.5 text-xs text-slate-600 border-slate-200 bg-white hover:bg-slate-50">
                <FilePdf className="w-4 h-4" /> PDF
              </Button>
            </div>
          </div>

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

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      Flatmates & Rent Split
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFlatmates([...flatmates, { id: uuidv4(), name: `Roommate ${flatmates.length + 1}`, rentMode: "equal", rentValue: 0 }])}
                      className="h-6 text-xs text-teal-600 px-2 hover:bg-teal-50"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {flatmates.map((f, i) => (
                      <div key={f.id} className="flex flex-wrap items-center gap-2 bg-slate-50/50 p-2 rounded-md border border-slate-100">
                        <Input
                          value={f.name}
                          onChange={(ev) => {
                            const newF = [...flatmates];
                            newF[i].name = ev.target.value;
                            setFlatmates(newF);
                          }}
                          className="h-8 text-xs bg-white w-[110px]"
                          placeholder="Name"
                        />
                        <Select
                          value={f.rentMode}
                          onValueChange={(v) => {
                            if (!v) return;
                            const newF = [...flatmates];
                            newF[i].rentMode = v as RentMode;
                            setFlatmates(newF);
                          }}
                        >
                          <SelectTrigger className="w-[95px] h-8 text-xs bg-white border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equal">Equal</SelectItem>
                            <SelectItem value="percent">% Share</SelectItem>
                            <SelectItem value="amount">₹ Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        {f.rentMode !== "equal" ? (
                          <Input
                            type="number"
                            value={f.rentValue || ""}
                            onChange={(ev) => {
                              const newF = [...flatmates];
                              newF[i].rentValue = Number(ev.target.value) || 0;
                              setFlatmates(newF);
                            }}
                            className="w-[80px] h-8 text-xs bg-white"
                            placeholder={f.rentMode === "percent" ? "30" : "15000"}
                          />
                        ) : (
                          <div className="w-[80px] h-8 flex items-center justify-center text-[11px] text-slate-400 bg-slate-50 rounded-md border border-slate-100">
                            {fmt(ppRent(i))}
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 ml-auto"
                          onClick={() => {
                            if (flatmates.length <= 1) return;
                            const newF = flatmates.filter((_, idx) => idx !== i);
                            setFlatmates(newF);
                            if (viewingFlatmateId === f.id && newF.length > 0) {
                              setViewingFlatmateId(newF[0].id);
                            }
                          }}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
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

                <div className={`space-y-3 pt-3 border-t border-slate-100 transition-opacity ${!e.setup ? "opacity-40" : ""}`}>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Switch size="sm" checked={e.setup} onCheckedChange={() => toggle("setup")} />
                      <Truck className="w-4 h-4 text-slate-400" />
                      <span className={!e.setup ? "line-through" : ""}>Move-In Checklist</span>
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!e.setup}
                      onClick={() => setSetupItems([...setupItems, { id: uuidv4(), name: "", cost: 0, paidBy: "all" }])}
                      className="h-6 text-xs text-indigo-600 px-2 hover:bg-indigo-50"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Item
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {setupItems.map((item, i) => (
                      <div key={item.id} className="flex flex-wrap items-center gap-2 bg-slate-50/50 p-2 rounded-md border border-slate-100">
                        <Input
                          value={item.name}
                          disabled={!e.setup}
                          onChange={(ev) => {
                            const newItems = [...setupItems];
                            newItems[i].name = ev.target.value;
                            setSetupItems(newItems);
                          }}
                          className="h-8 text-xs bg-white w-[130px]"
                          placeholder="Item Name"
                        />
                        <div className="relative w-[90px]">
                          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-400 text-xs">₹</span>
                          <Input
                            type="number"
                            value={item.cost || ""}
                            disabled={!e.setup}
                            onChange={(ev) => {
                              const newItems = [...setupItems];
                              newItems[i].cost = Number(ev.target.value) || 0;
                              setSetupItems(newItems);
                            }}
                            className="h-8 pl-5 text-xs bg-white"
                            placeholder="Cost"
                          />
                        </div>
                        <Select
                          value={item.paidBy}
                          disabled={!e.setup}
                          onValueChange={(v) => {
                            if (!v) return;
                            const newItems = [...setupItems];
                            newItems[i].paidBy = v;
                            setSetupItems(newItems);
                          }}
                        >
                          <SelectTrigger className="w-[100px] h-8 text-xs bg-white border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Split equal</SelectItem>
                            {flatmates.map(f => (
                              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={!e.setup}
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 ml-auto"
                          onClick={() => {
                            const newItems = setupItems.filter((_, idx) => idx !== i);
                            setSetupItems(newItems);
                          }}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="text-right text-[11px] font-semibold text-slate-500 mt-2">
                    Total Setup Cost: <span className="text-indigo-600 text-xs ml-1">{fmt(activeSetup)}</span>
                  </div>
                </div>

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
                <div className="flex items-end gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
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
                    <Select value={maintenanceFreq} onValueChange={(v) => { if (v) setMaintenanceFreq(v); }} disabled={!e.maintenance}>
                      <SelectTrigger className="h-9 bg-white border-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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

                <div className="w-full border-t border-slate-100 mt-2">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById("extra-utils");
                        if (el) {
                          el.style.display = el.style.display === "none" ? "block" : "none";
                        }
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                    >
                      Show more utilities (Gas, Water, Misc)
                    </button>
                  </div>
                  <div id="extra-utils" style={{ display: "none" }} className="grid grid-cols-3 gap-3 pt-1">
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
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ═══════════════ RIGHT COLUMN (RESULTS) ═══════════════ */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <PiggyBank className="w-48 h-48 text-white" weight="duotone" />
            </div>
            
            <CardHeader className="pb-2 border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-white/90">
                  <Wallet className="w-5 h-5 text-teal-400" />
                  Your Budget Dashboard
                </CardTitle>
                <Select value={viewingFlatmateId} onValueChange={(v) => { if (v) setViewingFlatmateId(v); }}>
                  <SelectTrigger className="w-[140px] h-8 bg-white/10 border-white/20 text-white text-xs">
                    <SelectValue placeholder="Viewing as..." />
                  </SelectTrigger>
                  <SelectContent>
                    {flatmates.map(f => (
                      <SelectItem key={f.id} value={f.id}>Viewing: {f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 relative z-10">
              <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-8">
                <div>
                  <div className="text-[11px] text-indigo-200 flex items-center gap-1">
                    <Sparkle weight="fill" className="w-3.5 h-3.5" />
                    Month 1 Cost ({flatmates.find(f=>f.id===viewingFlatmateId)?.name || 'You'})
                  </div>
                  <div className="text-3xl font-bold mt-1 text-white">{fmt(vPpMoveIn)}</div>
                  <div className="text-xs text-indigo-200 mt-1 flex items-center gap-1 opacity-80">
                    Move-in + recurring
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-teal-200 flex items-center gap-1">
                    <ArrowsClockwise weight="fill" className="w-3.5 h-3.5" />
                    Ongoing Monthly ({flatmates.find(f=>f.id===viewingFlatmateId)?.name || 'You'})
                  </div>
                  <div className="text-3xl font-bold mt-1 text-white">{fmt(vPpRecurring)}</div>
                  <div className="text-xs text-teal-200 mt-1 flex items-center gap-1 opacity-80">
                    <ArrowDown className="w-3 h-3" />
                    Drops {savingsPct}% after Month 1
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Total Flat Move-In
                  </div>
                  <div className="text-lg font-medium text-slate-200">{fmt(totalMoveIn)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                    Total Flat Ongoing
                  </div>
                  <div className="text-lg font-medium text-slate-200">{fmt(totalRecurring)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visualizations */}
          <Card className="shadow-sm border-slate-100/80">
            <Tabs defaultValue="timeline" className="w-full">
              <CardHeader className="pb-0 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-[15px] flex items-center gap-2 text-slate-800">
                  <ChartBar className="w-[18px] h-[18px] text-blue-500" weight="duotone" />
                  Visualizations
                </CardTitle>
                <TabsList className="bg-slate-50 h-9 p-1">
                  <TabsTrigger value="timeline" className="text-xs px-3">Timeline</TabsTrigger>
                  <TabsTrigger value="breakdown" className="text-xs px-3">Split</TabsTrigger>
                  <TabsTrigger value="cumulative" className="text-xs px-3">Cumulative</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="timeline" className="mt-0">
                  <p className="text-xs text-slate-400 mb-3">Your personal expense across 12 months — see the Month 1 spike.</p>
                  <div className="h-56 sm:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <BarChart data={timelineData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
                        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={fmtShort} fontSize={11} />
                        <RTooltip 
                          cursor={{ fill: '#f8fafc' }} 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: any) => [fmt(Number(value) || 0), "Amount"]} 
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {timelineData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="breakdown" className="mt-0">
                  <p className="text-xs text-slate-400 mb-3">How your recurring monthly total splits across categories.</p>
                  <div className="h-56 sm:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: any) => fmt(Number(value) || 0)} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="cumulative" className="mt-0">
                  <p className="text-xs text-slate-400 mb-3">Your cumulative spend over 12 months.</p>
                  <div className="h-56 sm:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                      <AreaChart data={cumulativeData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
                        <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={fmtShort} fontSize={11} />
                        <RTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: any) => [fmt(Number(value) || 0), "Total Paid"]} 
                        />
                        <Area type="monotone" dataKey="cumulative" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#gradArea)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Details Table */}
          <Card className="shadow-sm border-slate-100/80">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-[15px] flex items-center justify-between text-slate-800">
                <div className="flex items-center gap-2">
                  <Receipt className="w-[18px] h-[18px] text-indigo-500" weight="duotone" />
                  Your Cost Breakdown
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Category</th>
                      <th className="px-4 py-3 text-right font-medium">Month 1</th>
                      <th className="px-4 py-3 text-right font-medium">Ongoing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-[13px]">
                    <Row label="Rent" m1={ppRent(viewingIndex)} m2={ppRent(viewingIndex)} off={!e.rent} />
                    <Row label="Security Deposit" sub="Refundable" m1={ppDeposit(viewingIndex)} off={!e.deposit} />
                    <Row label="Brokerage" m1={ppBrokerage(viewingIndex)} off={!e.brokerage} />
                    <Row label="Setup & Movers" m1={ppSetup} off={!e.setup} />
                    <Row
                      label="Maintenance"
                      sub={maintenanceFreq === "yearly" ? "Yearly → monthly" : undefined}
                      m1={activeMaintenance / flatmatesCount}
                      m2={activeMaintenance / flatmatesCount}
                      off={!e.maintenance}
                    />
                    <Row label="Groceries" m1={activeGroceries / flatmatesCount} m2={activeGroceries / flatmatesCount} off={!e.groceries} />
                    <Row label="Electricity" m1={activeElectricity / flatmatesCount} m2={activeElectricity / flatmatesCount} off={!e.electricity} />
                    <Row label="Wi-Fi" m1={activeWifi / flatmatesCount} m2={activeWifi / flatmatesCount} off={!e.wifi} />
                    <Row label="Maid / Cook" m1={activeMaid / flatmatesCount} m2={activeMaid / flatmatesCount} off={!e.maid} />
                    {(gas > 0 || water > 0 || miscMonthly > 0) && (
                      <Row
                        label="Other"
                        sub="Gas, Water, Misc"
                        m1={(activeGas + activeWater + activeMisc) / flatmatesCount}
                        m2={(activeGas + activeWater + activeMisc) / flatmatesCount}
                        off={!e.gas && !e.water && !e.misc}
                      />
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-100">
                    <tr>
                      <td className="px-4 py-3 text-slate-800 font-semibold">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-600">{fmt(vPpMoveIn)}</td>
                      <td className="px-4 py-3 text-right font-bold text-teal-600">{fmt(vPpRecurring)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {/* Who Owes Who for Setup Costs */}
          {e.setup && setupItems.length > 0 && (
            <Card className="shadow-sm border-slate-100/80">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-[15px] flex items-center gap-2 text-slate-800">
                  <ListChecks className="w-[18px] h-[18px] text-amber-500" weight="duotone" />
                  Move-In "Who Owes Who"
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500 mb-4">
                  Based on the move-in checklist. Negative means you owe money to the flat, positive means the flat owes you!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {flatmates.map(f => {
                    const bal = setupBalances[f.id] || 0;
                    return (
                      <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white shadow-sm">
                        <span className="text-sm font-medium text-slate-700">{f.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={`font-semibold border-0 ${bal > 0 ? "bg-green-50 text-green-700" : bal < 0 ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}
                        >
                          {bal > 0 ? `+${fmt(bal)}` : bal < 0 ? `-${fmt(Math.abs(bal))}` : "Settled"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </motion.div>
    </div>
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
