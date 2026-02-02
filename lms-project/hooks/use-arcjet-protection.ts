import { useEffect } from "react";

export function useArcjetProtection() {
  useEffect(() => {
    // Check bot protection on client-side for high-value actions
    const checkBotProtection = async () => {
      try {
        const response = await fetch("/api/middleware", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.warn("Bot protection check failed");
        }
      } catch (error) {
        console.error("Failed to check bot protection:", error);
      }
    };

    // Call on mount and periodically
    checkBotProtection();
  }, []);
}
