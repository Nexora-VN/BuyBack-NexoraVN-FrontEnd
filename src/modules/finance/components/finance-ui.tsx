"use client";
export { ActionDialog } from "./finance-action-dialog";
export { columns, read, text, type Specs } from "./finance-columns";
export { Failure, Loading } from "./finance-states";
export { FinanceTable } from "./finance-table";
import dynamic from "next/dynamic";
export const MutationForm = dynamic(() =>
  import("./finance-mutation-form").then((module) => module.MutationForm),
);
