const defaultDownloadItems = [
  {
    title: "Mega NZ",
    description: "Official RAN Online client download via Mega NZ.",
    version: "Official",
    link: "https://mega.nz/file/qJ4Xmb6K#ss4l5Yrfxp0EsMs3eDSnoH3YbVENYtmEoF_QQThi8X4",
    logo: "assets/img/logo-mega.svg",
  },
  {
    title: "Google Drive",
    description: "Official RAN Online client download via Google Drive.",
    version: "Official",
    link: "https://drive.google.com/file/d/1lof62s4HhhTbt1ftlyF71tWU3KTrJzhm/view?usp=sharing",
    logo: "assets/img/logo-google-drive.svg",
  },
  {
    title: "MediaFire",
    description: "Official RAN Online client download via MediaFire.",
    version: "Official",
    link: "https://www.mediafire.com/file/b78cvmqemhdtht1/BabyRAN+EN3+Client+-+Installer.exe/file",
    logo: "assets/img/logo-mediafire.svg",
  },
];

const defaultInstallationGuide = "To avoid errors during installation, please follow these steps carefully:\n\n1. Disable your Anti-Virus\n2. Disable Windows Defender Real-Time Protection (Firewall)\n3. Install the client in Local Disk C:\n4. The launcher will be added automatically on your Desktop.";

const defaultServerDownloads = (episode = "Server") =>
  defaultDownloadItems.map((item) => ({
    ...item,
    description: item.description.replace("RAN Online", episode),
  }));

const serverDownloadKey = (server = {}) =>
  [server.episode || "", server.title || "", server.image || ""].join("|").toLowerCase();

const defaultDownloadGroup = (server = {}) => ({
  serverKey: serverDownloadKey(server),
  episode: server.episode || "Server",
  title: server.title || "Downloads",
  placeholderSoon: Boolean(server.locked),
  items: defaultServerDownloads(server.episode || "Server"),
  installation: { content: defaultInstallationGuide },
});

const normalizeDownloadGroups = (downloads = {}, episodes = []) => {
  const existing = downloads.servers || [];
  return episodes.map((server) => {
    const key = serverDownloadKey(server);
    const match = existing.find((group) =>
      group.serverKey === key
      || (group.episode || "").toLowerCase() === (server.episode || "").toLowerCase());
    return {
      ...defaultDownloadGroup(server),
      ...match,
      serverKey: key,
      episode: server.episode || match?.episode || "Server",
      title: server.title || match?.title || "Downloads",
      placeholderSoon: match?.placeholderSoon ?? Boolean(server.locked),
      items: match?.items?.length ? match.items : defaultServerDownloads(server.episode || "Server"),
      installation: {
        content: downloads.installation?.content || match?.installation?.content || defaultInstallationGuide,
      },
    };
  });
};

const defaultEpisodes = [
  {
    episode: "Episode 7",
    title: "Matira Matibay!",
    description: "The battle continues in a world full of chaos and opportunities. Prove your might and survive.",
    details: "Classic EP7 gameplay rollout information.\nRates, launch mechanics, and event schedules will be posted here.\nDownload links and official requirements will be updated before opening.",
    image: "assets/img/episode-7-v2.png",
    url: "#",
    status: "Online",
    ageLabel: "0 Months Old",
    locked: false,
  },
  {
    episode: "Episode 6",
    title: "Ibang Klase!",
    description: "A new era of school wars begins. Stronger, faster, and more intense!",
    details: "Server rollout information will be posted here.\nRates, features, and download details are coming soon.",
    image: "assets/img/episode-6-v2.png",
    url: "#",
    status: "Coming Soon",
    ageLabel: "Coming Soon",
    locked: true,
  },
  {
    episode: "Episode 5",
    title: "New Dawn",
    description: "Rise as a new generation of warriors. The dawn of a new war has begun.",
    details: "Server rollout information will be posted here.\nRates, features, and download details are coming soon.",
    image: "assets/img/episode-5-v2.png",
    url: "#",
    status: "Coming Soon",
    ageLabel: "Coming Soon",
    locked: true,
  },
  {
    episode: "Episode 4",
    title: "The Next Level",
    description: "Push your limits and reach the next level of power and domination.",
    details: "Server rollout information will be posted here.\nRates, features, and download details are coming soon.",
    image: "assets/img/episode-4-v2.png",
    url: "#",
    status: "Coming Soon",
    ageLabel: "Coming Soon",
    locked: true,
  },
  {
    episode: "Episode 3",
    title: "Rebirth",
    description: "Rebuild. Reclaim. Rise again. The legend lives on.",
    details: "Server rollout information will be posted here.\nRates, features, and download details are coming soon.",
    image: "assets/img/episode-3-v2.png",
    url: "#",
    status: "Coming Soon",
    ageLabel: "Coming Soon",
    locked: true,
  },
];

const defaultNewsItems = [
  {
    title: "Episode 7 Classic Server Information",
    category: "Server Update",
    color: "#3f82c7",
    date: "2026-09-22",
    excerpt: "Episode 7 Classic server rates, progression details, and the official PvP schedule.",
    details: "Episode 7 Classic is built around six balanced classes, a level 230 cap, and skill progression through level 207. Experience and item drops use mid-rate settings, with HeadB.5IF and RCB1 dungeon content available.\n\nThe server supports up to +10 enhancement, permanent contribution accessories, consumable game time, and consumable War Chips.\n\nPvP schedule: School vs. School Tyranny Wars run at 2:00 AM, 5:00 AM, 8:00 AM, 11:00 AM, and 1:00 PM. Guild vs. Guild Club Wars begin at 9:00 PM, followed by Battle Island School Wars at 10:00 PM.",
    image: "assets/news-img/image.png",
    url: "#",
  },
  {
    title: "10th Month Top Up Promo",
    category: "Promo",
    color: "#bd5e9c",
    date: "2026-09-04",
    excerpt: "Celebrate the 10th month with the official Top Up Promo, running September 4 to 13, 2026.",
    details: "The 10th Month Top Up Promo is live from September 4 through September 13, 2026.\n\nPrepare for epic action and check the official channels for qualifying top-up tiers, reward eligibility, and claiming instructions.",
    image: "assets/news-img/799202757_122102911088536618_4569859917083868130_n.jpg",
    url: "#",
  },
  {
    title: "Bidder's Bazaar: Vehicle Parts and Epic Optimus Bike",
    category: "Event",
    color: "#d4a24d",
    date: "2026-09-22",
    excerpt: "Bid on vehicle parts and chase the Epic Optimus Bike in the latest Bidder's Bazaar.",
    details: "Bidder's Bazaar brings a new lineup of vehicle parts: speedometer, tachometer, dashboard, engine, battery, turbo, rims, tires, mufflers, and exhaust parts.\n\nCollect the pieces you need and compete for the Epic Optimus Bike. Watch official announcements for bidding rules, availability, and reward details.",
    image: "assets/news-img/808786545_122103027872536618_5723870778016589074_n.jpg",
    url: "#",
  },
  {
    title: "War of Emperium: The Beginning",
    category: "Event",
    color: "#d4a24d",
    date: "2026-09-25",
    excerpt: "War of Emperium begins September 25, 2026 with a P100,000,000 prize pool.",
    details: "RAN Online EP7 Classic presents War of Emperium: The Beginning. The event opens on September 25, 2026, with a P100,000,000 prize pool on the line.\n\nBuild your alliance, prepare your school, and follow the official channels for battle rules, registration information, and the complete reward breakdown.",
    image: "assets/news-img/462005494_3887429934914625_3502498850614073497_n.jpg",
    url: "#",
  },
];
const defaults = {
  meta: {
    title: "RAN Online PH",
    version: "v1.1.0",
    description: "RAN Online PH server selection",
    footer: "(c) RAN Online PH. All rights reserved.",
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
    url: "https://www.facebook.com/clpl.developments",
  },
  downloads: {
    items: defaultDownloadItems,
    servers: normalizeDownloadGroups({}, defaultEpisodes),
    installation: {
      content: defaultInstallationGuide,
    },
  },
  navigation: [
    { label: "Home", url: "#", position: "left", active: true },
    { label: "Servers", url: "#", position: "left" },
    { label: "Guide", url: "#", position: "left" },
    { label: "Download", url: "#", position: "right" },
    { label: "About Us", url: "#", position: "right" },
    { label: "Support", url: "#", position: "right" },
  ],
  serverSelection: {
    title: "Server Selection",
    detailsLabel: "View Details",
    episodes: defaultEpisodes,
  },
  news: {
    title: "Latest News",
    items: defaultNewsItems,
  },
  changelog: {
    title: "Changelog",
    entries: [
      {
        version: "v1.1.0",
        date: "2026-09-22",
        summary: "News center refresh and site navigation update.",
        details: "News is now the home view, with Servers available through its own route.\n\n- Added a paginated news feed with category accents and Read More details.\n- Added upload-backed news artwork support and the latest official event posters.\n- Added News categories, custom accent colors, and improved mobile image presentation.\n- Added clean local and deployed routing for Home and Servers.\n- Refined modals, locked-server icons, and text rendering across the site.",
      },
    ],
  },  fact: {
    lead: "Did you know? Online RPG OG 'RAN Online' is",
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
        title: "Online RPG OG 'RAN Online' is",
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
        description: "Who stands among the strongest individuals in the game? Enter Suryun's King of the Hill and fight alone against the toughest challengers. Defeat your rivals, hold the summit, and prove that you are the strongest.",
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
  downloads: {
    ...base.downloads,
    ...overrides.downloads,
    items: overrides.downloads?.items ?? base.downloads.items,
    installation: {
      ...base.downloads.installation,
      ...overrides.downloads?.installation,
    },
  },
  serverSelection: {
    ...base.serverSelection,
    ...overrides.serverSelection,
    episodes: overrides.serverSelection?.episodes ?? base.serverSelection.episodes,
  },
  news: {
    ...base.news,
    ...overrides.news,
    items: overrides.news?.items ?? base.news.items,
  },
  changelog: {
    ...base.changelog,
    ...overrides.changelog,
    entries: overrides.changelog?.entries ?? base.changelog.entries,
  },  fact: { ...base.fact, ...overrides.fact },
  sidebar: {
    ...base.sidebar,
    ...overrides.sidebar,
    slides: overrides.sidebar?.slides ?? base.sidebar.slides,
  },
  navigation: overrides.navigation ?? base.navigation,
});

const finalizeConfig = (config) => ({
  ...config,
  downloads: {
    ...config.downloads,
    servers: normalizeDownloadGroups(config.downloads, config.serverSelection.episodes),
  },
});

const createSiteConfig = (overrides = {}) =>
  Object.freeze(finalizeConfig(mergeConfig(structuredClone(defaults), overrides)));

window.createSiteConfig = createSiteConfig;
window.CONFIG_STORAGE_KEY = "ran-online-site-config";
window.ASSET_STORAGE_KEY = "ran-online-image-assets";
window.isLocalRun = () => {
  const hostname = window.location.hostname.toLowerCase();
  return window.location.protocol === "file:"
    || hostname === ""
    || hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname === "::1"
    || hostname.endsWith(".local")
    || /^10\./.test(hostname)
    || /^192\.168\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
};

const loadSavedConfig = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(window.CONFIG_STORAGE_KEY)) ?? {};
    if ((saved.siteContentVersion || 0) < 4) {
      saved.siteContentVersion = 4;
      saved.social = {
        ...(saved.social || {}),
        visible: true,
        label: "Like us on Facebook",
        handle: "fb.com/clpl.developments",
        url: "https://www.facebook.com/clpl.developments",
      };
      saved.navigation?.forEach((item) => {
        if (item.label === "Ranking") item.label = "About Us";
      });
    }
    if ((saved.siteContentVersion || 0) < 5) {
      saved.siteContentVersion = 5;
      saved.news = {
        title: saved.news?.title || "Latest News",
        items: saved.news?.items?.length ? saved.news.items : structuredClone(defaultNewsItems),
      };
    }
    if ((saved.siteContentVersion || 0) < 6) {
      saved.siteContentVersion = 6;
      const oldTestTitles = new Set([
        "Test Patch Notes: Balance Pass",
        "Test Maintenance Window",
        "Test Weekend Event",
        "Test Community Spotlight",
        "Test Client Update",
      ]);
      const currentItems = (saved.news?.items || []).filter((item) => !oldTestTitles.has(item.title));
      const defaultsByImage = new Map(defaultNewsItems.map((item) => [item.image, item]));
      currentItems.forEach((item) => defaultsByImage.delete(item.image));
      saved.news = {
        title: saved.news?.title || "Latest News",
        items: [...defaultsByImage.values(), ...currentItems],
      };
    }
    if ((saved.siteContentVersion || 0) < 7) {
      saved.siteContentVersion = 7;
      saved.navigation?.forEach((item) => {
        if (item.label === "News") item.label = "Servers";
        item.active = item.label === "Home";
      });
    }
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

