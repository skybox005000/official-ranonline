#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-officialranonlineph.com}"
SITE_ROOT="${SITE_ROOT:-/var/www/officialranonlineph.com}"
NGINX_CONF="${NGINX_CONF:-/etc/nginx/sites-available/officialranonlineph.com}"
WEB_USER="${WEB_USER:-www-data}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run this script with sudo:"
  echo "sudo bash setup-publish-server.sh"
  exit 1
fi

echo "Setting up publish.php support for ${DOMAIN}"

if ! command -v nginx >/dev/null 2>&1; then
  echo "Nginx is not installed or not in PATH."
  exit 1
fi

if ! command -v php-fpm >/dev/null 2>&1 && ! compgen -G "/run/php/php*-fpm.sock" >/dev/null; then
  echo "Installing PHP-FPM..."
  apt-get update
  apt-get install -y php-fpm
fi

PHP_SOCK="$(find /run/php -maxdepth 1 -type s -name 'php*-fpm.sock' | sort -V | tail -n 1 || true)"
if [ -z "${PHP_SOCK}" ]; then
  echo "Could not find a PHP-FPM socket in /run/php."
  echo "Try: sudo systemctl status php*-fpm"
  exit 1
fi

PHP_SERVICE="$(basename "${PHP_SOCK}" .sock)"
if systemctl list-unit-files "${PHP_SERVICE}.service" >/dev/null 2>&1; then
  systemctl enable --now "${PHP_SERVICE}" >/dev/null 2>&1 || true
fi

if [ ! -f "${NGINX_CONF}" ]; then
  echo "Nginx config not found: ${NGINX_CONF}"
  echo "Set NGINX_CONF=/path/to/site.conf and run again."
  exit 1
fi

if [ ! -d "${SITE_ROOT}" ]; then
  echo "Site root not found: ${SITE_ROOT}"
  echo "Set SITE_ROOT=/path/to/site/root and run again."
  exit 1
fi

if [ ! -f "${SITE_ROOT}/publish.php" ]; then
  echo "Missing ${SITE_ROOT}/publish.php"
  echo "Upload publish.php to the site root first, then run this script again."
  exit 1
fi

if [ ! -f "${SITE_ROOT}/assets/js/published-data.js" ]; then
  echo "Missing ${SITE_ROOT}/assets/js/published-data.js"
  exit 1
fi

if [ ! -d "${SITE_ROOT}/assets/img" ]; then
  echo "Missing ${SITE_ROOT}/assets/img"
  exit 1
fi

BACKUP="${NGINX_CONF}.bak.$(date +%Y%m%d%H%M%S)"
cp "${NGINX_CONF}" "${BACKUP}"
echo "Backed up Nginx config to ${BACKUP}"

python3 - "$NGINX_CONF" "$PHP_SOCK" <<'PY'
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
php_sock = sys.argv[2]
text = path.read_text()

publish_block = f"""
    location = /publish.php {{
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:{php_sock};
    }}
"""

index_redirect_block = """
    location = /index.html {
        return 301 /;
    }
"""

if "location = /index.html" not in text:
    marker = "    location = /publish.php"
    if marker in text:
        text = text.replace(marker, index_redirect_block + "\n" + marker, 1)
    else:
        last_server_close = text.rfind("\n}")
        if last_server_close == -1:
            raise SystemExit("Could not find the server block closing brace.")
        text = text[:last_server_close] + index_redirect_block + text[last_server_close:]

if "location = /publish.php" not in text:
    marker = "    location ~* \\.(?:css|js|jpg|jpeg|gif|png|webp|svg|ico|woff2?)$ {"
    if marker in text:
        text = text.replace(marker, publish_block + "\n" + marker, 1)
    else:
        last_server_close = text.rfind("\n}")
        if last_server_close == -1:
            raise SystemExit("Could not find the server block closing brace.")
        text = text[:last_server_close] + publish_block + text[last_server_close:]

text = text.replace("index index.html;", "index index.html index.php;")
path.write_text(text)
PY

echo "Updated Nginx config with PHP handler for /publish.php"

chown "${WEB_USER}:${WEB_USER}" "${SITE_ROOT}/assets/js/published-data.js"
chown "${WEB_USER}:${WEB_USER}" "${SITE_ROOT}/assets/img"
chmod 664 "${SITE_ROOT}/assets/js/published-data.js"
chmod 775 "${SITE_ROOT}/assets/img"
echo "Updated write permissions for published-data.js and assets/img"

nginx -t
systemctl reload nginx

echo "Done."
echo "Test this URL now:"
echo "https://${DOMAIN}/publish.php"
echo "Expected response:"
echo '{"ok":false,"message":"Use POST to publish changes."}'


