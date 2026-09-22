const config = window.createSiteConfig
  ? window.createSiteConfig(window.siteConfig || {})
  : window.siteConfig;

const byId = (id) => document.getElementById(id);
const asset = (path) => window.resolveSiteAsset?.(path) || path;

const menuContent = {
  News: [{ label: "Latest CLPL Development Posts", action: "news" }],
  Guide: [
    { label: "Game Guide", action: "game-guide", type: "Guide" },
  ],
  Download: [{ label: "Download", action: "downloads", type: "Download" }],
  "About Us": [{ label: "About CLPL Developments", action: "placeholder", type: "About Us" }],
  Ranking: [{ label: "About CLPL Developments", action: "placeholder", type: "About Us" }],
  Support: [{ label: "Support", action: "placeholder", type: "Support" }],
};

const isPlaceholderUrl = (url) => !url || url === "#" || url.startsWith("#");
const isLocalPreview = () => window.location.protocol === "file:";
const isNewsRoute = () => {
  if (isLocalPreview()) return window.location.hash !== "#servers";
  const path = window.location.pathname.replace(/\/+$/, "");
  return path === "" || path === "/" || path === "/news";
};
const navigateToView = (view) => {
  if (isLocalPreview()) {
    window.location.hash = view === "servers" ? "servers" : "";
  } else {
    history.pushState(null, "", view === "servers" ? "/servers" : "/");
  }
  renderContentView(view);
};
const newsCategoryColors = Object.freeze({
  Announcement: "#718096",
  Event: "#d4a24d",
  "Patch Notes": "#2f9b88",
  Maintenance: "#d18b32",
  "Server Update": "#3f82c7",
  Community: "#4e9b68",
  Download: "#467fc1",
  Guide: "#8a62ba",
  "Character Preview": "#bf4b4b",
  "Security Notice": "#c83f3f",
  Promotion: "#bd5e9c",
  "Test Patch": "#2f9b88",
  "Test Notice": "#d18b32",
  "Test Event": "#d4a24d",
  "Test Community": "#4e9b68",
  "Test Download": "#467fc1",
});
const newsColorFor = (item) => item.color || newsCategoryColors[item.category] || "#c6923d";
const formatNewsDate = (value) => {
  const date = new Date(`${value || ""}T00:00:00`);
  return Number.isNaN(date.getTime()) ? (value || "Latest update") : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const renderNewsDetails = (item) => {
  const modal = byId("content-modal");
  byId("modal-eyebrow").textContent = item.category || "News";
  byId("modal-title").textContent = item.title || "News update";
  const body = byId("modal-body");
  body.replaceChildren();
  const detail = document.createElement("article");
  detail.className = "news-detail";
  if (item.image) {
    const image = document.createElement("img");
    image.className = "news-detail__image";
    image.src = asset(item.image);
    image.alt = "";
    detail.append(image);
  }
  const content = document.createElement("div");
  content.className = "news-detail__content";
  const date = document.createElement("time");
  date.className = "news-detail__date";
  date.textContent = formatNewsDate(item.date);
  const actions = document.createElement("div");
  actions.className = "news-detail__actions";
  const back = document.createElement("button");
  back.className = "modal-action";
  back.type = "button";
  back.textContent = "Close";
  back.addEventListener("click", () => {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  });
  actions.append(back);
  if (!isPlaceholderUrl(item.url)) {
    const source = document.createElement("a");
    source.className = "modal-action modal-action--news-source";
    source.href = item.url;
    source.target = "_blank";
    source.rel = "noopener";
    source.textContent = "View Source";
    actions.append(source);
  }
  content.append(date, renderMarkdown(item.details || item.excerpt || ""), actions);
  detail.append(content);
  body.append(detail);
  modal.hidden = false;
  document.body.classList.add("modal-open");
};

const renderNewsList = () => {
  const modal = byId("content-modal");
  byId("modal-eyebrow").textContent = "News";
  byId("modal-title").textContent = config.news?.title || "Latest News";
  const body = byId("modal-body");
  body.replaceChildren();
  const items = config.news?.items || [];
  if (!items.length) {
    appendEmptyState(body, "No news yet", "Official updates will appear here once they are published.");
  } else {
    const list = document.createElement("div");
    list.className = "news-list";
    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "news-card";
      const art = document.createElement("div");
      art.className = "news-card__art";
      art.style.backgroundImage = `url("${asset(item.image)}")`;
      const category = document.createElement("span");
      category.textContent = item.category || "News";
      art.append(category);
      const copy = document.createElement("div");
      copy.className = "news-card__copy";
      const title = document.createElement("h3");
      title.textContent = item.title || "News update";
      const excerpt = document.createElement("p");
      excerpt.textContent = item.excerpt || item.details || "";
      const date = document.createElement("time");
      date.textContent = formatNewsDate(item.date);
      copy.append(title, excerpt, date);
      const details = document.createElement("button");
      details.className = "details news-card__details";
      details.type = "button";
      details.textContent = "Read More >";
      details.addEventListener("click", () => renderNewsDetails(item));
      card.append(art, copy, details);
      list.append(card);
    });
    body.append(list);
  }
  modal.hidden = false;
  document.body.classList.add("modal-open");
};
const renderChangelogViewer = (body) => {
  const changelog = config.changelog || {};
  const entries = changelog.entries || [];
  const version = document.createElement("p");
  version.className = "changelog-current-version";
  version.textContent = `Current version: ${config.meta?.version || entries[0]?.version || "Unversioned"}`;
  body.append(version);
  if (!entries.length) {
    appendEmptyState(body, "No changelog entries", "Release notes will appear here with the next update.");
    return;
  }
  const list = document.createElement("div");
  list.className = "changelog-list";
  entries.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "changelog-entry";
    const heading = document.createElement("h3");
    heading.textContent = entry.version || "Update";
    const date = document.createElement("time");
    date.textContent = formatNewsDate(entry.date);
    const summary = document.createElement("p");
    summary.textContent = entry.summary || "";
    item.append(heading, date, summary, renderMarkdown(entry.details || ""));
    list.append(item);
  });
  body.append(list);
};
const openModal = (item) => {
  const modal = byId("content-modal");
  byId("modal-eyebrow").textContent = item.type || (item.action === "news" ? "News" : "");
  byId("modal-title").textContent = item.label;
  const body = byId("modal-body");
  body.replaceChildren();
  if (item.action === "news") {
    renderNewsList();
    return;
  } else if (item.action === "downloads") {
    renderDownloadsModal(body, item.server);
} else if (item.action === "changelog") {
    renderChangelogViewer(body);
  } else if (item.action === "game-guide") {
    const message = document.createElement("p");
    message.textContent = "There is a game guide available in-game. Press H while playing to open the built-in guide.";
    const actions = document.createElement("div");
    actions.className = "news-detail__actions";
    const changelog = document.createElement("button");
    changelog.className = "modal-action";
    changelog.type = "button";
    changelog.textContent = "View Changelog";
    changelog.addEventListener("click", () => openModal({ label: config.changelog?.title || "Changelog", action: "changelog", type: "Changelog" }));
    actions.append(changelog);
    body.append(message, actions);
  } else {
    const mark = document.createElement("div");
    mark.className = "build-mark";
    mark.textContent = "BUILD";
    const message = document.createElement("p");
    message.textContent = "This section is currently in development. Please check back soon for the official release.";
    const badge = document.createElement("strong");
    badge.className = "coming-badge";
    badge.textContent = "ONGOING BUILD";
    body.append(mark, message, badge);
  }
  modal.hidden = false;
  document.body.classList.add("modal-open");
};

const renderMarkdown = (value) => {
  const lines = String(value || "").split(/\r?\n/);
  const fragment = document.createDocumentFragment();
  let list;
  const flushList = () => {
    if (list) {
      fragment.append(list);
      list = null;
    }
  };
  lines.forEach((line) => {
    const text = line.trim();
    if (!text) {
      flushList();
      return;
    }
    const ordered = text.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      list ??= document.createElement("ol");
      const item = document.createElement("li");
      item.textContent = ordered[1];
      list.append(item);
      return;
    }
    flushList();
    const paragraph = document.createElement("p");
    paragraph.textContent = text.replace(/\*\*/g, "");
    fragment.append(paragraph);
  });
  flushList();
  return fragment;
};

const renderDownloadList = (items) => {
  const list = document.createElement("div");
  list.className = "download-list";
  items.forEach((item) => {
    const link = document.createElement("a");
    link.className = "download-item";
    link.href = item.link || "#";
    const placeholder = isPlaceholderUrl(item.link);
    link.classList.toggle("is-placeholder", placeholder);
    if (!placeholder) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    const logo = document.createElement("span");
    logo.className = "download-item__logo";
    if (item.logo) {
      const image = document.createElement("img");
      image.src = asset(item.logo);
      image.alt = "";
      logo.append(image);
    }
    const main = document.createElement("span");
    main.className = "download-item__main";
    appendTextBlock(main, "strong", item.title || "Download");
    appendTextBlock(main, "span", item.description || "");
    const badge = document.createElement("span");
    badge.className = "download-item__badge";
    badge.textContent = item.version || "Official";
    link.append(logo, main, badge);
    list.append(link);
  });
  return list;
};

const serverDownloads = (server) =>
  server?.locked || downloadGroupForServer(server)?.placeholderSoon
    ? [{
      title: "Coming Soon",
      description: `${server.episode || "Server"} download links will be posted soon.`,
      version: "Soon",
      link: "#",
      logo: "",
    }]
    : (downloadGroupForServer(server)?.items || config.downloads?.items || []);

const downloadGroupForServer = (server) => {
  const key = serverKey(server);
  return (config.downloads?.servers || []).find((group) =>
    serverKey(group) === key
    || (group.episode || "").toLowerCase() === (server?.episode || "").toLowerCase());
};

const serverKey = (item) => [
  item?.episode || "",
  item?.title || "",
  item?.image || "",
].join("|").toLowerCase();

const renderDownloadsModal = (body, server = null) => {
  const servers = config.serverSelection?.episodes || [];
  const lockedToServer = Boolean(server);
  const initialIndex = Math.max(0, servers.findIndex((item) => serverKey(item) === serverKey(server)));
  let selectedServer = servers[initialIndex] || server || null;

  const content = document.createElement("div");
  content.className = "downloads-view";

  if (servers.length > 1) {
    const switcher = document.createElement("label");
    switcher.className = "download-switcher";
    switcher.classList.toggle("is-locked", lockedToServer);
    appendTextBlock(switcher, "span", "Server");
    const select = document.createElement("select");
    servers.forEach((item, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${item.episode || "Server"} - ${item.title || "Downloads"}`;
      select.append(option);
    });
    select.value = String(initialIndex);
    select.disabled = lockedToServer;
    select.addEventListener("change", () => {
      if (lockedToServer) return;
      selectedServer = servers[Number(select.value)];
      renderDownloadContent();
    });
    switcher.append(select);
    body.append(switcher);
  }

  const guide = document.createElement("section");
  guide.className = "installation-guide download-group--separated";
  appendTextBlock(guide, "h3", "Installation Guide");
  const renderGuide = () => {
    guide.replaceChildren();
    appendTextBlock(guide, "h3", "Installation Guide");
    const guideContent = downloadGroupForServer(selectedServer)?.installation?.content
      || config.downloads?.installation?.content
      || "Open the official installation guide before setup.";
    guide.append(renderMarkdown(guideContent));
  };

  const renderDownloadContent = () => {
    content.replaceChildren();
    if (selectedServer) {
      const downloads = serverDownloads(selectedServer);
      const group = document.createElement("section");
      group.className = "download-group";
      appendTextBlock(group, "h3", `${selectedServer.episode || "Server"} Downloads`, "download-group__title");
      group.append(renderDownloadList(downloads));
      renderGuide();
      content.append(group, guide);
      return;
    }

    const downloads = config.downloads?.items || [];
    if (!downloads.length) {
      appendEmptyState(content, "No downloads available", "Client download links will appear here once they are published.");
    } else {
      content.append(renderDownloadList(downloads));
    }
    renderGuide();
    content.append(guide);
  };

  body.append(content);
  renderDownloadContent();
};

const appendTextBlock = (parent, tagName, text, className = "") => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
};

const appendEmptyState = (parent, title, message) => {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  appendTextBlock(empty, "strong", title);
  appendTextBlock(empty, "p", message);
  parent.append(empty);
  return empty;
};

const serverAgeText = (item, locked) => {
  if (locked) return item.ageLabel || "Coming Soon";
  const label = item.ageLabel || "New Server";
  return label.toLowerCase().includes("old") || label.toLowerCase().includes("new")
    ? label
    : `${label} Old`;
};

const serverAgeClass = (ageText) => {
  const value = String(ageText || "").toLowerCase();
  const amount = Number(value.match(/\d+/)?.[0] || 0);
  const months = value.includes("year") ? amount * 12 : amount;
  return months >= 6 ? "server-age server-age--hot" : "server-age";
};

const appendServerAgeBadge = (parent, item, locked) => {
  if (locked) return;
  const ageText = serverAgeText(item, locked);
  const age = document.createElement("span");
  age.className = serverAgeClass(ageText);
  if (age.classList.contains("server-age--hot")) {
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("class", "server-age__icon");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");
    const outer = document.createElementNS("http://www.w3.org/2000/svg", "path");
    outer.setAttribute("d", "M12.3 2.1c1.1 4.1-2.9 5.5-1.3 9.1.9-1.6 2.3-2.8 4-3.5-.3 3.3 3.5 4.9 3.5 9 0 4.1-3.2 6.8-7.1 6.8S4.5 20.7 4.5 16.8c0-3.6 2.3-5.8 4.4-7.8 1.9-1.8 3.3-3.5 3.4-6.9Z");
    const inner = document.createElementNS("http://www.w3.org/2000/svg", "path");
    inner.setAttribute("d", "M11.9 13.4c.6 1.8-1.4 2.7-.8 4.4.5-.9 1.2-1.5 2.2-1.9.2 1.3 1.5 2.2 1.5 3.8 0 2-1.5 3.4-3.4 3.4S8 21.7 8 19.8c0-2.5 2.4-3.5 3.9-6.4Z");
    icon.append(outer, inner);
    age.append(icon);
  }
  age.append(document.createTextNode(ageText));
  parent.append(age);
};

const openServerDetails = (item, locked) => {
  const modal = byId("content-modal");
  byId("modal-eyebrow").textContent = item.episode || "Server";
  byId("modal-title").textContent = item.title || "Server Details";
  const body = byId("modal-body");
  body.replaceChildren();

  const rollout = document.createElement("div");
  rollout.className = "server-rollout";
  const visual = document.createElement("div");
  visual.className = "server-rollout__visual";
  visual.style.backgroundImage = `url("${asset(item.image)}")`;
  const visualLabel = document.createElement("span");
  visualLabel.textContent = item.episode || "Server";
  visual.append(visualLabel);

  const content = document.createElement("div");
  content.className = "server-rollout__content";
  const meta = document.createElement("div");
  meta.className = "server-meta";
  const status = document.createElement("span");
  status.className = locked ? "server-status server-status--soon" : "server-status";
  status.textContent = locked ? "Coming Soon" : (item.status || "Online");
  meta.append(status);
  appendServerAgeBadge(meta, item, locked);
  content.append(meta);

  appendTextBlock(content, "p", item.description || "", "server-rollout__lead");

  const detailLines = (item.details || "Server details are coming soon. Check back for rates, launch notes, download requirements, and official announcements.")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const detailList = document.createElement("ul");
  detailList.className = "server-rollout__list";
  detailLines.forEach((line) => {
    const detailItem = document.createElement("li");
    detailItem.textContent = line;
    detailList.append(detailItem);
  });
  content.append(detailList);

  const actions = document.createElement("div");
  actions.className = "server-rollout__actions";
  if (!locked && item.url && item.url !== "#") {
    const action = document.createElement("a");
    action.className = "modal-action";
    action.href = item.url;
    action.target = "_blank";
    action.rel = "noopener";
    action.textContent = config.serverSelection.detailsLabel || "View Details";
    actions.append(action);
  }

  const download = document.createElement("a");
  download.className = "modal-action modal-action--download";
  download.href = "#";
  download.addEventListener("click", (event) => {
    event.preventDefault();
    openModal({ label: "Download", action: "downloads", type: "Download", server: item });
  });
  download.textContent = "How to Download";
  actions.append(download);
  content.append(actions);
  rollout.append(visual, content);
  body.append(rollout);

  modal.hidden = false;
  document.body.classList.add("modal-open");
};

const renderNavigation = () => {
  const groups = {
    left: byId("nav-left"),
    right: byId("nav-right"),
  };

  config.navigation.forEach(({ label: configuredLabel, url, position, active = false }) => {
    const label = configuredLabel === "Ranking" ? "About Us" : configuredLabel === "News" ? "Servers" : configuredLabel;
    const items = menuContent[label] || [];
    const wrapper = document.createElement("div");
    wrapper.className = "nav-item";
    const link = document.createElement("a");
    const text = document.createElement("span");
    link.href = url;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    text.textContent = label;
    link.append(text);
    wrapper.append(link);
    if (label === "Servers") {
      link.href = isLocalPreview() ? "#servers" : "/servers";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        navigateToView("servers");
      });
      groups[position].append(wrapper);
      return;
    }
    if (label === "Home") {
      link.href = isLocalPreview() ? "#" : "/";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        navigateToView("news");
      });
      groups[position].append(wrapper);
      return;
    }
    if (!items.length && isPlaceholderUrl(url)) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        openModal({ label, action: "placeholder", type: label });
      });
    } else if (items.length) {
      link.setAttribute("aria-haspopup", items.length > 1 ? "menu" : "dialog");
      link.addEventListener("click", (event) => {
        event.preventDefault();
        if (items.length === 1) openModal(items[0]);
        else wrapper.classList.toggle("is-open");
      });
      if (items.length > 1) {
        const menu = document.createElement("div");
        menu.className = "nav-dropdown";
        items.forEach((item) => {
          const option = document.createElement("a");
          option.href = item.url || "#";
          option.textContent = item.label;
          if (item.url && !isPlaceholderUrl(item.url)) {
            option.target = "_blank";
            option.rel = "noopener";
          } else {
            option.addEventListener("click", (event) => {
              event.preventDefault();
              openModal(item.action ? item : { label: item.label, action: "placeholder", type: item.type || label });
              wrapper.classList.remove("is-open");
            });
          }
          menu.append(option);
        });
        wrapper.append(menu);
      }
    }
    groups[position].append(wrapper);
  });
};


const renderNewsPage = () => {
  const list = byId("game-list");
  const pagination = byId("game-pagination");
  const items = config.news?.items || [];
  const pageSize = 5;
  byId("games-title").textContent = config.news?.title || "Latest News";

  const renderPage = (currentPage) => {
    list.replaceChildren();
    if (!items.length) {
      pagination.replaceChildren();
      pagination.hidden = true;
      appendEmptyState(list, "No news yet", "Official updates will appear here once they are published.");
      return;
    }
    const start = (currentPage - 1) * pageSize;
    items.slice(start, start + pageSize).forEach((item) => {
      const card = document.createElement("article");
      card.className = "game-card news-page-card";
      card.style.setProperty("--news-accent", newsColorFor(item));
      const art = document.createElement("div");
      art.className = "art";
      art.style.backgroundImage = `url("${asset(item.image)}")`;
      const category = document.createElement("span");
      category.textContent = item.category || "News";
      art.append(category);
      const copy = document.createElement("div");
      copy.className = "copy";
      const title = document.createElement("h2");
      title.textContent = item.title || "News update";
      const excerpt = document.createElement("p");
      excerpt.textContent = item.excerpt || item.details || "";
      const meta = document.createElement("div");
      meta.className = "server-meta";
      const date = document.createElement("span");
      date.textContent = formatNewsDate(item.date);
      meta.append(date);
      copy.append(title, excerpt, meta);
      const details = document.createElement("button");
      details.className = "details";
      details.type = "button";
      details.textContent = "Read More ";
      const arrow = document.createElement("b");
      arrow.textContent = ">";
      details.append(arrow);
      details.addEventListener("click", () => renderNewsDetails(item));
      card.append(art, copy, details);
      list.append(card);
    });

    pagination.replaceChildren();
    const pageCount = Math.ceil(items.length / pageSize);
    pagination.hidden = pageCount <= 1;
    for (let page = 1; page <= pageCount; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = page;
      button.classList.toggle("active", page === currentPage);
      if (page === currentPage) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => renderPage(page));
      pagination.append(button);
    }
  };

  renderPage(1);
};
const renderContentView = (view) => {
  if (view === "news") renderNewsPage();
  else {
    byId("games-title").textContent = config.serverSelection.title;
    renderEpisodes();
  }
  document.querySelectorAll(".nav-group a").forEach((link) => {
    const label = link.textContent.trim();
    link.classList.toggle("active", view === "news" ? label === "Home" : label === "Servers");
  });
};
const renderEpisodes = () => {
  const list = byId("game-list");
  const pagination = byId("game-pagination");
  const pageSize = 5;

  const renderPage = (currentPage) => {
    list.replaceChildren();
    if (!config.serverSelection.episodes.length) {
      pagination.replaceChildren();
      pagination.hidden = true;
      appendEmptyState(
        list,
        "No servers available",
        "Server rollout information will appear here once it is added in the configuration page.",
      );
      return;
    }
    const start = (currentPage - 1) * pageSize;
    config.serverSelection.episodes.slice(start, start + pageSize).forEach((item, pageIndex) => {
      const locked = Boolean(item.locked);
      const card = document.createElement("article");
      card.className = "game-card";
      card.classList.toggle("is-locked", locked);

      const art = document.createElement("div");
      art.className = "art";
      art.style.backgroundImage = `url("${asset(item.image)}")`;
      const episode = document.createElement("span");
      episode.textContent = item.episode;
      art.append(episode);
      if (locked) {
        const lockIcon = document.createElement("i");
        lockIcon.className = "lock-icon";
        lockIcon.setAttribute("aria-label", "Locked");
        art.append(lockIcon);
      }

      const copy = document.createElement("div");
      copy.className = "copy";
      const title = document.createElement("h2");
      title.textContent = item.title;
      const description = document.createElement("p");
      description.textContent = item.description;
      const meta = document.createElement("div");
      meta.className = "server-meta";
      const status = document.createElement("span");
      status.className = locked ? "server-status server-status--soon" : "server-status";
      status.textContent = locked ? "Coming Soon" : (item.status || "Online");
      meta.append(status);
      appendServerAgeBadge(meta, item, locked);
      copy.append(title, description, meta);

      const details = document.createElement(locked ? "span" : "a");
      details.className = "details";
      if (!locked) {
        details.href = item.url || "#";
        details.addEventListener("click", (event) => {
          event.preventDefault();
          openServerDetails(item, locked);
        });
      }
      details.textContent = locked ? "Coming Soon " : `${config.serverSelection.detailsLabel} `;
      const arrow = document.createElement("b");
      arrow.textContent = ">";
      details.append(arrow);

      card.append(art, copy, details);
      list.append(card);
    });

    pagination.replaceChildren();
    const pageCount = Math.ceil(config.serverSelection.episodes.length / pageSize);
    pagination.hidden = pageCount <= 1;
    for (let page = 1; page <= pageCount; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = page;
      button.classList.toggle("active", page === currentPage);
      if (page === currentPage) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => renderPage(page));
      pagination.append(button);
    }
  };

  renderPage(1);
};

const renderSidebar = () => {
  const slides = config.sidebar?.slides?.length ? config.sidebar.slides : [];
  if (!slides.length) {
    const card = document.querySelector(".fact-card");
    const image = byId("sidebar-image");
    image.style.backgroundImage = "";
    byId("sidebar-label").textContent = "No updates";
    byId("fact-heading").textContent = "Announcements will appear here";
    byId("fact-description").textContent = "Add sidebar slides in the configuration page to publish news, facts, or launch previews.";
    byId("sidebar-dots").replaceChildren();
    card.classList.add("is-empty");
    return;
  }
  let activeIndex = 0;
  let rotationTimer;
  const heading = byId("fact-heading");
  const description = byId("fact-description");
  const dots = byId("sidebar-dots");
  const card = document.querySelector(".fact-card");
  const image = byId("sidebar-image");

  const showSlide = (index) => {
    const slide = slides[index];
    activeIndex = index;
    image.style.backgroundImage = `url("${asset(slide.image)}")`;
    byId("sidebar-label").textContent = slide.label || "";
    heading.replaceChildren(document.createTextNode(`${slide.title} `));
    if (slide.highlight) {
      const highlight = document.createElement("strong");
      highlight.textContent = slide.highlight;
      heading.append(highlight);
    }
    description.textContent = slide.description || "";
    [...dots.children].forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle("active", active);
      dot.setAttribute("aria-pressed", String(active));
    });
  };

  const restartRotation = () => {
    clearInterval(rotationTimer);
    if (slides.length > 1) {
      rotationTimer = setInterval(
        () => showSlide((activeIndex + 1) % slides.length),
        Math.max(3000, Number(config.sidebar.interval) || 6000),
      );
    }
  };

  slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show ${slide.title || `sidebar slide ${index + 1}`}`);
    dot.addEventListener("click", () => {
      showSlide(index);
      restartRotation();
    });
    dots.append(dot);
  });
  showSlide(0);
  restartRotation();
  card.addEventListener("mouseenter", () => clearInterval(rotationTimer));
  card.addEventListener("mouseleave", restartRotation);
  card.addEventListener("focusin", () => clearInterval(rotationTimer));
  card.addEventListener("focusout", restartRotation);
};

const initializeAudioPlayer = () => {
  const player = byId("audio-player");
  const audio = byId("site-audio");
  const toggle = byId("audio-toggle");
  if (!player || !audio || !toggle) return;

  const startingVolume = 0.45;
  audio.volume = startingVolume;
  audio.muted = false;

  const updateState = () => {
    const isMuted = audio.muted;
    player.classList.toggle("is-muted", isMuted);
    toggle.setAttribute("aria-pressed", String(!isMuted));
    toggle.setAttribute("aria-label", isMuted ? "Unmute background music" : "Mute background music");
  };

  const disableToggle = () => {
    player.classList.add("is-disabled", "is-muted");
    toggle.disabled = true;
    toggle.setAttribute("aria-pressed", "false");
    toggle.setAttribute("aria-label", "Background music unavailable");
  };

  const tryPlay = () => {
    audio.play().catch(() => {});
  };

  const unlockAudio = () => {
    if (!audio.muted) tryPlay();
    document.removeEventListener("pointerdown", unlockAudio);
    document.removeEventListener("keydown", unlockAudio);
  };

  toggle.addEventListener("click", () => {
    if (toggle.disabled) return;
    audio.muted = !audio.muted;
    if (!audio.muted) tryPlay();
    updateState();
  });

  audio.addEventListener("error", disableToggle);
  document.addEventListener("pointerdown", unlockAudio, { once: true });
  document.addEventListener("keydown", unlockAudio, { once: true });
  tryPlay();
  updateState();
};

const initialize = () => {
  document.title = config.meta.title;
  document.querySelector('meta[name="description"]').content = config.meta.description;

  byId("site-name").textContent = config.brand.name;
  byId("site-tagline").textContent = config.brand.tagline;
  byId("games-title").textContent = config.serverSelection.title;
  byId("site-footer").textContent = config.meta.footer || "";
  byId("brand").href = config.brand.homeUrl;
  byId("brand-logo").src = asset(config.brand.logo);

  const social = byId("social-link");
  social.hidden = !config.social.visible;
  social.href = config.social.url;
  byId("social-label").textContent = config.social.label;
  byId("social-handle").textContent = config.social.handle;

  renderNavigation();
  renderContentView(isNewsRoute() ? "news" : "servers");
  renderSidebar();
  const syncRouteView = () => renderContentView(isNewsRoute() ? "news" : "servers");
  window.addEventListener("popstate", syncRouteView);
  window.addEventListener("hashchange", syncRouteView);
  initializeAudioPlayer();

  const modal = byId("content-modal");
  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  };
  byId("modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
};

initialize();

