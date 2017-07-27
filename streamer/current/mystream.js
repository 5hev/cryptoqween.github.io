var quote = {};

var aEx = [ "Yobit", "Poloniex" ];

var createDom = function(pair) {
	var wrapper = document.getElementById("content");
	var div = document.createElement("div");
	var html = '<div class="wrapper">';
	html += '<span id="fsym_'+ pair +'"></span> - <span id="tsym_'+ pair +'"></span>';
	aEx.forEach(function(item,i,aEx){
		html += '</br><span>' + item +': </span></br><div class="price" id="price_'+ pair +'_'+ item +'"></div>';
	});
	html += '</div>';
/*	
	html += '<div class="label">24h Change: <span class="value" id="change_'+ pair +'"></span> (<span class="value" id="changepct_'+ pair +'"></span>)</div>';
	html += '<div class="label">Last Market: <span class="market" id="market_'+ pair +'"></span></div>';
	html += '<div class="label">Last Trade Id: <span class="value" id="tradeid_'+ pair +'"></span></div>';
	html += '<div class="label">Last Trade Volume: <span class="value" id="volume_'+ pair +'"></span></div>';
	html += '<div class="label">Last Trade VolumeTo: <span class="value" id="volumeto_'+ pair +'"></span></div>';
	html += '<div class="label">24h Volume: <span class="value" id="24volume_'+ pair +'"></span></div>';
	html += '<div class="label">24h VolumeTo: <span class="value" id="24volumeto_'+ pair +'"></span></div>';
	html += '<div class="source"> Source: <a href="http://www.cryptocompare.com">CryptoCompare</a></div>';
	html += '</div>';
*/	
	div.innerHTML = html;
	wrapper.appendChild(div);
};

var displayQuote = function(_quote) {
	console.log("> .");

	var fsym = CCC.STATIC.CURRENCY.SYMBOL[_quote.FROMSYMBOL];
	var tsym = CCC.STATIC.CURRENCY.SYMBOL[_quote.TOSYMBOL];
	var pair = _quote.FROMSYMBOL + _quote.TOSYMBOL;
	//console.log(_quote);
	//console.log(pair);
	
	document.getElementById("fsym_" + pair).innerHTML = _quote.FROMSYMBOL;
	document.getElementById("tsym_" + pair).innerHTML = _quote.TOSYMBOL;
/*	
	document.getElementById("market_" + pair).innerHTML = _quote.LASTMARKET;
	document.getElementById("price_" + pair).innerHTML = _quote.PRICE;
	document.getElementById("volume_" + pair).innerHTML = CCC.convertValueToDisplay(fsym, _quote.LASTVOLUME);
	document.getElementById("volumeto_" + pair).innerHTML = CCC.convertValueToDisplay(tsym, _quote.LASTVOLUMETO);
	document.getElementById("24volume_" + pair).innerHTML = CCC.convertValueToDisplay(fsym, _quote.VOLUME24HOUR);	
	document.getElementById("24volumeto_" + pair).innerHTML = CCC.convertValueToDisplay(tsym, _quote.VOLUME24HOURTO);
	document.getElementById("tradeid_" + pair).innerHTML = _quote.LASTTRADEID.toFixed(0);
	document.getElementById("tradeid_" + pair).innerHTML = _quote.LASTTRADEID.toFixed(0);
	document.getElementById("change_" + pair).innerHTML = CCC.convertValueToDisplay(tsym, _quote.CHANGE24H);
	document.getElementById("changepct_" + pair).innerHTML = _quote.CHANGEPCT24H.toFixed(2) + "%";
*/
	aEx.forEach (function(item,i,aEx){
		if (_quote.FLAGS === "4") {
			document.getElementById("price_" + pair + "_" + item).className = "";
			console.log("> " + item + "> Flag = 4. No work");
		} else if (_quote.LASTMARKET === item) {
				document.getElementById("price_" + pair + "_" + item).innerHTML = _quote.PRICE;
				console.log("> " + item + "> Flag = "+ _quote.FLAGS +". Last market obtained: " + _quote.LASTMARKET);
		}
		if (_quote.FLAGS === "1"){
			document.getElementById("price_" + pair + "_" + item).className = "up";
		} else if (_quote.FLAGS === "2") {
			document.getElementById("price_" + pair + "_" + item).className = "down";
		}
	});
	
}

var updateQuote = function(result) {

	var keys = Object.keys(result);
	var pair = result.FROMSYMBOL + result.TOSYMBOL;
	if (!quote.hasOwnProperty(pair)) {
		quote[pair] = {}
		createDom(pair);
	}
	for (var i = 0; i <keys.length; ++i) {
		quote[pair][keys[i]] = result[keys[i]];
	}
	quote[pair]["CHANGE24H"] = quote[pair]["PRICE"] - quote[pair]["OPEN24HOUR"];
	quote[pair]["CHANGEPCT24H"] = quote[pair]["CHANGE24H"]/quote[pair]["OPEN24HOUR"] * 100;
	displayQuote(quote[pair]);
}

var socket = io.connect('https://streamer.cryptocompare.com/');

//Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
//Use SubscriptionId 0 for TRADE, 2 for CURRENT and 5 for CURRENTAGG
//For aggregate quote updates use CCCAGG as market
var subscription = ['5~CCCAGG~BTC~LTC', '5~CCCAGG~BTC~ETH'];

socket.emit('SubAdd', {subs:subscription} );

socket.on("m", function(message){
	var messageType = message.substring(0, message.indexOf("~"));
	var res = {};
	if (messageType === CCC.STATIC.TYPE.CURRENTAGG) {
		res = CCC.CURRENT.unpack(message);
		//console.log(res);
		updateQuote(res);
	}						
});
