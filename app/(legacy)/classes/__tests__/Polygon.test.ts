import { describe, it, expect, beforeEach } from "vitest";

import { LogType } from "../Logger";
import Polygon from "../Polygon";

const WARNING_COUNT = 100000;
const ERROR_COUNT = 300000;

describe("Polygon", () => {
  let polygon: Polygon;
  beforeEach(() => {
    polygon = new Polygon();
  });

  it("No polygons", () => {
    polygon.polygonCount = 0;
    const logs = polygon.validate();
    expect(logs.length).toBe(0);
  });

  it("Few polygons", () => {
    polygon.polygonCount = 50000;
    const logs = polygon.validate();
    expect(logs.length).toBe(0);
  })

  it("Polygon count at warning threshold", () => {
    polygon.polygonCount = WARNING_COUNT;
    const logs = polygon.validate();
    expect(logs.length).toBe(0);
  });

  it("Polygon count above warning threshold", () => {
    polygon.polygonCount = WARNING_COUNT + 1;
    const logs = polygon.validate();
    expect(logs.length).toBe(1);
    expect(logs[0].logType).toBe(LogType.WARNING);
  });

  it("Polygon count at error threshold", () => {
    polygon.polygonCount = ERROR_COUNT;
    const logs = polygon.validate();
    expect(logs.length).toBe(1);
    expect(logs[0].logType).toBe(LogType.WARNING);
  });

  it("Polygon count above error threshold", () => {
    polygon.polygonCount = ERROR_COUNT + 1;
    const logs = polygon.validate();
    expect(logs.length).toBe(1);
    expect(logs[0].logType).toBe(LogType.ERROR);
  });

  it("Polygon count significantly above error threshold", () => {
    polygon.polygonCount = ERROR_COUNT * 2;
    const logs = polygon.validate();
    expect(logs.length).toBe(1);
    expect(logs[0].logType).toBe(LogType.ERROR);
  });
});