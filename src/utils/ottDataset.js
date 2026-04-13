export const ottDataset = {
  // Individual OTT platforms
  platforms: [
    {
      name: "Netflix",
      price: 199,
      type: "mobile",
      features: ["1 screen", "mobile only"],
      category: "OTT"
    },
    {
      name: "Netflix",
      price: 499,
      type: "basic",
      features: ["HD", "1 screen"],
      category: "OTT"
    },
    {
      name: "Amazon Prime Video",
      price: 1499,
      type: "yearly",
      features: ["HD", "free delivery"],
      category: "OTT"
    },
    {
      name: "Disney+ Hotstar",
      price: 299,
      type: "mobile",
      features: ["sports", "mobile only"],
      category: "OTT"
    },
    {
      name: "Disney+ Hotstar",
      price: 899,
      type: "super",
      features: ["HD", "2 screens"],
      category: "OTT"
    },
    {
      name: "Spotify",
      price: 119,
      type: "individual",
      features: ["ad-free music"],
      category: "Music"
    },
    {
      name: "YouTube Premium",
      price: 129,
      type: "individual",
      features: ["no ads", "background play"],
      category: "OTT"
    }
  ],

  // OTT bundles (multiple services)
  bundles: [
    {
      name: "Amazon Prime",
      price: 1499,
      includes: ["Prime Video", "Music", "Delivery"],
      category: "Bundle"
    },
    {
      name: "Jio Cinema Premium",
      price: 999,
      includes: ["Movies", "Sports"],
      category: "Bundle"
    },
    {
      name: "Apple One",
      price: 195,
      includes: ["Apple Music", "Apple TV+", "iCloud"],
      category: "Bundle"
    }
  ],

  // WiFi / telco plans with OTT
  wifiPlans: [
    {
      provider: "JioFiber",
      price: 999,
      speed: "150 Mbps",
      includes: [
        "Netflix",
        "Amazon Prime",
        "Disney+ Hotstar"
      ],
      category: "WiFi Bundle"
    },
    {
      provider: "Airtel Xstream Fiber",
      price: 999,
      speed: "200 Mbps",
      includes: [
        "Amazon Prime",
        "Disney+ Hotstar",
        "Xstream Play"
      ],
      category: "WiFi Bundle"
    },
    {
      provider: "JioFiber",
      price: 1499,
      speed: "300 Mbps",
      includes: [
        "Netflix",
        "Prime",
        "Hotstar",
        "SonyLIV"
      ],
      category: "WiFi Bundle"
    }
  ]
}
