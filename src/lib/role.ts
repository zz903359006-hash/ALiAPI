function getSession(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return sessionStorage.getItem(key) ?? fallback;
}

export const userRole: "Admin" | "Employee" = getSession("userRole", "Admin") as "Admin" | "Employee";
export const isEmployee = userRole === "Employee";
export const currentUser = getSession("currentUser", "张明");
