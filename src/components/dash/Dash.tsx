import * as React from "react";

interface IDashProps {
  readonly exact: boolean;
  readonly isAuthenticated: boolean;
  readonly path: string;
  readonly currentLocation: string;
}

export default function Dash({ ...rest }: IDashProps) {
  return (
    <div>
        Dash
    </div>
  );
}