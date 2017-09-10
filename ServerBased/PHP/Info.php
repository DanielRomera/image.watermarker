<?php

if(!isset($_GET['directory']) || !$_GET['directory'])
$path = __DIR__."/images/masters/";
else
$path = __DIR__."/images/watermarked/";

$result = ["count"=>0,"size"=>0];

$objects = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path, FilesystemIterator::SKIP_DOTS));
foreach($objects as $file){
$result["size"]+=$file->getSize();
$result["count"]++;
}
echo json_encode($result);
?>
