function listener(details) {
  let hostURL = details.documentUrl;
  let targetURL = details.url;
  let method = details.method;
  let requestBody = details.requestBodyOptional;
  
  //DO NOT intercept anything other than Google Meet
  let googleMeetURL = "https://meet.google.com/_meet"; 
  let googleMeetCreateMeetingServiceAPI = "https://meetings.clients6.google.com/$rpc/google.rtc.meetings.v1.MeetingSpaceService/CreateMeetingSpace";
  
  if(targetURL != googleMeetCreateMeetingServiceAPI) {
        return {};
  }
  
  let filter = browser.webRequest.filterResponseData(details.requestId);
  let decoder = new TextDecoder("utf-8");
  let encoder = new TextEncoder();

  filter.ondata = event => {
    let str = decoder.decode(event.data, {stream: true});
    try{
        let data = atob(str);
        var parts = splitMulti(data, ['"', '\f', '\u0005', '\u0002', '\u0012', '\u0013', '\u001a', '\n', '\t', '$', '*']);
        var filtered = parts.filter(Boolean);
        if(filtered.length == 7){
            //console.log(filtered); // Print raw array
            console.log("Meeting URL: " + filtered[2]);
            console.log("Dial-in: (" + filtered[5] + ") " + filtered[3]);
            console.log("PIN: " + filtered[4]);
        }
    }
    catch(e){
        // ignore.
    }
    
    filter.write(encoder.encode(str));
    filter.disconnect();
  }

  return {};
}

function splitMulti(str, tokens){
        var tempChar = tokens[0];
        for(var i = 1; i < tokens.length; i++){
            str = str.split(tokens[i]).join(tempChar);
        }
        str = str.split(tempChar);
        return str;
}

myArray = ["google.com"];
patterns = myArray.map(item=>`https://*.${item}/*`)

browser.webRequest.onBeforeRequest.addListener(
  listener,
  {urls: patterns, types: ["xmlhttprequest"]},
  ["blocking", "requestBody"]
);
