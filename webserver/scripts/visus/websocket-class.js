define(function(require) {
	//var Variables = require('variables');
	
	//WebSocket Class	
		var websocket = ring.create({
			MIN_AJAX_DELAY_MS : {},
			iTimeSinceLastPoll : {},
			url : {},

			onopen : function()
			{
				time_server = 0;
				console.log("onOpen");
			},

			onclose : function()
			{
				console.log("onClose");
			},

			pushOnTransaction : function(i, oTxn)
			{
				transactions.push(oTxn);
			},

			onmessage : function(evt)
			{
				var oData = JSON.parse(evt.data),
					that = this,
					aDelayGroup1 = [],
					aDelayGroup2 = [],
					aDelayGroup3 = [],
					aDelayGroup4 = [];

				// for the 24 hour visualization we randomize when the
				// transaction
				// enters the animation stream to smooth out when lines
				// appear/disappear
				$.each(oData.POs, function(i, x)
				{
					switch (UrlConfig.show24 ? i % 5 : 0) {
						case 0:
							transactions.push(x);
							break;
						case 1:
							aDelayGroup1.push(x);
							break;
						case 2:
							aDelayGroup2.push(x);
							break;
						case 3:
							aDelayGroup3.push(x);
							break;
						case 4:
							aDelayGroup4.push(x);
							break;
					}
				});

				setTimeout(function()
				{
					$.each(aDelayGroup1, function()
					{
						that.pushOnTransaction();
					});
				}, 250);

				setTimeout(function()
				{
					$.each(aDelayGroup2, function()
					{
						that.pushOnTransaction();
					});
				}, 500);

				setTimeout(function()
				{
					$.each(aDelayGroup3, function()
					{
						that.pushOnTransaction();
					});
				}, 750);

				setTimeout(function()
				{
					$.each(aDelayGroup4, function()
					{
						that.pushOnTransaction();
					});
				}, 1000);
			},

			onerror : function(evt)
			{
				console.log("Error :" + evt.data);
			},

			doSend : function(msg)
			{
				
				console.log("Demand aggregated data.");
				websocket.send(msg);
			},

			updateUrl : function(sUrl)
			{
				if (StartEndMsStack.length) {
					sUrl = sUrl + "?startTimeMs=" + StartEndMsStack[0] + "&endTimeMs="
							+ StartEndMsStack[StartEndMsStack.length - 1];
					StartEndMsStack = [];
				}

				return sUrl;
			},

			poll : function()
			{
				var that = this;
				$.ajax({
					url : this.updateUrl(this.url),
					dataType : "text"
				}).done(
						function(data)
						{
							// alert("success : " + data);
							that.onmessage({
								data : data
							});
							var iTime = (new Date()).getTime(), iDiff = iTime
									- that.iTimeSinceLastPoll;
							that.iTimeSinceLastPoll = iTime;

							// ensures a minimum delay between requests of 300ms
							// I saw a situation where hundreds of requests were
							// going per
							// second and this prevents that - msnider
							setTimeout(function()
							{
								that.poll();
							}, that.MIN_AJAX_DELAY_MS > iDiff ? that.MIN_AJAX_DELAY_MS
									- iDiff : 1);
						}).fail(function()
				{
					// alert("error");
					setTimeout(function()
					{
						that.poll();
					}, 10000);
				});
			},

			init : function(url)
			{
				var that = this;
				this.url = url;
				this.MIN_AJAX_DELAY_MS = 300;
				iTimeSinceLastPoll = (new Date()).getTime();
				setTimeout(function()
				{
					that.poll();
				}, 100);
			}
		});
	return websocket;	
});