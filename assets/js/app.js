const config = window.siteConfig;

const byId = (id) => document.getElementById(id);
const asset = (path) => window.resolveSiteAsset?.(path) || path;

const renderNavigation = () => {
  const groups = {
    left: byId("nav-left"),
    right: byId("nav-right"),
  };

  config.navigation.forEach(({ label, url, position, active = false }) => {
    const link = document.createElement("a");
    const text = document.createElement("span");
    link.href = url;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    text.textContent = label;
    link.append(text);
    groups[position].append(link);
  });
};

const renderEpisodes = () => {
  const list = byId("game-list");
  const pagination = byId("game-pagination");
  const pageSize = 5;

  const renderPage = (currentPage) => {
    list.replaceChildren();
    const start = (currentPage - 1) * pageSize;
    config.serverSelection.episodes.slice(start, start + pageSize).forEach((item) => {
      const card = document.createElement("article");
      card.className = "game-card";

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
      copy.append(title, description);

      const details = document.createElement("a");
      details.className = "details";
      details.href = item.url;
      details.textContent = `${config.serverSelection.detailsLabel} `;
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
  const heading = byId("fact-heading");
  const description = byId("fact-description");
  const dots = byId("sidebar-dots");

  const showSlide = (index) => {
    const slide = slides[index];
    activeIndex = index;
    const card = document.querySelector(".fact-card");
    card.classList.add("is-changing");
    byId("sidebar-image").style.backgroundImage = `url("${asset(slide.image)}")`;
    byId("sidebar-label").textContent = slide.label || "";
    heading.replaceChildren(document.createTextNode(`${slide.title} `));
    if (slide.highlight) {
      const highlight = document.createElement("strong");
      highlight.textContent = slide.highlight;
      heading.append(highlight);
    }
    description.textContent = slide.description || "";
    [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
    requestAnimationFrame(() => card.classList.remove("is-changing"));
  };

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show sidebar slide ${index + 1}`);
    dot.addEventListener("click", () => showSlide(index));
    dots.append(dot);
  });
  showSlide(0);
  if (slides.length > 1) {
    setInterval(() => showSlide((activeIndex + 1) % slides.length), Math.max(3000, Number(config.sidebar.interval) || 6000));
  }
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
};

initialize();
