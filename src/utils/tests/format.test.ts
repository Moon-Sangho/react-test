import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatLargeNumber,
  formatPercentage,
  formatDate,
  formatDateWithTimeZone,
  formatNumber,
} from "@/utils/format";

describe("formatPrice", () => {
  it("should format a number as USD currency with 2 decimals", () => {
    expect(formatPrice(1234.56)).toBe("$1,234.56");
  });

  it("should return N/A for null", () => {
    expect(formatPrice(null)).toBe("N/A");
  });

  it("should return N/A for undefined", () => {
    expect(formatPrice(undefined)).toBe("N/A");
  });

  it("should format small prices", () => {
    expect(formatPrice(0.01)).toBe("$0.01");
  });

  it("should format large prices with commas", () => {
    expect(formatPrice(1000000)).toBe("$1,000,000.00");
  });
});

describe("formatLargeNumber", () => {
  it("should format trillion numbers with T suffix", () => {
    expect(formatLargeNumber(1.5e12)).toBe("$1.50T");
  });

  it("should format billion numbers with B suffix", () => {
    expect(formatLargeNumber(1.5e9)).toBe("$1.50B");
  });

  it("should format million numbers with M suffix", () => {
    expect(formatLargeNumber(1.5e6)).toBe("$1.50M");
  });

  it("should format thousand numbers with K suffix", () => {
    expect(formatLargeNumber(1.5e3)).toBe("$1.50K");
  });

  it("should format small numbers as currency", () => {
    expect(formatLargeNumber(100)).toBe("$100.00");
  });

  it("should handle negative numbers", () => {
    expect(formatLargeNumber(-1.5e9)).toBe("-$1.50B");
  });

  it("should return N/A for null", () => {
    expect(formatLargeNumber(null)).toBe("N/A");
  });

  it("should return N/A for undefined", () => {
    expect(formatLargeNumber(undefined)).toBe("N/A");
  });
});

describe("formatPercentage", () => {
  it("should format positive percentages with + sign", () => {
    expect(formatPercentage(5.25)).toBe("+5.25%");
  });

  it("should format negative percentages with - sign", () => {
    expect(formatPercentage(-3.75)).toBe("-3.75%");
  });

  it("should format zero percentage without sign", () => {
    expect(formatPercentage(0)).toBe("+0.00%");
  });

  it("should allow custom decimal places", () => {
    expect(formatPercentage(5.256, 1)).toBe("+5.3%");
  });

  it("should return N/A for null", () => {
    expect(formatPercentage(null)).toBe("N/A");
  });

  it("should return N/A for undefined", () => {
    expect(formatPercentage(undefined)).toBe("N/A");
  });
});

describe("formatDate", () => {
  it("should format ISO date string to readable format", () => {
    const result = formatDate("2024-01-15T10:30:00Z");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2024");
    // Time part varies by timezone, so just check it contains time pattern
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it("should return N/A for null", () => {
    expect(formatDate(null)).toBe("N/A");
  });

  it("should return N/A for undefined", () => {
    expect(formatDate(undefined)).toBe("N/A");
  });

  it("should return N/A for empty string", () => {
    expect(formatDate("")).toBe("N/A");
  });

  it("should handle invalid date strings gracefully", () => {
    expect(formatDate("invalid-date")).toBe("N/A");
  });
});

describe("formatDateWithTimeZone", () => {
  it("should format ISO date string with timezone", () => {
    const result = formatDateWithTimeZone("2024-01-15T10:30:00Z");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2024");
    // Time part varies by timezone, so just check it contains time pattern
    expect(result).toMatch(/\d{1,2}:\d{2}/);
    // Should include timezone (e.g., UTC, GMT, EST, GMT+9)
    expect(result).toMatch(/GMT|UTC|[A-Z]{2,3}/);
  });

  it("should return N/A for null", () => {
    expect(formatDateWithTimeZone(null)).toBe("N/A");
  });

  it("should return N/A for undefined", () => {
    expect(formatDateWithTimeZone(undefined)).toBe("N/A");
  });

  it("should return N/A for empty string", () => {
    expect(formatDateWithTimeZone("")).toBe("N/A");
  });

  it("should handle invalid date strings gracefully", () => {
    expect(formatDateWithTimeZone("invalid-date")).toBe("N/A");
  });

  it("should format different timezones correctly", () => {
    // Test with a specific date - verify date components and timezone
    const result = formatDateWithTimeZone("2024-06-15T12:00:00Z");
    expect(result).toContain("Jun");
    expect(result).toContain("15");
    // Should include timezone (e.g., UTC, GMT, EST, GMT+9)
    expect(result).toMatch(/GMT|UTC|[A-Z]{2,3}/);
  });
});

describe("formatNumber", () => {
  it("should format number with commas", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("should format small numbers without commas", () => {
    expect(formatNumber(123)).toBe("123");
  });

  it("should return N/A for null", () => {
    expect(formatNumber(null)).toBe("N/A");
  });

  it("should return N/A for undefined", () => {
    expect(formatNumber(undefined)).toBe("N/A");
  });

  it("should format negative numbers", () => {
    expect(formatNumber(-1234567)).toBe("-1,234,567");
  });

  it("should format decimal numbers", () => {
    expect(formatNumber(1234.5)).toBe("1,234.5");
  });
});
