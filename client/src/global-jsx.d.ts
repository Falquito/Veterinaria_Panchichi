// Acepta cualquier import *.jsx como un componente React
declare module "*.jsx" {
  import React from "react";
  const Component: React.ComponentType<any>;
  export default Component;
}
