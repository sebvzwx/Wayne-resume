const data = window.resumeData;

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
  document.querySelector('[data-action="print"]').addEventListener("click", () => window.print());
  document.querySelector('[data-action="copy-markdown"]').addEventListener("click", (event) => {
    copyToClipboard(toMarkdown(), event.currentTarget);
  });
  document.querySelector('[data-action="copy-json"]').addEventListener("click", (event) => {
    copyToClipboard(JSON.stringify(data, null, 2), event.currentTarget);
  });
}

renderBasics();
renderInternships();
renderSkills();
bindActions();
