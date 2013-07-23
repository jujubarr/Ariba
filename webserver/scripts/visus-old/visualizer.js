var StartEndMsStack = [];

function UpdateStartEndMsStack (iTimeMs)
{
    StartEndMsStack.push(iTimeMs);
}


// Assign handlers immediately after making the request,
// and remember the jqxhr object for this request
function VisualizerWebSocket (url)
{
    var that = this,
        MIN_AJAX_DELAY_MS = 300,
        iTimeSinceLastPoll = (new Date()).getTime();

    function updateUrl(sUrl)
    {
        if (StartEndMsStack.length) {
            sUrl = sUrl + "?startTimeMs=" + StartEndMsStack[0] + "&endTimeMs="
                + StartEndMsStack[StartEndMsStack.length - 1];
            StartEndMsStack = [];
        }

        return sUrl;
    }

    function poll ()
    {
        $.ajax({url : updateUrl(url), dataType: "text"}).done(function(data)
        {
            // alert("success : " + data);
            that.onmessage({ data : data });
            var iTime = (new Date()).getTime(),
                iDiff = iTime - iTimeSinceLastPoll;
            iTimeSinceLastPoll = iTime;

            // ensures a minimum delay between requests of 300ms
            // I saw a situation where hundreds of requests were going per
            // second and this prevents that - msnider
            setTimeout(poll, MIN_AJAX_DELAY_MS > iDiff ?
                MIN_AJAX_DELAY_MS - iDiff : 1);
        }).fail(function()
        {
            // alert("error");
            setTimeout(poll, 10000);
        });
    }

    setTimeout(poll, 100);
}