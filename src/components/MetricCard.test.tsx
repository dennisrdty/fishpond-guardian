import { render, screen } from "@testing-library/react";
import { Thermometer } from "lucide-react";
import { describe, expect, it } from "vitest";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it.each(["normal", "large"] as const)("displays the reading and normal range at %s size", (size) => {
    render(
      <MetricCard
        title="Suhu Air"
        value="28.5"
        unit="°C"
        icon={Thermometer}
        status="normal"
        range="26–30 °C"
        size={size}
      />,
    );

    expect(screen.getByRole("heading", { name: "Suhu Air" })).toBeInTheDocument();
    expect(screen.getByText("28.5")).toBeInTheDocument();
    expect(screen.getByText("°C")).toBeInTheDocument();
    expect(screen.getByText(/Rentang normal:/)).toHaveTextContent("Rentang normal: 26–30 °C");
  });

  it.each([
    ["normal", "Normal"],
    ["warning", "Peringatan"],
    ["danger", "Bahaya"],
  ] as const)("displays the %s status as %s", (status, label) => {
    render(
      <MetricCard title="Suhu Air" value="28.5" unit="°C" icon={Thermometer} status={status} range="26–30 °C" />,
    );

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("updates the reading and status when new telemetry arrives", () => {
    const { rerender } = render(
      <MetricCard title="Suhu Air" value="28.5" unit="°C" icon={Thermometer} status="normal" range="26–30 °C" />,
    );

    rerender(
      <MetricCard title="Suhu Air" value="33.0" unit="°C" icon={Thermometer} status="danger" range="26–30 °C" />,
    );

    expect(screen.getByText("33.0")).toBeInTheDocument();
    expect(screen.getByText("Bahaya")).toBeInTheDocument();
    expect(screen.queryByText("28.5")).not.toBeInTheDocument();
    expect(screen.queryByText("Normal")).not.toBeInTheDocument();
  });
});
