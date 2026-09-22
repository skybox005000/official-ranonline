const defaults = {
  meta: {
    title: "RAN Online PH",
    description: "RAN Online PH server selection",
    footer: "Â© RAN Online PH. All rights reserved.",
  },
  brand: {
    name: "CLPL DEVELOPMENTS",
    tagline: "Trusted. Transparent. Reliable.",
    logo: "assets/img/ran-logo-v2.png",
    homeUrl: "#",
  },
  social: {
    visible: true,
    label: "Like us on Facebook",
    handle: "fb.com/clpl.developments",
    url: "#",
  },
  navigation: [
    { label: "Home", url: "#", position: "left", active: true },
    { label: "News", url: "#news", position: "left" },
    { label: "Guide", url: "#guide", position: "left" },
    { label: "Download", url: "#download", position: "right" },
    { label: "About Us", url: "#about", position: "right" },
    { label: "Support", url: "#support", position: "right" },
  ],
  serverSelection: {
    title: "Server Selection",
    detailsLabel: "View Details",
    episodes: [
      {
        episode: "Episode 7",
        title: "Matira Matibay!",
        description: "The battle continues in a world full of chaos and opportunities. Prove your might and survive.",
        image: "assets/img/episode-7-v2.png",
        url: "#",
      },
      {
        episode: "Episode 6",
        title: "Ibang Klase!",
        description: "A new era of school wars begins. Stronger, faster, and more intense!",
        image: "assets/img/episode-6-v2.png",
        url: "#",
      },
      {
        episode: "Episode 5",
        title: "New Dawn",
        description: "Rise as a new generation of warriors. The dawn of a new war has begun.",
        image: "assets/img/episode-5-v2.png",
        url: "#",
      },
      {
        episode: "Episode 4",
        title: "The Next Level",
        description: "Push your limits and reach the next level of power and domination.",
        image: "assets/img/episode-4-v2.png",
        url: "#",
      },
      {
        episode: "Episode 3",
        title: "Rebirth",
        description: "Rebuild. Reclaim. Rise again. The legend lives on.",
        image: "assets/img/episode-3-v2.png",
        url: "#",
      },
    ],
  },
  fact: {
    lead: "Did you know? Online RPG OG â€˜RAN Onlineâ€™ is",
    highlight: "22 years old",
    description: "RAN Online PH was officially released in the Philippines on",
    emphasizedText: "January 24, 2006",
    trailingText: ". It was one of the most popular MMORPGs in the country during that period.",
  },
  sidebar: {
    interval: 6000,
    samplesVersion: 3,
    slides: [
      {
        id: "ran-history",
        image: "assets/img/fact-group-v2.png",
        label: "Did you know?",
        title: "Online RPG OG â€˜RAN Onlineâ€™ is",
        highlight: "22 years old",
        description: "RAN Online PH was officially released in the Philippines on January 24, 2006. It was one of the most popular MMORPGs in the country during that period.",
      },
      {
        id: "episode-8-teaser",
        image: "assets/img/episode-8-coming-soon.png",
        label: "New character preview",
        title: "Episode 8: Assassin",
        highlight: "Coming Soon",
        description: "A new character enters the school war. Master stealth, rapid strikes, deadly critical attacks, and swift escapes with the Assassin. Watch for the official Episode 8 character trailer.",
      },
      {
        id: "suryun-event-teaser",
        image: "assets/img/suryun-event-coming-soon.png",
        label: "Limited KOTH event",
        title: "King of the Hill",
        highlight: "Coming Soon",
        description: "Who stands among the strongest individuals in the game? Enter Suryunâ€™s King of the Hill and fight alone against the toughest challengers. Defeat your rivals, hold the summit, and prove that you are the strongest.",
      },
    ],
  },
};

const mergeConfig = (base, overrides) => ({
  ...base,
  ...overrides,
  meta: { ...base.meta, ...overrides.meta },
  brand: { ...base.brand, ...overrides.brand },
  social: { ...base.social, ...overrides.social },
  serverSelection: {
    ...base.serverSelection,
    ...overrides.serverSelection,
    episodes: overrides.serverSelection?.episodes ?? base.serverSelection.episodes,
  },
  fact: { ...base.fact, ...overrides.fact },
  sidebar: {
    ...base.sidebar,
    ...overrides.sidebar,
    slides: overrides.sidebar?.slides ?? base.sidebar.slides,
  },
  navigation: overrides.navigation ?? base.navigation,
});

const createSiteConfig = (overrides = {}) =>
  Object.freeze(mergeConfig(structuredClone(defaults), overrides));

window.createSiteConfig = createSiteConfig;
window.CONFIG_STORAGE_KEY = "ran-online-site-config";
window.ASSET_STORAGE_KEY = "ran-online-image-assets";

const loadSavedConfig = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(window.CONFIG_STORAGE_KEY)) ?? {};
    if (saved.sidebar?.slides && saved.sidebar.samplesVersion !== defaults.sidebar.samplesVersion) {
      defaults.sidebar.slides.slice(1).forEach((sample) => {
        const existing = saved.sidebar.slides.find((slide) =>
          slide.id === sample.id || slide.image === sample.image);
        if (existing) {
          Object.assign(existing, {
            id: sample.id,
            label: sample.label,
            title: sample.title,
            highlight: sample.highlight,
            description: sample.description,
          });
        } else {
          saved.sidebar.slides.push(structuredClone(sample));
        }
      });
      saved.sidebar.samplesVersion = defaults.sidebar.samplesVersion;
    }
    return saved;
  } catch {
    return {};
  }
};

window.siteConfig = createSiteConfig(loadSavedConfig());
try {
  window.siteAssetOverrides = JSON.parse(localStorage.getItem(window.ASSET_STORAGE_KEY)) ?? {};
} catch {
  window.siteAssetOverrides = {};
}
window.resolveSiteAsset = (path) => window.siteAssetOverrides[path] || path;

