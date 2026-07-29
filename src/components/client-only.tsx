import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only on the client-side.
 * @param {object} props
 * @param {React.ReactNode} props.children The children to render on the client.
 * @param {React.ReactNode} [props.fallback=null] The fallback to render on the server.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <>{children}</> : fallback;
}
