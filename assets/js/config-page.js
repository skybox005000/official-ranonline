(() => {
  const PASSWORD = "i4ncut33";
  const AUTH_KEY = "ran-online-config-auth";
  const clone = (value) => structuredClone(value);
  const baseConfig = clone(window.siteConfig);
  let workingConfig = clone(baseConfig);
  const baseImageAssets = clone(window.siteAssetOverrides || {});
  let imageAssets = clone(baseImageAssets);
  let episodeIndex = -1;
  let sidebarIndex = -1;
  let dirty = false;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const authPanel = $("#authPanel");
  const adminPanel = $("#adminPanel");
  const configForm = $("#configForm");
  const sectionPicker = $("#sectionPicker");
  const publishButton = $("#publishButton");
  const resetButton = $("#resetChangesButton");
  const status = $("#statusMessage");
  const modal = $("#episodeModal");
  const episodeForm = $("#episodeForm");
  const sidebarModal = $("#sidebarModal");
  const sidebarForm = $("#sidebarForm");

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

  const renderForm = () => {
    $$("[name]", configForm).forEach((field) => {
      const value = getPath(workingConfig, field.name);
      if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = value ?? "";
    });
    renderEpisodes();
    renderSidebarSlides();
  };

  const renderEpisodes = () => {
    $("#episodeEditor").innerHTML = workingConfig.serverSelection.episodes.map((episode, index) => `
      <article class="config-item">
        <div class="config-item__summary">
          <strong>${escapeHtml(episode.episode)} — ${escapeHtml(episode.title)}</strong>
          <span>${escapeHtml(episode.description)}</span>
        </div>
        <div class="config-item__actions">
          <button class="button config-item__edit" type="button" data-edit-episode="${index}">Edit</button>
          <button class="button config-item__remove" type="button" data-delete-episode="${index}">Delete</button>
        </div>
      </article>
    `).join("");
  };

  const renderSidebarSlides = () => {
    $("#sidebarEditor").innerHTML = workingConfig.sidebar.slides.map((slide, index) => `
      <article class="config-item">
        <div class="config-item__summary">
          <strong>${escapeHtml(slide.label || "Sidebar")} — ${escapeHtml(slide.title)}</strong>
          <span>${escapeHtml(slide.description)}</span>
        </div>
        <div class="config-item__actions">
          <button class="button config-item__edit" type="button" data-edit-sidebar="${index}">Edit</button>
          <button class="button config-item__remove" type="button" data-delete-sidebar="${index}">Delete</button>
        </div>
      </article>
    `).join("");
  };

  const collectVisibleFields = () => {
    $$("[name]", configForm).forEach((field) => {
      setPath(workingConfig, field.name, field.type === "checkbox" ? field.checked : field.value.trim());
    });
  };

  const openEpisode = (index) => {
    episodeIndex = index;
    const episode = index < 0
      ? { episode: "", title: "", description: "", image: "", url: "#" }
      : workingConfig.serverSelection.episodes[index];
    $("#episodeModalTitle").textContent = index < 0 ? "Add Episode" : "Edit Episode";
    $$("[name]", episodeForm).forEach((field) => {
      field.value = episode[field.name] ?? "";
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
    sessionStorage.setItem(AUTH_KEY, "1");
    $("#authMessage").textContent = "";
    showAdmin();
  });

  $("#logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem(AUTH_KEY);
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
      renderEpisodes();
      setDirty(true, "Episode deleted. Publish to save it.");
    }
  });
  $("#addEpisodeButton").addEventListener("click", () => openEpisode(-1));

  $("#sidebarEditor").addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-sidebar]");
    if (button) openSidebar(Number(button.dataset.editSidebar));
    const deleteButton = event.target.closest("[data-delete-sidebar]");
    if (deleteButton) {
      const index = Number(deleteButton.dataset.deleteSidebar);
      if (!confirm(`Delete “${workingConfig.sidebar.slides[index].title}”?`)) return;
      workingConfig.sidebar.slides.splice(index, 1);
      renderSidebarSlides();
      setDirty(true, "Sidebar slide deleted. Publish to save it.");
    }
  });
  $("#addSidebarButton").addEventListener("click", () => openSidebar(-1));

  episodeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const episode = {};
    $$("[name]", episodeForm).forEach((field) => episode[field.name] = field.value.trim());
    if (episodeIndex < 0) workingConfig.serverSelection.episodes.push(episode);
    else workingConfig.serverSelection.episodes[episodeIndex] = episode;
    renderEpisodes();
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
    closeSidebar();
    setDirty(true, "Sidebar slide updated. Publish to save it.");
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

  configForm.addEventListener("submit", (event) => {
    event.preventDefault();
    collectVisibleFields();
    localStorage.setItem(window.CONFIG_STORAGE_KEY, JSON.stringify(workingConfig));
    localStorage.setItem(window.ASSET_STORAGE_KEY, JSON.stringify(imageAssets));
    setDirty(false, "Changes published successfully.");
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

  if (sessionStorage.getItem(AUTH_KEY) === "1") showAdmin();
  else showAuth();
})();
