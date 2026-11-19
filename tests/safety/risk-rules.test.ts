import { describe, expect, it } from "vitest";
import cases from "./cases.json";
import { assessRisk } from "@/lib/safety/risk-rules";

describe("SafetyAgent risk rules", () => {
  for (const testCase of cases) {
    it(`${testCase.level}/${testCase.type}: ${testCase.text}`, () => {
      const result = assessRisk(testCase.text);
      expect(result.level).toBe(testCase.level);
      if (testCase.level > 0) {
        expect(result.type).toBe(testCase.type);
      }
    });
  }

  it("L2/L3 一律进入 crisis_intervention", () => {
    const result = assessRisk("我想自杀");
    expect(result.action).toBe("crisis_intervention");
  });

  it("未成年人触发 block_minor", () => {
    const result = assessRisk("我今年15岁");
    expect(result.action).toBe("block_minor");
  });

  it("医疗请求触发 refer_medical", () => {
    const result = assessRisk("能给我开点药吗");
    expect(result.action).toBe("refer_medical");
  });
});
