import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ChatComposer } from "@/app/chat/[id]/client";

describe("ChatComposer", () => {
  it("renders textarea and send button", () => {
    render(<ChatComposer chatId="c1" />);
    expect(screen.getByPlaceholderText(/พิมพ์ข้อความ/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ส่ง" })).toBeInTheDocument();
  });
});


