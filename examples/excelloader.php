<?php
$today = date("Ymd");   
header("Content-type: ".$_POST['contentType']);
header("Content-disposition: attachment; filename=hello.xlsx");
echo base64_decode($_POST['content']);
?>