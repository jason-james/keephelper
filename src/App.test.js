import React from "react";
import ReactDOM from "react-dom";
import RandomBeacon from "./views/RandomBeacon";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<RandomBeacon />, div);
});
