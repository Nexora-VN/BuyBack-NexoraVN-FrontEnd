import { expect, it } from "vitest";
import { productItemId } from "./product-item-id";

it("prefers the order item ID and preserves bigint precision", () => {
  expect(productItemId("24093715534", "https://addlivetag.com/product/?item_id=123")).toBe(
    "24093715534",
  );
  expect(productItemId(24093715534)).toBe("24093715534");
  expect(productItemId("9007199254740993")).toBe("9007199254740993");
  expect(productItemId(9007199254740993)).toBeNull();
});

it.each([
  "https://addlivetag.com/product/?item_id=24093715534",
  "https://shopee.vn/product/635858058/24093715534",
  "https://shopee.vn/banh-trang-i.635858058.24093715534?sp_atk=test",
])("extracts the product ID from older order URL %s", (url) => {
  expect(productItemId(null, url)).toBe("24093715534");
});

it.each([
  "https://example.com/?item_id=123",
  "https://shopee.vn.example.com/product/1/123",
  "javascript:alert(1)",
  "not a URL",
])("ignores unrelated or invalid URL %s", (url) => {
  expect(productItemId(null, url)).toBeNull();
});

it.each(["0", "-123", "9223372036854775808", {}, null])("rejects an invalid product ID", (id) => {
  expect(productItemId(id)).toBeNull();
});
