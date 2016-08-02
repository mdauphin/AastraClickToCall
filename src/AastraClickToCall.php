<?php
$phoneIP = 0;
$num = 0;

if (isset($_GET["num"])) $num = $_GET["num"];	//phone number to call
if (isset($_GET["phoneIP"])) $phoneIP = "".$_GET["phoneIP"]."";		//your phone IP


function push2phone($phone, $xml) {
   $post ="POST / HTTP/1.1\r\n";
   $post.="Host: $phone\r\n";
   $post.="Referer: $phone\r\n";
   $post.="Connection: Close\r\n";
   $post.="Content-Type: text/xml\r\n";
   $post.="Content-Length: ".(strlen($xml)+4)."\r\n\r\n";

   $fp = @fsockopen($phone, 80, $errno, $errstr, 5);
   if ($fp) {
       @stream_set_timeout($fp, 10);
       @fwrite($fp, $post."xml=".$xml);
       @fflush($fp);
       $response = @fgets($fp);
       @fclose($fp);
       if (strpos($response, '200 OK') === false) {
           echo "Denied : {$response}\n";
           return false;
       }
   } else {
       echo "Error fsockopen: ({$errno}) {$errstr}\n";
       return false;
   }
     return true;
}


$xmlDial='<AastraIPPhoneExecute><ExecuteItem URI="Dial:'.$num.'" interruptCall="no"/></AastraIPPhoneExecute>';

push2phone($phoneIP, $xmlDial);

?>

