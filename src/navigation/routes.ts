export const routes = {
  home: "/",

  auth: {
    login: "/login",
    signup: "/signup",
  },

  dashboard: "/dashboard",

  store: {
    pos:          (id: string) => `/dashboard/store/${id}/point-of-sale`,
    products:     (id: string) => `/dashboard/store/${id}/products`,
    inventory:    (id: string) => `/dashboard/store/${id}/inventory`,
    transactions: (id: string) => `/dashboard/store/${id}/transactions`,
  },
} as const;
