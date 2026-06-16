const fs = require('fs');
let code = fs.readFileSync('src/components/BudgetTracker.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  'import { motion, AnimatePresence } from "framer-motion";',
  `import { motion, AnimatePresence } from "framer-motion";
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
};`
);

fs.writeFileSync('src/components/BudgetTracker.tsx', code);
console.log("Patch 1 applied");
