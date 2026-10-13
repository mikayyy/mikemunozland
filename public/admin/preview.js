import { embedFor, excerpt } from "./motes-core.mjs";
const h = window.h;
const SourceControl = window.createClass({
  getInitialState() {
    return { status: "" };
  },
  async resolve() {
    const value = this.props.value || "";
    if (!/^https:\/\/lnkd\.in\/p\//.test(value)) return;
    this.setState({ status: "Resolving LinkedIn post…" });
    try {
      const response = await fetch(
        "/.netlify/functions/motes-link?url=" + encodeURIComponent(value),
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not resolve the post.");
      if ((this.props.value || "") === value) this.props.onChange(result.url);
      this.setState({
        status: "LinkedIn post resolved. Check the preview before publishing.",
      });
    } catch (error) {
      this.setState({
        status:
          error.message ||
          "Add the copied LinkedIn embed code to show this post.",
      });
    }
  },
  render() {
    return h(
      "div",
      {},
      h("input", {
        id: this.props.forID,
        type: "url",
        value: this.props.value || "",
        onChange: (event) => this.props.onChange(event.target.value),
        onBlur: this.resolve,
        style: {
          width: "100%",
          padding: 12,
          border: "1px solid #aaa",
          borderRadius: 4,
        },
      }),
      h(
        "p",
        { "aria-live": "polite", style: { fontSize: 13 } },
        this.state.status,
      ),
    );
  },
});
const Preview = window.createClass({
  render() {
    const data = this.props.entry.get("data").toJS();
    const players = [...(data.media || [])];
    if (embedFor(data.sourceUrl, data.linkedinEmbed)?.provider === "linkedin")
      players.push({
        type: "embed",
        url: data.sourceUrl,
        embedCode: data.linkedinEmbed,
        caption: data.sourceTitle,
      });
    return h(
      "main",
      { className: "motes-wrap detail-wrap" },
      h(
        "article",
        { className: "mote detail-mote" },
        h(
          "div",
          { className: "post-meta" },
          data.publishedAt
            ? new Date(data.publishedAt).toLocaleDateString("en-US", {
                timeZone: "America/New_York",
              })
            : "Publication date",
          ...(data.topics || []).map((topic) =>
            h("span", { className: "topic", key: topic }, topic),
          ),
        ),
        h(
          "h1",
          {},
          data.title || excerpt(data.body, "", 65) || "A Mote from Michael",
        ),
        h("div", { className: "mote-body" }, this.props.widgetFor("body")),
        ...players.map((item, index) => {
          const embed = embedFor(item.url, item.embedCode);
          if (embed)
            return h(
              "figure",
              {
                className: `mote-media provider-${embed.provider}`,
                key: index,
              },
              h("iframe", {
                title: item.caption || embed.provider,
                src: embed.src,
                width: "100%",
                height: embed.height,
                style: { border: 0 },
                allow: "encrypted-media; fullscreen; picture-in-picture",
              }),
              h(
                "a",
                { href: item.url, target: "_blank", rel: "noopener" },
                "Open original ↗",
              ),
            );
          if (item.type === "image")
            return h(
              "figure",
              { className: "mote-media", key: index },
              h("img", {
                src: this.props.getAsset(item.file)?.toString() || item.file,
                alt: item.alt || "",
              }),
              h("figcaption", {}, item.caption),
            );
          if (["audio", "video"].includes(item.type))
            return h(
              "figure",
              { className: "mote-media", key: index },
              h(item.type, {
                controls: true,
                preload: "none",
                src: this.props.getAsset(item.file)?.toString() || item.file,
                "aria-label": item.label,
              }),
              h("figcaption", {}, item.caption),
            );
          return null;
        }),
        h(
          "p",
          { className: "sample-caption" },
          "Preview only. Save draft and review before publishing.",
        ),
      ),
    );
  },
});
window.CMS.registerPreviewStyle("/admin/preview.css");
window.CMS.registerPreviewTemplate("motes", Preview);
window.CMS.registerWidget("mote-source", SourceControl);
window.CMS.init();
