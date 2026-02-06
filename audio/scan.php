<?php
/**
 * Audio Folder Scanner
 * Returns a JSON list of MP3 files in this directory
 *
 * If using a PHP server, this file automatically scans the audio folder.
 * Access via: audio/scan.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$audioDir = __DIR__;
$files = [];

// Scan for MP3 files
$mp3Files = glob($audioDir . '/*.mp3');

if ($mp3Files) {
    foreach ($mp3Files as $file) {
        $filename = basename($file);
        $files[] = $filename;
    }

    // Sort alphabetically
    sort($files, SORT_NATURAL | SORT_FLAG_CASE);
}

echo json_encode($files);
