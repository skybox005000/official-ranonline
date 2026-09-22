<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const PUBLISH_PASSWORD = 'i4ncut33';

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'message' => 'Use POST to publish changes.']);
}

$payload = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($payload)) {
    respond(400, ['ok' => false, 'message' => 'Invalid publish request.']);
}

$password = (string)($payload['password'] ?? '');
if (!hash_equals(PUBLISH_PASSWORD, $password)) {
    respond(403, ['ok' => false, 'message' => 'Invalid publish password.']);
}

$data = $payload['data'] ?? null;
if (!is_array($data)) {
    respond(400, ['ok' => false, 'message' => 'Missing site data.']);
}

$root = __DIR__;
$publishedFile = $root . '/assets/js/published-data.js';
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($json === false) {
    respond(400, ['ok' => false, 'message' => 'Could not encode site data.']);
}

$script = "window.sitePublishedConfig = {$json};\n"
    . "if (!window.isLocalRun || !window.isLocalRun()) {\n"
    . "  window.siteConfig = window.createSiteConfig ? window.createSiteConfig(window.sitePublishedConfig) : window.sitePublishedConfig;\n"
    . "}\n";
$tmpFile = $publishedFile . '.tmp';
if (file_put_contents($tmpFile, $script, LOCK_EX) === false || !rename($tmpFile, $publishedFile)) {
    @unlink($tmpFile);
    respond(500, ['ok' => false, 'message' => 'Could not write assets/js/published-data.js. Check permissions.']);
}

$savedImages = 0;
$images = $payload['images'] ?? [];
if (is_array($images)) {
    foreach ($images as $path => $dataUrl) {
        $path = (string)$path;
        $dataUrl = (string)$dataUrl;

        if (!preg_match('#^assets/img/[a-z0-9._-]+\.(png|jpe?g|webp|gif|svg)$#i', $path)) {
            continue;
        }

        if (!preg_match('#^data:([a-z0-9/+.-]+);base64,(.+)$#i', $dataUrl, $match)) {
            continue;
        }

        $bytes = base64_decode($match[2], true);
        if ($bytes === false || $bytes === '') {
            continue;
        }

        $imageFile = $root . '/' . $path;
        if (file_put_contents($imageFile, $bytes, LOCK_EX) !== false) {
            $savedImages++;
        }
    }
}

respond(200, [
    'ok' => true,
    'message' => 'Published changes successfully.',
    'images' => $savedImages
]);
