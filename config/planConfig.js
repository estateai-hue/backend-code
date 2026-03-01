export const planConfig = {
  free: {
    price: 199,
    duration: "weekly",
    leadsLimit: 1,
    support: false
  },
  basic: {
    price: 1599,
    duration: "monthly",
    leadsLimit: 5,
    support: true
  },
  standard: {
    price: 3999,
    duration: "yearly",
    leadsLimit: 5, // per day
    support: true
  },
  business: {
    price: 8999,
    duration: "yearly",
    leadsLimit: -1, // unlimited
    support: true
  }
};
