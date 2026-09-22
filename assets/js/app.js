const config = window.siteConfig;

const byId = (id) => document.getElementById(id);
const asset = (path) => window.resolveSiteAsset?.(path) || path;

const menuContent = {
  News: [{ label: "Latest CLPL Development Posts", action: "news" }],
  Guide: [
    { label: "How to Download Client on PC", action: "placeholder", type: "Video Guide" },
    { label: "How to Download Client on Mobile", action: "placeholder", type: "Video Guide" },
  ],
  Download: [
    { label: "Episode 7 Classic", action: "placeholder", type: "Download" },
    { label: "RAN Online – 2012 Classic", action: "placeholder", type: "Download" },
  ],
  "About Us": [{ label: "About CLPL Developments", action: "placeholder", type: "About Us" }],
  Ranking: [{ label: "About CLPL Developments", action: "placeholder", type: "About Us" }],
  Support: [
    { label: "RAN EP7 Classic Support", url: "https://www.facebook.com/official.ranonlineep7classic.support" },
    { label: "Official Page of Upcoming", action: "placeholder", type: "Support" },
    { label: "Official Page of Upcoming", action: "placeholder", type: "Support" },
  ],
};

const openModal = (item) => {
  const modal = byId("content-modal");
  byId("modal-eyebrow").textContent = item.type || (item.action === "news" ? "News" : "");
  byId("modal-title").textContent = item.label;
  const body = byId("modal-body");
  body.replaceChildren();
  if (item.action === "news") {
    const intro = document.createElement("p");
    intro.textContent = "The latest public updates from CLPL Developments appear here.";
    const frame = document.createElement("iframe");
    frame.className = "facebook-feed";
    frame.title = "CLPL Developments Facebook posts";
    frame.loading = "lazy";
    frame.allow = "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
    frame.src = "https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fclpl.developments&tabs=timeline&width=500&height=560&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false";
    const external = document.createElement("a");
    external.className = "modal-action";
    external.href = "https://www.facebook.com/clpl.developments";
    external.target = "_blank";
    external.rel = "noopener";
    external.textContent = "Open Facebook Page";
    body.append(intro, frame, external);
  } else {
    const mark = document.createElement("div");
    mark.className = "build-mark";
    mark.textContent = "⌛";
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

const renderNavigation = () => {
  const groups = {
    left: byId("nav-left"),
    right: byId("nav-right"),
  };

  config.navigation.forEach(({ label: configuredLabel, url, position, active = false }) => {
    const label = configuredLabel === "Ranking" ? "About Us" : configuredLabel;
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
    if (items.length) {
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
          if (item.url) {
            option.target = "_blank";
            option.rel = "noopener";
          } else {
            option.addEventListener("click", (event) => {
              event.preventDefault();
              openModal(item);
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

const monthsOld = (date) => {
  if (!date) return "New Server";
  const launched = new Date(`${date}T00:00:00`);
  const now = new Date();
  const months = Math.max(0, (now.getFullYear() - launched.getFullYear()) * 12 + now.getMonth() - launched.getMonth());
  return `${months} Month${months === 1 ? "" : "s"} Old`;
};

const renderEpisodes = () => {
  const list = byId("game-list");
  const pagination = byId("game-pagination");
  const pageSize = 5;

  const renderPage = (currentPage) => {
    list.replaceChildren();
    const start = (currentPage - 1) * pageSize;
    config.serverSelection.episodes.slice(start, start + pageSize).forEach((item, pageIndex) => {
      const absoluteIndex = start + pageIndex;
      const locked = item.locked ?? absoluteIndex > 0;
      const card = document.createElement("article");
      card.className = "game-card";
      card.classList.toggle("is-locked", locked);

      const art = document.createElement("div");
      art.className = "art";
      art.style.backgroundImage = `url("${asset(item.image)}")`;
      const episode = document.createElement("span");
      episode.textContent = item.episode;
      art.append(episode);

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
      const age = document.createElement("span");
      age.textContent = locked ? "0 Months Old" : monthsOld(item.launchedAt);
      meta.append(status, age);
      copy.append(title, description, meta);

      const details = document.createElement(locked ? "span" : "a");
      details.className = "details";
      if (!locked) details.href = item.url;
      details.textContent = locked ? "🔒 Coming Soon " : `${config.serverSelection.detailsLabel} `;
      const arrow = document.createElement("b");
      arrow.textContent = "›";
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
  if (!slides.length) return;
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

  const tryPlay = () => {
    audio.play().catch(() => {});
  };

  const unlockAudio = () => {
    if (!audio.muted) tryPlay();
    document.removeEventListener("pointerdown", unlockAudio);
    document.removeEventListener("keydown", unlockAudio);
  };

  toggle.addEventListener("click", () => {
    audio.muted = !audio.muted;
    if (!audio.muted) tryPlay();
    updateState();
  });

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
  renderEpisodes();
  renderSidebar();
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
