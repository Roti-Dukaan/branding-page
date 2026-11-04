"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@shop/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [disabled]);

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (disabled) return;
      if (!/^\d*$/.test(digit)) return;

      const newValue = value.split("");
      newValue[index] = digit;
      const result = newValue.join("").slice(0, length);
      onChange(result);

      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
    },
    [value, onChange, length, disabled]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Backspace" && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
        const newValue = value.split("");
        newValue[index - 1] = "";
        onChange(newValue.join(""));
      }
    },
    [value, onChange, disabled]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      onChange(pasted);
      if (pasted.length > 0) {
        const focusIdx = Math.min(pasted.length, length - 1);
        inputRefs.current[focusIdx]?.focus();
        setFocusedIndex(focusIdx);
      }
    },
    [onChange, length, disabled]
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length }, (_, i) => (
        <motion.div
          key={i}
          animate={focusedIndex === i ? { scale: 1.05 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <input
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ""}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(i)}
            className={cn(
              "w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none",
              value[i]
                ? "border-primary bg-primary/5 text-foreground"
                : focusedIndex === i
                ? "border-primary ring-2 ring-primary/20 bg-background"
                : "border-border bg-muted/50 text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label={`Digit ${i + 1}`}
          />
        </motion.div>
      ))}
    </div>
  );
}
