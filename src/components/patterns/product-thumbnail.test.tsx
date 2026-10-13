import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/use-copy", () => ({ useCopy: () => (value: string) => value }));

import { ProductThumbnail } from "./product-thumbnail";

describe("ProductThumbnail", () => {
  afterEach(cleanup);
  it("shows a fallback when the provider has no image", () => {
    render(<ProductThumbnail name="Sản phẩm A" src={null} />);
    expect(screen.getByLabelText("Chưa có ảnh sản phẩm")).toBeInTheDocument();
  });

  it("shows a fallback when the provider image fails to load", () => {
    render(<ProductThumbnail name="Sản phẩm A" src="https://example.com/broken.jpg" />);
    fireEvent.error(screen.getByAltText("Sản phẩm A"));
    expect(screen.getByLabelText("Chưa có ảnh sản phẩm")).toBeInTheDocument();
  });
});
