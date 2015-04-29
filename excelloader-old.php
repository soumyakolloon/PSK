<?php
//header("Content-Type: ".$_POST['contentType']);
//header("Content-Disposition: inline; filename=Export-".date("Ymd").".xlsx");
$filename =$_POST['fileName']."-".$_POST['date'] . ".xlsx";
header("Content-Disposition: attachment; filename=\"$filename\"");
header("Content-Type: application/vnd.ms-excel");
header('Cache-Control: max-age=0');
echo base64_decode($_POST['content']);