"use client";

import { motion } from "motion/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@shop/components/ui/drawer";
import { Badge } from "@shop/components/ui/badge";
import { Button } from "@shop/components/ui/button";
import { MapPin, Rocket } from "lucide-react";

const CURRENT_PINCODE = "500089";
const COMING_SOON = [
  "Gachibowli",
  "Kondapur",
  "Madhapur",
  "Financial District",
  "Nallagandla",
  "Tellampur",
  "Kokapet",
  "Narsingi",
];

interface DeliveryCoverageDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeliveryCoverageDrawer({
  open,
  onOpenChange,
}: DeliveryCoverageDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[70vh] rounded-t-2xl">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Delivery Coverage
          </DrawerTitle>
          <DrawerDescription>
            Where we deliver fresh homemade meals right now.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-2 overflow-y-auto flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Coverage
              </h4>
              <Badge
                variant="secondary"
                className="text-[10px] px-2 py-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              >
                Live
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-border bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/10 dark:to-transparent">
                <p className="text-xs text-muted-foreground mb-1">City</p>
                <p className="font-semibold text-sm">Hyderabad</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/10 dark:to-transparent">
                <p className="text-xs text-muted-foreground mb-1">Pincode</p>
                <p className="font-semibold text-sm">{CURRENT_PINCODE}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Coming Soon
              </h4>
              <Badge
                variant="secondary"
                className="text-[10px] px-2 py-0 bg-primary/5 text-primary border border-primary/10"
              >
                More locations are being added every month
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMING_SOON.map((location, index) => (
                <motion.div
                  key={location}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="p-3 rounded-xl border border-border bg-muted/30 text-center"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {location}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <DrawerFooter>
          <p className="text-xs text-center text-muted-foreground">
            More locations are being added every month.
          </p>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
