import type { Config } from "tailwindcss";

/**
 * Apple 디자인 분석(DESIGN-apple.md) 토큰을 그대로 옮긴 설정.
 * - 강조색은 Action Blue 하나뿐이다. 두 번째 브랜드 색을 추가하지 않는다.
 * - 그림자는 시스템에 존재하지 않는다(면 전환 + 헤어라인으로 깊이를 만든다).
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        action: {
          DEFAULT: "#0066cc",
          focus: "#0071e3",
          ondark: "#2997ff",
        },
        ink: {
          DEFAULT: "#1d1d1f",
          80: "#333333",
          48: "#7a7a7a",
        },
        canvas: {
          DEFAULT: "#ffffff",
          parchment: "#f5f5f7",
          pearl: "#fafafc",
        },
        tile: {
          1: "#272729",
          2: "#2a2a2c",
          3: "#252527",
        },
        hairline: "#e0e0e0",
        "divider-soft": "#f0f0f0",
        chip: "#d2d2d7",
        /* 의미색 — 강조가 아니라 상태 표시에만 아주 소극적으로 쓴다 */
        good: "#1d7a3e",
        warn: "#8a6100",
        bad: "#a3352b",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "system-ui",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
        display: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "system-ui",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      fontSize: {
        hero: ["3.5rem", { lineHeight: "1.07", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-lg": ["2.5rem", { lineHeight: "1.12", letterSpacing: "-0.018em", fontWeight: "600" }],
        "display-md": ["2.125rem", { lineHeight: "1.25", letterSpacing: "-0.018em", fontWeight: "600" }],
        lead: ["1.75rem", { lineHeight: "1.25", letterSpacing: "-0.012em", fontWeight: "400" }],
        "lead-airy": ["1.5rem", { lineHeight: "1.5", letterSpacing: "-0.008em", fontWeight: "300" }],
        tagline: ["1.3125rem", { lineHeight: "1.35", letterSpacing: "-0.008em", fontWeight: "600" }],
        body: ["1.0625rem", { lineHeight: "1.62", letterSpacing: "-0.011em" }],
        "body-sm": ["1rem", { lineHeight: "1.6", letterSpacing: "-0.011em" }],
        caption: ["0.875rem", { lineHeight: "1.5", letterSpacing: "-0.008em" }],
        fine: ["0.75rem", { lineHeight: "1.4", letterSpacing: "-0.006em" }],
      },
      borderRadius: {
        xs: "5px",
        sm: "8px",
        md: "11px",
        lg: "18px",
        pill: "9999px",
      },
      spacing: {
        section: "80px",
        "section-sm": "48px",
      },
      maxWidth: {
        reading: "760px",
        content: "980px",
        wide: "1440px",
      },
      boxShadow: {
        /* 시스템 전체에서 단 하나뿐인 그림자. 물체(카드가 아니라 이미지/시트)에만 쓴다. */
        object: "rgba(0, 0, 0, 0.22) 3px 5px 30px 0",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "bar-grow": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 240ms cubic-bezier(0.32, 0.72, 0, 1)",
        "bar-grow": "bar-grow 520ms cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
