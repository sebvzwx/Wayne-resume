const data = window.resumeData;
const editStorageKey = "html-resume-edits";

const text = (value) => document.createTextNode(value);

function createElement(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.append(text(content));
  return element;
}

function renderBasics() {
  document.getElementById("candidate-name").textContent = data.basics.name;
  document.getElementById("candidate-target").textContent = data.basics.intent;
  document.getElementById("candidate-summary").textContent = data.basics.summary;

  // 标题与描述跟随 resume-data.js，避免改定位后 index.html 里的静态文案脱节
  document.title = `${data.basics.name} - ${data.basics.title}`;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute("content", `${data.basics.name} - ${data.basics.title} HTML 简历`);
  }

  const info = [
    ["社媒ID", data.basics.socialId],
    ["本科院校", data.basics.undergraduate],
    ["硕士院校", data.basics.graduate],
    ["邮箱", data.basics.email],
    ["手机号码", data.basics.phone],
    ["毕业年份", data.basics.graduationYear],
    ["关键词", data.highlights.join(" / ")]
  ];

  const container = document.getElementById("personal-info");
  info
    .filter(([, value]) => Boolean(value))
    .forEach(([label, value]) => {
      const item = createElement("article", "info-item");
      item.append(createElement("strong", "", label));
      item.append(createElement("span", "", value));
      container.append(item);
    });
}

function renderInternships() {
  const container = document.querySelector('[data-list="internships"]');

  data.internships.forEach((item) => {
    const article = createElement("article", "timeline-item");
    const header = createElement("header", "item-header");
    const titleWrap = createElement("div");
    titleWrap.append(createElement("h4", "", item.company));
    titleWrap.append(createElement("p", "role", item.role));
    header.append(titleWrap);
    header.append(createElement("time", "", item.period));
    article.append(header);
    if (item.summary) {
      article.append(createElement("p", "item-summary", item.summary));
    }

    if (item.achievements.length) {
      const list = createElement("ul", "achievement-list");
      item.achievements.forEach((achievement) => {
        const listItem = createElement("li");
        listItem.append(createElement("strong", "", `${achievement.label}：`));
        listItem.append(text(achievement.text));
        list.append(listItem);
      });
      article.append(list);
    }

    container.append(article);
  });
}

function renderSkills() {
  const container = document.querySelector('[data-list="skills"]');

  data.skills.forEach((item) => {
    const article = createElement("article", "skill-item");
    article.append(createElement("strong", "", `${item.category}：`));
    article.append(createElement("span", "", item.items));
    container.append(article);
  });
}

function toMarkdown() {
  const lines = [
    `# ${data.basics.name} - ${data.basics.title}`,
    "",
    data.basics.intent,
    "",
    ...[
      ["社媒ID", data.basics.socialId],
      ["本科院校", data.basics.undergraduate],
      ["硕士院校", data.basics.graduate],
      ["邮箱", data.basics.email],
      ["手机号码", data.basics.phone],
      ["毕业年份", data.basics.graduationYear]
    ]
      .filter(([, value]) => Boolean(value))
      .map(([label, value]) => `- ${label}：${value}`),
    "",
    "## 核心关键词",
    ...data.highlights.map((item) => `- ${item}`),
    "",
    "## 实习经历"
  ];

  data.internships.forEach((item) => {
    lines.push("", `### ${item.company} - ${item.role}`, `时间：${item.period}`);
    if (item.summary) lines.push("", item.summary);
    item.achievements.forEach((achievement) => {
      lines.push(`- **${achievement.label}：**${achievement.text}`);
    });
  });

  lines.push("", "## 核心技能");
  data.skills.forEach((item) => {
    lines.push(`- **${item.category}：**${item.items}`);
  });

  return lines.join("\n");
}

async function copyToClipboard(value, button) {
  await navigator.clipboard.writeText(value);
  const original = button.textContent;
  button.textContent = "已复制";
  setTimeout(() => {
    button.textContent = original;
  }, 1400);
}

function bindActions() {
  document.querySelector('[data-action="toggle-edit"]').addEventListener("click", (event) => {
    toggleEditMode(event.currentTarget);
  });
  document.querySelector('[data-action="reset-content"]').addEventListener("click", () => {
    if (!confirm("确定要清除本地保存的编辑内容，恢复到 resume-data.js 的原始内容吗？")) return;
    localStorage.removeItem(editStorageKey);
    location.reload();
  });
  document.querySelector('[data-action="print"]').addEventListener("click", () => window.print());
  document.querySelector('[data-action="copy-markdown"]').addEventListener("click", (event) => {
    copyToClipboard(toMarkdown(), event.currentTarget);
  });
  document.querySelector('[data-action="copy-json"]').addEventListener("click", (event) => {
    copyToClipboard(JSON.stringify(data, null, 2), event.currentTarget);
  });
}

// ---- 实时编辑：将可编辑元素标记为 contenteditable，并把改动持久化到 localStorage ----

const EDITABLE_SELECTOR =
  "#candidate-name, #candidate-target, #candidate-summary, .info-item span, .item-header h4, .item-header .role, .item-header time, .item-summary, .achievement-list li, .skill-item strong, .skill-item span";

function elementPath(el) {
  const resume = document.getElementById("resume");
  const path = [];
  let node = el;
  while (node && node !== resume) {
    const parent = node.parentElement;
    if (!parent) break;
    const index = Array.from(parent.children).indexOf(node);
    path.unshift(index);
    node = parent;
  }
  return path.join(".");
}

function loadEdits() {
  try {
    return JSON.parse(localStorage.getItem(editStorageKey) || "{}");
  } catch (error) {
    return {};
  }
}

function saveEdit(path, value) {
  const edits = loadEdits();
  edits[path] = value;
  localStorage.setItem(editStorageKey, JSON.stringify(edits));
}

function applySavedEdits() {
  const edits = loadEdits();
  const resume = document.getElementById("resume");
  resume.querySelectorAll(EDITABLE_SELECTOR).forEach((el) => {
    const path = elementPath(el);
    if (Object.prototype.hasOwnProperty.call(edits, path)) {
      el.textContent = edits[path];
    }
  });
}

function toggleEditMode(button) {
  const resume = document.getElementById("resume");
  const enabling = !resume.classList.contains("edit-mode");
  resume.classList.toggle("edit-mode", enabling);

  const editable = resume.querySelectorAll(EDITABLE_SELECTOR);
  editable.forEach((el) => {
    el.setAttribute("contenteditable", enabling ? "true" : "false");
  });

  if (enabling) {
    button.textContent = "关闭实时编辑";
    editable.forEach((el) => {
      el.addEventListener("blur", handleEditableBlur);
    });
  } else {
    button.textContent = "开启实时编辑";
    editable.forEach((el) => {
      el.removeEventListener("blur", handleEditableBlur);
    });
  }
}

function handleEditableBlur(event) {
  const el = event.currentTarget;
  saveEdit(elementPath(el), el.textContent);
}

renderBasics();
renderInternships();
renderSkills();
applySavedEdits();
bindActions();