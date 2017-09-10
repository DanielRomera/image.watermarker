<?php

$masters = "/var/www/html/imageswatermark/images/masters";
$dir_watermarked = "/var/www/html/imageswatermark/images/watermarked";
$watermark = "/var/www/html/imageswatermark/images/watermark/logo.png";

$iterator = new RecursiveDirectoryIterator($masters, FilesystemIterator::SKIP_DOTS);
foreach ($iterator as $fileinfo) {
mkdir($dir_watermarked."/".$fileinfo->getFileName());
}

$objects = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($masters, FilesystemIterator::SKIP_DOTS));
foreach($objects as $name => $file){
watermark_image($file->getPathname(), $masters, $dir_watermarked, $watermark);
}

function watermark_image($filename, $masters, $dir_watermarked, $watermark_filename)
{
$watermark = imagecreatefrompng($watermark_filename);
$im = imagecreatefromjpeg($filename);

$right_offset = 10;
$bottom_offset = 10;
$sx = imagesx($watermark);
$sy = imagesy($watermark);

imagecopy($im, $watermark, imagesx($im) - $sx - $right_offset, imagesy($im) - $sy - $bottom_offset, 0, 0, imagesx($watermark), imagesy($watermark));

$output_filename = explode($masters, $filename)[1];

imagejpeg($im, $dir_watermarked.$output_filename, 95);
imagedestroy($im);
}

?>

