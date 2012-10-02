<?php
header ('Content-type: application/json');

$data = array (
  'version'   => 0.03
);

$base = 'ferwebProsirenje';
$extension = '.user.js';
$siteUrl = 'http://fly.srk.fer.hr/~mak/gm/fwProsirenje/';

//echo 'lala'

function genVersionFilename ($version) {
  global $base, $extension;

  $versionStr = str_replace ('.', '-', (float)$version);
  $filename = $base . '-' . $versionStr . $extension;

  return $filename;
}

if (!isset ($_GET['option']) || !isset ($_GET['callback'])) {
  echo '""';
  exit;
}

switch ($_GET['option']) {
  case 'versionCheck':
    echo $_GET['callback'] . '(' . json_encode ($data['version']) . ')';
  break;
  
  case 'getlink':
    if (!isset ($_GET['version'])) {
      echo '""';
      exit;
    }

    echo $_GET['callback'] . '(' . json_encode (htmlspecialchars ($siteUrl . genVersionFilename ($_GET['version']), ENT_QUOTES)) . ')';
  break;

  default:
    echo '""';
}
