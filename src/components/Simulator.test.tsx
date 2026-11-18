import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Simulator } from "./Simulator";
import { simulate, parseBRL, formatBRL } from "@/lib/simulator";

describe("Simulator", () => {
  const STORAGE_KEY = "esolution-simulation";

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("renders without crashing", () => {
    render(<Simulator />);
    expect(screen.getByText("Quanto você economizaria?")).toBeInTheDocument();
    expect(screen.getByLabelText("Valor médio da sua conta mensal")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Exemplo: 350,00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /calcular economia/i })).toBeInTheDocument();
  });

  it("shows dash when no result", () => {
    render(<Simulator />);
    const dash = "—";
    // There should be 5 dashes: 1 for economiaAnual + 4 for the detail items
    const dashes = screen.getAllByText(dash);
    expect(dashes.length).toBe(5);
  });

  it("shows result when calcValor > 0", async () => {
    render(<Simulator />);
    const input = screen.getByPlaceholderText("Exemplo: 350,00");
    const button = screen.getByRole("button", { name: /calcular economia/i });

    const user = userEvent.setup();
    await user.type(input, "738,57");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("R$ 6.418,69")).toBeInTheDocument(); // economiaAnual
      expect(screen.getByText("R$ 534,89")).toBeInTheDocument(); // economiaMensal
      expect(screen.getByText("R$ 203,68")).toBeInTheDocument(); // novaContaMensal
      expect(screen.getByText("R$ 2.444,15")).toBeInTheDocument(); // novaContaAnual
      expect(screen.getByText("750 kWh/mês")).toBeInTheDocument(); // consumo
    });
  }, 10000);

  it("saves simulation to localStorage", async () => {
    render(<Simulator />);
    const input = screen.getByPlaceholderText("Exemplo: 350,00");
    const button = screen.getByRole("button", { name: /calcular economia/i });

    const user = userEvent.setup();
    await user.type(input, "738,57");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("R$ 6.418,69")).toBeInTheDocument();
    });

    // Check localStorage was called
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).toBeTruthy();

    const data = JSON.parse(stored!);
    expect(data.valor).toBe("738,57");
    expect(data.calcValor).toBe(738.57);
    expect(data.result).toBeDefined();
    expect(data.result.economiaAnual).toBeCloseTo(6418.69, 1);
    expect(data.timestamp).toBeDefined();
  }, 10000);

  it("loads simulation from localStorage on mount", async () => {
    // Pre-populate localStorage
    const mockResult = simulate(738.57);
    const storedData = {
      valor: "738,57",
      calcValor: 738.57,
      result: mockResult,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));

    render(<Simulator />);

    await waitFor(() => {
      expect(screen.getByText("R$ 6.418,69")).toBeInTheDocument();
      expect(screen.getByText("R$ 534,89")).toBeInTheDocument();
      expect(screen.getByText("R$ 203,68")).toBeInTheDocument();
      expect(screen.getByText("R$ 2.444,15")).toBeInTheDocument();
      expect(screen.getByText("750 kWh/mês")).toBeInTheDocument();
    });

    // Verify input shows the stored value
    const input = screen.getByPlaceholderText("Exemplo: 350,00");
    expect(input).toHaveValue("738,57");
  }, 10000);

  it("does not load expired simulation from localStorage", async () => {
    // Pre-populate localStorage with expired data (25 hours old)
    const mockResult = simulate(738.57);
    const storedData = {
      valor: "738,57",
      calcValor: 738.57,
      result: mockResult,
      timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));

    render(<Simulator />);

    // Should show dashes, not the expired result
    await waitFor(() => {
      const dash = "—";
      const dashes = screen.getAllByText(dash);
      expect(dashes.length).toBe(5);
    });

    // localStorage should be cleared
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  }, 10000);

  it("clears simulation and localStorage when clear button clicked", async () => {
    render(<Simulator />);
    const input = screen.getByPlaceholderText("Exemplo: 350,00");
    const button = screen.getByRole("button", { name: /calcular economia/i });

    const user = userEvent.setup();
    await user.type(input, "738,57");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("R$ 6.418,69")).toBeInTheDocument();
    });

    // Click clear button
    const clearButton = screen.getByRole("button", { name: /limpar simulação/i });
    await user.click(clearButton);

    await waitFor(() => {
      const dash = "—";
      const dashes = screen.getAllByText(dash);
      expect(dashes.length).toBe(5);
    });

    // localStorage should be cleared
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    // Input should be empty
    expect(input).toHaveValue("");
  }, 10000);

  it("parses BRL input correctly", () => {
    expect(parseBRL("350,00")).toBe(350);
    expect(parseBRL("1.234,56")).toBe(1234.56);
    expect(parseBRL("738,57")).toBe(738.57);
    expect(parseBRL("R$ 350,00")).toBe(350);
    expect(parseBRL("")).toBeNaN();
    expect(parseBRL("abc")).toBeNaN();
  });

  it("formats BRL correctly", () => {
    expect(formatBRL(350)).toBe("R$ 350,00");
    expect(formatBRL(1234.56)).toBe("R$ 1.234,56");
    expect(formatBRL(6418.69)).toBe("R$ 6.418,69");
  });

  it("simulate function returns correct values", () => {
    const result = simulate(738.57);
    expect(result.consumoMensal).toBeCloseTo(750, 0);
    expect(result.economiaAnual).toBeCloseTo(6418.69, 1);
    expect(result.economiaMensal).toBeCloseTo(534.89, 1);
    expect(result.novaContaMensal).toBeCloseTo(203.68, 1);
    expect(result.novaContaAnual).toBeCloseTo(2444.15, 1);
  });

  it("button is disabled when input is empty or invalid", async () => {
    render(<Simulator />);
    const button = screen.getByRole("button", { name: /calcular economia/i });
    const input = screen.getByPlaceholderText("Exemplo: 350,00");

    expect(button).toBeDisabled();

    const user = userEvent.setup();
    await user.type(input, "abc");
    expect(button).toBeDisabled();

    await user.clear(input);
    await user.type(input, "100,00");
    expect(button).not.toBeDisabled();
  });

  it("generates correct WhatsApp link with result", async () => {
    render(<Simulator />);
    const input = screen.getByPlaceholderText("Exemplo: 350,00");
    const button = screen.getByRole("button", { name: /calcular economia/i });

    const user = userEvent.setup();
    await user.type(input, "738,57");
    await user.click(button);

    await waitFor(() => {
      const waLink = screen.getByRole("link", { name: /quero esse orçamento no whatsapp/i });
      expect(waLink).toHaveAttribute("href");
      expect(waLink).toHaveAttribute("href", expect.stringContaining("wa.me/5585921035492"));
      // The message includes the formatted value with R$ prefix
      expect(waLink).toHaveAttribute("href", expect.stringContaining("R%24%20738%2C57"));
      expect(waLink).toHaveAttribute("href", expect.stringContaining("6.418%2C69"));
    });
  }, 10000);
});
