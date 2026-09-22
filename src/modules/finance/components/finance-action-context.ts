"use client";
import { createContext } from "react";
export const ActionContext = createContext<(() => void) | undefined>(undefined);
