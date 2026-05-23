export const routes = {
  home: "/",

  auth: {
    login: "/login",
    signup: "/signup",
  },

  dashboard: "/dashboard",

  store: {
    dashboard:    (id: string) => `/dashboard/store/${id}/dashboard`,
    pos:          (id: string) => `/dashboard/store/${id}/point-of-sale`,
    products:     (id: string) => `/dashboard/store/${id}/products`,
    categories:   (id: string) => `/dashboard/store/${id}/categories`,
    inventory:    (id: string) => `/dashboard/store/${id}/inventory`,
    transactions: (id: string) => `/dashboard/store/${id}/transactions`,
  },
} as const;
