import { renderUI } from "@/test/render";
import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

it("describes a settled commission without claiming a bank withdrawal", () => {
  renderUI(<StatusBadge domain="commission" status="PAID" />);
  expect(screen.getByText("Đã quyết toán")).toBeInTheDocument();
  expect(screen.queryByText(/Đã rút tiền|Đã chuyển tiền/)).not.toBeInTheDocument();
});
