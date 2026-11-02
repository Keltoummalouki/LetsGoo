import type { ComponentProps } from "react";
import "./dropdown.css";

export function Dropdown({ className, ...props }: ComponentProps<"select">) {
  return <select {...props} className={["dropdown", className].filter(Boolean).join(" ")} />;
}
