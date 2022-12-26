import { getItem, removeItem, setItem } from "../";

describe("LocalStorage", () => {
  it("should set key-value", () => {
    const mockKey = "mockKey";
    const mockData = "mockData";

    setItem(mockKey, mockData);
  });

  it("should set and get key-value", () => {
    const mockKey = "mockKey";
    const mockData = "mockData";

    setItem(mockKey, mockData);
    const retrieved = getItem(mockKey);

    expect(retrieved).toBe(mockData);
  });

  it("should set and delete key-value", () => {
    const mockKey = "mockKey";
    const mockData = "mockData";

    setItem(mockKey, mockData);
    removeItem(mockKey);
    const retrieved = getItem(mockKey);

    expect(retrieved).toBe(null);
  });

  it("should return null when JSON.parse has error", () => {
    const mockKey = "mockKey";

    const retrieved = getItem(mockKey);

    expect(retrieved).toBe(null);
  });
});
