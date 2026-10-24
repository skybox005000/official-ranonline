(() => {
  const PASSWORD = "i4ncut33";
  const AUTH_KEY = "ran-online-config-auth";
  const clone = (value) => structuredClone(value);
  const baseConfig = clone(window.createSiteConfig
    ? window.createSiteConfig(window.siteConfig || {})
    : window.siteConfig);
  let workingConfig = clone(baseConfig);
  const baseImageAssets = clone(window.siteAssetOverrides || {});
  let imageAssets = clone(baseImageAssets);
  let episodeIndex = -1;
  let sidebarIndex = -1;
  let newsIndex = -1;
  let downloadGroupIndex = -1;
  let downloadIndex = -1;
  let dirty = false;
  let publishPassword = "";

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
  const newsColorFor = (category) => newsCategoryColors[category] || "#c6923d";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const authPanel = $("#authPanel");
  const adminPanel = $("#adminPanel");
  const configForm = $("#configForm");
  const sectionPicker = $("#sectionPicker");
  const publishTargetMessage = $("#publishTargetMessage");
  const publishButton = $("#publishButton");
  const resetButton = $("#resetChangesButton");
  const status = $("#statusMessage");
  const modal = $("#episodeModal");
  const episodeForm = $("#episodeForm");
  const sidebarModal = $("#sidebarModal");
  const sidebarForm = $("#sidebarForm");
  const newsModal = $("#newsModal");
  const newsForm = $("#newsForm");
  const downloadModal = $("#downloadModal");
  const downloadForm = $("#downloadForm");

  const getPath = (object, path) =>
    path.split(".").reduce((value, key) => value?.[key], object);

  const setPath = (object, path, value) => {
    const keys = path.split(".");
    const finalKey = keys.pop();
    const target = keys.reduce((value, key) => (value[key] ??= {}), object);
    target[finalKey] = value;
  };

  const showAuth = () => {
    authPanel.hidden = false;
    adminPanel.hidden = true;
    $("#authPassword").focus();
  };

  const showAdmin = () => {
    authPanel.hidden = true;
    adminPanel.hidden = false;
    renderForm();
  };

  const setDirty = (value, message = "") => {
    dirty = value;
    publishButton.disabled = !value;
    resetButton.disabled = !value;
    status.textContent = message;
  };

  const getPublishMode = () => window.isLocalRun() ? "local" : "php";

  const syncPublishTarget = () => {
    const mode = getPublishMode();
    const isLocalPreview = mode === "local";
    publishTargetMessage.textContent = isLocalPreview
      ? "Browser preview only. Open the deployed Config page to publish for everyone."
      : "Publishing to the live site for everyone.";
    publishButton.textContent = isLocalPreview ? "Save Browser Preview" : "Publish Changes";
  };

  const renderForm = () => {
    $$("[name]", configForm).forEach((field) => {
      const value = getPath(workingConfig, field.name);
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = value ?? "";
    });
    renderEpisodes();
    renderSidebarSlides();
    renderNews();
    renderDownloads();
  };

  const renderEpisodes = () => {
    const editor = $("#episodeEditor");
    if (!workingConfig.serverSelection.episodes.length) {
      editor.innerHTML = `<div class="config-empty"><strong>No servers yet</strong><span>Add a server to show it on the public selection page.</span></div>`;
      return;
    }
    editor.innerHTML = workingConfig.serverSelection.episodes.map((episode, index) => `
      <article class="config-item">
        <div class="config-item__summary">
          <strong>${escapeHtml(episode.episode)} - ${escapeHtml(episode.title)}</strong>
          <span>${escapeHtml(episode.description)}</span>
        </div>
        <div class="config-item__actions">
          <label class="config-item__switch">
            <input type="checkbox" data-toggle-episode-lock="${index}" ${episode.locked ? "checked" : ""}>
            <i aria-hidden="true"></i>
            <span>Coming Soon</span>
          </label>
          <button class="button config-item__edit" type="button" data-edit-episode="${index}">Edit</button>
          <button class="button config-item__remove" type="button" data-delete-episode="${index}">Delete</button>
        </div>
      </article>
    `).join("");
  };

  const renderSidebarSlides = () => {
    const editor = $("#sidebarEditor");
    if (!workingConfig.sidebar.slides.length) {
      editor.innerHTML = `<div class="config-empty"><strong>No sidebar slides yet</strong><span>Add a slide to publish announcements, facts, or launch previews.</span></div>`;
      return;
    }
    editor.innerHTML = workingConfig.sidebar.slides.map((slide, index) => `
      <article class="config-item">
        <div class="config-item__summary">
          <strong>${escapeHtml(slide.label || "Sidebar")} - ${escapeHtml(slide.title)}</strong>
          <span>${escapeHtml(slide.description)}</span>
        </div>
        <div class="config-item__actions">
          <button class="button config-item__edit" type="button" data-edit-sidebar="${index}">Edit</button>
          <button class="button config-item__remove" type="button" data-delete-sidebar="${index}">Delete</button>
        </div>
      </article>
    `).join("");
  };


  const renderNews = () => {
    workingConfig.news ??= { title: "Latest News", items: [] };
    workingConfig.news.items ??= [];
    const editor = $("#newsEditor");
    if (!workingConfig.news.items.length) {
      editor.innerHTML = `<div class="config-empty"><strong>No news yet</strong><span>Add an update to show it in the News modal.</span></div>`;
      return;
    }
    editor.innerHTML = workingConfig.news.items.map((item, index) => `
      <article class="config-item">
        <div class="config-item__summary">
          <strong>${escapeHtml(item.category || "News")} - ${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.excerpt || item.details || "")}</span>
        </div>
        <div class="config-item__actions">
          <button class="button config-item__edit" type="button" data-edit-news="${index}">Edit</button>
          <button class="button config-item__remove" type="button" data-delete-news="${index}">Delete</button>
        </div>
      </article>
    `).join("");
  };
  const renderDownloads = () => {
    const editor = $("#downloadEditor");
    syncDownloadTemplates();
    const groups = workingConfig.downloads?.servers || [];
    if (!groups.length) {
      editor.innerHTML = `<div class="config-empty"><strong>No servers yet</strong><span>Add a server-selection entry to create its download template.</span></div>`;
      return;
    }
    editor.innerHTML = groups.map((group, groupIndex) => `
      <article class="config-item config-item--stacked">
        <div class="config-item__summary">
          <strong>${escapeHtml(group.episode || `Server ${groupIndex + 1}`)} - ${escapeHtml(group.title || "Downloads")}</strong>
          <span>${group.placeholderSoon ? "Showing Coming Soon placeholder." : "Mega NZ, Google Drive, MediaFire, and installation guide template."}</span>
        </div>
        <div class="config-item__actions">
          <label class="config-item__switch">
            <input type="checkbox" data-toggle-download-placeholder="${groupIndex}" ${group.placeholderSoon ? "checked" : ""}>
            <i aria-hidden="true"></i>
            <span>Coming Soon</span>
          </label>
        </div>
        <div class="config-download-provider-list">
          ${(group.items || []).map((item, itemIndex) => `
            <div class="config-download-provider">
              <span><strong>${escapeHtml(item.title || `Provider ${itemIndex + 1}`)}</strong>${escapeHtml(item.link || "#")}</span>
              <button class="button config-item__edit" type="button" data-edit-download-group="${groupIndex}" data-edit-download="${itemIndex}">Edit</button>
            </div>
          `).join("")}
        </div>
      </article>
    `).join("");
  };
  const collectVisibleFields = () => {
    $$("[name]", configForm).forEach((field) => {
      setPath(workingConfig, field.name, field.type === "checkbox" ? field.checked : field.value.trim());
    });
  };

  const readFormField = (field) => field.type === "checkbox" ? field.checked : field.value.trim();

  const writeFormField = (field, value) => {
    if (field.type === "checkbox") field.checked = Boolean(value);
    else field.value = value ?? "";
  };

  const serverDownloadKey = (server = {}) =>
    [server.episode || "", server.title || "", server.image || ""].join("|").toLowerCase();

  const defaultServerDownloads = (episode = "Server") =>
    (workingConfig.downloads?.items || []).map((item) => ({
      ...item,
      description: (item.description || "").replace("RAN Online", episode),
    }));

  const createDownloadGroup = (server = {}, existing = {}) => ({
    ...existing,
    serverKey: serverDownloadKey(server),
    episode: server.episode || existing.episode || "Server",
    title: server.title || existing.title || "Downloads",
    placeholderSoon: existing.placeholderSoon ?? Boolean(server.locked),
    items: existing.items?.length ? existing.items : defaultServerDownloads(server.episode || "Server"),
    installation: {
      content: workingConfig.downloads?.installation?.content
        || existing.installation?.content
        || "",
    },
  });

  const syncDownloadTemplates = () => {
    workingConfig.downloads ??= { items: [], servers: [], installation: { content: "" } };
    workingConfig.downloads.items ??= [];
    workingConfig.downloads.servers ??= [];
    const existing = workingConfig.downloads.servers;
    workingConfig.downloads.servers = (workingConfig.serverSelection?.episodes || []).map((server) => {
      const key = serverDownloadKey(server);
      const match = existing.find((group) =>
        group.serverKey === key
        || (group.episode || "").toLowerCase() === (server.episode || "").toLowerCase());
      return createDownloadGroup(server, match || {});
    });
  };

  const openEpisode = (index) => {
    episodeIndex = index;
    const episode = index < 0
      ? { episode: "", title: "", status: "Online", ageLabel: "New Server", locked: false, description: "", details: "Server rollout information will be posted here.\nRates, features, and download details are coming soon.", image: "", url: "#" }
      : workingConfig.serverSelection.episodes[index];
    $("#episodeModalTitle").textContent = index < 0 ? "Add Episode" : "Edit Episode";
    $$("[name]", episodeForm).forEach((field) => {
      writeFormField(field, episode[field.name]);
    });
    modal.hidden = false;
    document.body.classList.add("has-config-editor");
    episodeForm.elements.episode.focus();
  };

  const closeEpisode = () => {
    modal.hidden = true;
    document.body.classList.remove("has-config-editor");
    episodeIndex = -1;
  };

  const openSidebar = (index) => {
    sidebarIndex = index;
    const slide = index < 0
      ? { label: "", title: "", highlight: "", description: "", image: "" }
      : workingConfig.sidebar.slides[index];
    $("#sidebarModalTitle").textContent = index < 0 ? "Add Sidebar Slide" : "Edit Sidebar Slide";
    $$("[name]", sidebarForm).forEach((field) => field.value = slide[field.name] ?? "");
    sidebarModal.hidden = false;
    document.body.classList.add("has-config-editor");
    sidebarForm.elements.label.focus();
  };

  const closeSidebar = () => {
    sidebarModal.hidden = true;
    document.body.classList.remove("has-config-editor");
    sidebarIndex = -1;
  };


  const openNews = (index) => {
    newsIndex = index;
    workingConfig.news ??= { title: "Latest News", items: [] };
    workingConfig.news.items ??= [];
    const existing = index < 0
      ? { title: "", category: "Announcement", date: new Date().toISOString().slice(0, 10), excerpt: "", details: "", image: "", url: "" }
      : workingConfig.news.items[index];
    const item = {
      ...existing,
      category: newsCategoryColors[existing.category] ? existing.category : "Announcement",
      customCategory: existing.customCategory || (newsCategoryColors[existing.category] ? "" : existing.category || ""),
      color: existing.color || newsColorFor(existing.category),
    };
    $("#newsModalTitle").textContent = index < 0 ? "Add News" : "Edit News";
    $$("[name]", newsForm).forEach((field) => writeFormField(field, item[field.name]));
    newsModal.hidden = false;
    document.body.classList.add("has-config-editor");
    newsForm.elements.title.focus();
  };

  const closeNews = () => {
    newsModal.hidden = true;
    document.body.classList.remove("has-config-editor");
    newsIndex = -1;
  };
  const openDownload = (groupIndex, index) => {
    downloadGroupIndex = groupIndex;
    downloadIndex = index;
    const group = workingConfig.downloads?.servers?.[downloadGroupIndex];
    const item = index < 0 || !group
      ? { title: "", description: "", version: "Official", link: "#", logo: "" }
      : group.items[index];
    $("#downloadModalTitle").textContent = `Edit ${group?.episode || "Server"} Download`;
    $$("[name]", downloadForm).forEach((field) => {
      writeFormField(field, item[field.name]);
    });
    downloadModal.hidden = false;
    document.body.classList.add("has-config-editor");
    downloadForm.elements.title.focus();
  };

  const closeDownload = () => {
    downloadModal.hidden = true;
    document.body.classList.remove("has-config-editor");
    downloadGroupIndex = -1;
    downloadIndex = -1;
  };

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");

  $("#authForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if ($("#authPassword").value !== PASSWORD) {
      $("#authMessage").textContent = "Invalid password.";
      $("#authPassword").select();
      return;
    }
    publishPassword = $("#authPassword").value;
    sessionStorage.setItem(AUTH_KEY, "1");
    $("#authMessage").textContent = "";
    showAdmin();
  });

  $("#logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem(AUTH_KEY);
    publishPassword = "";
    $("#authPassword").value = "";
    showAuth();
  });

  sectionPicker.addEventListener("change", () => {
    $$("[data-config-section]").forEach((section) => {
      section.hidden = section.dataset.configSection !== sectionPicker.value;
    });
    status.textContent = "";
  });

  configForm.addEventListener("input", () => {
    collectVisibleFields();
    setDirty(true, "You have unpublished changes.");
  });

  $("#episodeEditor").addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-episode]");
    if (button) openEpisode(Number(button.dataset.editEpisode));
    const deleteButton = event.target.closest("[data-delete-episode]");
    if (deleteButton) {
      const index = Number(deleteButton.dataset.deleteEpisode);
      if (!confirm(`Delete ${workingConfig.serverSelection.episodes[index].episode}?`)) return;
      workingConfig.serverSelection.episodes.splice(index, 1);
      syncDownloadTemplates();
      renderEpisodes();
      renderDownloads();
      setDirty(true, "Episode deleted. Publish to save it.");
    }
  });
  $("#episodeEditor").addEventListener("change", (event) => {
    const toggle = event.target.closest("[data-toggle-episode-lock]");
    if (!toggle) return;
    const index = Number(toggle.dataset.toggleEpisodeLock);
    const episode = workingConfig.serverSelection.episodes[index];
    episode.locked = toggle.checked;
    episode.status = toggle.checked
      ? "Coming Soon"
      : (episode.status === "Coming Soon" ? "Online" : episode.status || "Online");
    syncDownloadTemplates();
    renderEpisodes();
    renderDownloads();
    setDirty(true, `${episode.episode || "Server"} ${toggle.checked ? "locked" : "unlocked"}. Publish to save it.`);
  });
  $("#addEpisodeButton").addEventListener("click", () => openEpisode(-1));

  $("#sidebarEditor").addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-sidebar]");
    if (button) openSidebar(Number(button.dataset.editSidebar));
    const deleteButton = event.target.closest("[data-delete-sidebar]");
    if (deleteButton) {
      const index = Number(deleteButton.dataset.deleteSidebar);
      if (!confirm(`Delete "${workingConfig.sidebar.slides[index].title}"?`)) return;
      workingConfig.sidebar.slides.splice(index, 1);
      renderSidebarSlides();
    renderNews();
      setDirty(true, "Sidebar slide deleted. Publish to save it.");
    }
  });
  $("#addSidebarButton").addEventListener("click", () => openSidebar(-1));


  $("#newsEditor").addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-news]");
    if (button) openNews(Number(button.dataset.editNews));
    const deleteButton = event.target.closest("[data-delete-news]");
    if (deleteButton) {
      const index = Number(deleteButton.dataset.deleteNews);
      if (!confirm(`Delete ${workingConfig.news.items[index].title}?`)) return;
      workingConfig.news.items.splice(index, 1);
      renderNews();
      setDirty(true, "News item deleted. Publish to save it.");
    }
  });
  $("#addNewsButton").addEventListener("click", () => openNews(-1));
  $("#downloadEditor").addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-download]");
    if (button) openDownload(Number(button.dataset.editDownloadGroup), Number(button.dataset.editDownload));
  });
  $("#downloadEditor").addEventListener("change", (event) => {
    const toggle = event.target.closest("[data-toggle-download-placeholder]");
    if (!toggle) return;
    syncDownloadTemplates();
    const group = workingConfig.downloads.servers[Number(toggle.dataset.toggleDownloadPlaceholder)];
    if (!group) return;
    group.placeholderSoon = toggle.checked;
    renderDownloads();
    setDirty(true, `${group.episode || "Server"} download placeholder ${toggle.checked ? "enabled" : "disabled"}. Publish to save it.`);
  });

  episodeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const episode = {};
    $$("[name]", episodeForm).forEach((field) => {
      episode[field.name] = readFormField(field);
    });
    if (episodeIndex < 0) workingConfig.serverSelection.episodes.push(episode);
    else workingConfig.serverSelection.episodes[episodeIndex] = episode;
    syncDownloadTemplates();
    renderEpisodes();
    renderDownloads();
    closeEpisode();
    setDirty(true, "Episode updated. Publish to save it.");
  });

  sidebarForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const slide = {};
    $$("[name]", sidebarForm).forEach((field) => slide[field.name] = field.value.trim());
    if (sidebarIndex < 0) workingConfig.sidebar.slides.push(slide);
    else workingConfig.sidebar.slides[sidebarIndex] = slide;
    renderSidebarSlides();
    renderNews();
    closeSidebar();
    setDirty(true, "Sidebar slide updated. Publish to save it.");
  });


  newsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const item = {};
    $$("[name]", newsForm).forEach((field) => item[field.name] = field.value.trim());
    item.category = item.customCategory || item.category || "Announcement";
    item.color = item.color || newsColorFor(item.category);
    delete item.customCategory;
    workingConfig.news ??= { title: "Latest News", items: [] };
    workingConfig.news.items ??= [];
    if (newsIndex < 0) workingConfig.news.items.unshift(item);
    else workingConfig.news.items[newsIndex] = item;
    renderNews();
    closeNews();
    setDirty(true, "News item updated. Publish to save it.");
  });
  downloadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    syncDownloadTemplates();
    const group = workingConfig.downloads.servers[downloadGroupIndex];
    if (!group) return;
    const item = {};
    $$("[name]", downloadForm).forEach((field) => item[field.name] = field.value.trim());
    group.items[downloadIndex] = item;
    renderDownloads();
    closeDownload();
    setDirty(true, "Download updated. Publish to save it.");
  });

  $$(".config-editor__close, [data-close-modal]").forEach((button) =>
    button.addEventListener("click", closeEpisode));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeEpisode();
  });
  $$("#sidebarModal .config-editor__close, [data-close-sidebar]").forEach((button) =>
    button.addEventListener("click", closeSidebar));
  sidebarModal.addEventListener("click", (event) => {
    if (event.target === sidebarModal) closeSidebar();
  });

  $$("#newsModal .config-editor__close, [data-close-news]").forEach((button) =>
    button.addEventListener("click", closeNews));
  newsModal.addEventListener("click", (event) => {
    if (event.target === newsModal) closeNews();
  });
  $$("#downloadModal .config-editor__close, [data-close-download]").forEach((button) =>
    button.addEventListener("click", closeDownload));
  downloadModal.addEventListener("click", (event) => {
    if (event.target === downloadModal) closeDownload();
  });

  configForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    collectVisibleFields();
    syncDownloadTemplates();

    syncPublishTarget();

    if (getPublishMode() === "local") {
      localStorage.setItem(window.CONFIG_STORAGE_KEY, JSON.stringify(workingConfig));
      localStorage.setItem(window.ASSET_STORAGE_KEY, JSON.stringify(imageAssets));
      setDirty(false, "Saved in this browser only. These changes are not published.");
      return;
    }

    publishButton.disabled = true;
    status.textContent = "Publishing changes...";

    try {
      const response = await fetch("publish.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: publishPassword || $("#authPassword").value,
          data: workingConfig,
          images: imageAssets,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Could not publish changes.");
      }
      localStorage.removeItem(window.CONFIG_STORAGE_KEY);
      localStorage.removeItem(window.ASSET_STORAGE_KEY);
      imageAssets = {};
      setDirty(false, result.message || "Changes published successfully.");
    } catch (error) {
      publishButton.disabled = false;
      status.textContent = error.message === "Failed to fetch"
        ? "Could not reach publish.php. Open config.html from the deployed PHP site."
        : error.message || "Could not publish changes.";
    }
  });

  resetButton.addEventListener("click", () => {
    workingConfig = clone(baseConfig);
    imageAssets = clone(baseImageAssets);
    renderForm();
    setDirty(false, "Unpublished changes reset.");
  });

  const normalizeFilename = (filename) => {
    const dot = filename.lastIndexOf(".");
    const extension = dot >= 0 ? filename.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
    const base = (dot >= 0 ? filename.slice(0, dot) : filename)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";
    return `${base}${extension}`;
  };

  $$("[data-upload-target]").forEach((input) => {
    input.addEventListener("change", () => {
      const [file] = input.files;
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        status.textContent = "Please upload a valid image file.";
        input.value = "";
        return;
      }
      const path = `assets/img/${normalizeFilename(file.name)}`;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        imageAssets[path] = reader.result;
        const target = input.closest("form, .config-content-section")?.querySelector(`[name="${input.dataset.uploadTarget}"]`);
        if (target) {
          target.value = path;
          target.dispatchEvent(new Event("input", { bubbles: true }));
        }
        status.textContent = `Uploaded as ${path}. Publish to save it.`;
      });
      reader.readAsDataURL(file);
      input.value = "";
    });
  });


  newsForm.elements.category.addEventListener("change", () => {
    if (!newsForm.elements.customCategory.value.trim()) {
      newsForm.elements.color.value = newsColorFor(newsForm.elements.category.value);
    }
  });
  if (sessionStorage.getItem(AUTH_KEY) === "1") {
    publishPassword = PASSWORD;
    showAdmin();
  }
  else showAuth();
  syncPublishTarget();
})();

