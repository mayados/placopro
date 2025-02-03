import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("Home Page", () => {
  it("check for relevant text", () => {
    // const { getByText } = render(<Home />);
    render(<Home />);

    expect(screen.getByText(/Get started by editing/i)).toBeInTheDocument();

    // console.log(screen.queryByText(/Get started by editing/i));

    // expect(getByText("Get started by editing")).toBeInTheDocument();

  });
});