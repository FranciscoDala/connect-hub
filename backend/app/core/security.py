import re
from urllib.parse import urlparse
import bleach
from passlib.context import CryptContext

# ===== SEU CODIGO MANTIDO =====
ALLOWED_HTML_TAGS = {
    "p", "br", "b", "strong", "i", "em", "u", "s", "strike", "sup", "sub",
    "ul", "ol", "li", "blockquote", "code", "pre", "a", "span", "div",
    "h1", "h2", "h3", "h4", "h5", "h6", "hr", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "td", "th", "mark", "small",
}
ALLOWED_HTML_ATTRIBUTES = {
    "a": ["href", "target", "rel", "title"],
    "img": ["src", "alt", "title"],
    "span": ["class"],
    "div": ["class"],
    "p": ["class"],
    "table": ["class"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan"],
}

def sanitize_html(value: str | None) -> str:
    if value is None:
        return ""
    text = value.strip()
    if not text:
        return ""
    cleaned = bleach.clean(
        text,
        tags=ALLOWED_HTML_TAGS,
        attributes=ALLOWED_HTML_ATTRIBUTES,
        strip=True,
        protocols=["http", "https", "mailto"],
    )
    cleaned = re.sub(r"(?is)on\w+\s*=\s*(?:\"|').*?(?:\"|')", "", cleaned)
    cleaned = re.sub(r"(?is)(?:href|src)\s*=\s*(?:\"|')\s*(?:javascript:|data:)", "", cleaned)
    return cleaned

def sanitize_text(value: str | None, *, max_length: int | None = None) -> str:
    if value is None:
        return ""
    text = bleach.clean(value, tags=[], attributes={}, strip=True)
    text = re.sub(r"\s+", " ", text).strip()
    if max_length is not None and len(text) > max_length:
        text = text[:max_length].rstrip()
    return text

def sanitize_url(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    if not value:
        return None
    if value.startswith("/"):
        return value
    parsed = urlparse(value)
    if parsed.scheme in {"http", "https"} and parsed.netloc:
        return value
    return None

# ===== ADIÇÃO SEGURA - NÃO APAGA O DE CIMA =====
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
