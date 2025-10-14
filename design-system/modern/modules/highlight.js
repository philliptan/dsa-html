// modules/highlight.js
// -----------------------------------------
// Tiny zero-dependency syntax highlighter
// Supports HTML, CSS, and JS
// -----------------------------------------

const TAG_RE = /(&lt;\/?[a-zA-Z0-9\-]+|\/?&gt;)/g;
const ATTR_RE = /([a-zA-Z-:]+)(=)("[^"]*"|'[^']*')/g;
const COMMENT_RE = /(&lt;!--[\s\S]*?--&gt;)/g;

const CSS_RULE_RE = /([^{]+){([^}]*)}/g;
const CSS_PROP_RE = /([\w-]+)\s*:\s*([^;]+);?/g;

const JS_KEYWORDS =
  /\b(const|let|var|function|return|if|else|for|while|switch|case|break|class|new|import|export|extends|try|catch|finally|throw|await|async)\b/g;
const JS_STRING = /('[^']*'|"[^"]*"|`[^`]*`)/g;
const JS_COMMENT = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
const JS_NUMBER = /\b\d+(\.\d+)?\b/g;

export function highlight(code, lang = "html") {
  const esc = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (lang === "html") return highlightHTML(esc);
  if (lang === "css") return highlightCSS(esc);
  if (lang === "js" || lang === "javascript") return highlightJS(esc);
  return esc;
}

function highlightHTML(code) {
  return code
    .replace(COMMENT_RE, '<span class="hl-comment">$1</span>')
    .replace(TAG_RE, '<span class="hl-tag">$1</span>')
    .replace(ATTR_RE, '<span class="hl-attr">$1</span>$2<span class="hl-value">$3</span>');
}

function highlightCSS(code) {
  return code.replace(CSS_RULE_RE, (m, selector, body) => {
    const highlightedBody = body.replace(
      CSS_PROP_RE,
      '<span class="hl-prop">$1</span>: <span class="hl-value">$2</span>;'
    );
    return `<span class="hl-selector">${selector}</span>{${highlightedBody}}`;
  });
}

function highlightJS(code) {
  return code
    .replace(JS_COMMENT, '<span class="hl-comment">$1</span>')
    .replace(JS_STRING, '<span class="hl-string">$1</span>')
    .replace(JS_NUMBER, '<span class="hl-number">$&</span>')
    .replace(JS_KEYWORDS, '<span class="hl-keyword">$1</span>');
}
