//globals
var RADIO_CLICK_DELAY = 500;
var TO_HIDE_SELECTORS = {
	"Buy": ".sell input[required], .transfer input[required], .buy-sell input[required]",
	"Sell": ".buy input[required], .transfer input[required], .buy-sell input[required]",
	"Transfer": ".buy input[required], .sell input[required], .buy-sell input[required]",
	"Buy and sell": ".buy input[required], .transfer input[required], .sell input[required]"
};

var TO_MAKE_REQUIRED = {
	"Buy": ".buy input[meta-required-removed='true']",
	"Sell": ".sell input[meta-required-removed='true']",
	"Transfer": ".transfer input[meta-required-removed='true']",
	"Buy and sell": ".buy-sell input[meta-required-removed='true']"
}

var PRICE_REPLACE_TEXT = "price";
var OPTION_REPLACE_TEXT = "option";
var TYPE_REPLACE_TEXT = "type";
var POSTCODE_REPLACE_TEXT = "postcode";

var OPTION_TEXT_MATRIX = {
    Buy: "buy",
    Sell: "sell",
    Transfer: "transfer",
    "Buy and sell": "We will contact you to provide you the best price based on your requirements."
}

var TYPE_TEXT_MATRIX = {
    "Existing Home": "an existing home",
    "Land": "land",
    "apartment/unit/townhouse": "an apartment/unit/townhouse",
    "Off the plan": "off the plan"
}
var BUY_AND_SELL = "Buy and sell";
var BUY_AND_SELL_TEXT = "Since you selected buy and sell we'll need more info...";

//whether to show validation
var shouldShowValidation = false;
var shouldCheckPostcode = false;
//global to keep track of select status
var selectedStatus = "";
$(document).ready(function() {

	//loqate
	/*var control = configureLoqate();
	control.listen("populate", function(address, variations) {
			console.log(address);
            document.getElementById("postcode").value = address.City + ", " + address.PostalCode;
     });
    

    //test loqate
    $("#postcode").change(function() {
    	var value = $(this).val();
    	console.log(value);
    	var Key = "WN86-WF99-YA99-TT77";
    	var Country = "AUS";
    	//Capture_Interactive_Find_v1_00Begin("WN86-WF99-YA99-TT77", value, "#postcode", "AUS", "AUS", 7, "en");
    	//StoreFinder_Interactive_FindPlaceNames_v1_10Begin("WN86-WF99-YA99-TT77", value, "Similar", "AUS")
    	//Geocoding_International_RetrieveNearestPlaces_v1_00Begin(Key, Country, value, 10, 0, "None");
    });*/

    //jQuery autocomplete for postcodes
    $("#postcode, #postcode-sell").autocomplete(
        {
            source: function(request, response) {
                var results = $.ui.autocomplete.filter(POST_CODES_ARRAY, request.term);
                response(results.slice(0, 10));
            }, 
            delay: 500,
            minLength: 2
        }
    );

    //listeners for step 1 and 2 radio clicks
   $("input[name='Property-options']").click(function(event) {
   		//make other inputs not required 
   		var selectedOption = event.currentTarget.value;
   		makeUnRequired(selectedOption);


   		//make sure inputs for selected option are required
   		makeRequired(selectedOption);

    	window.setTimeout(function() {
    		$(".bottom-bar.first-bar a").click();
    	}, RADIO_CLICK_DELAY);
    	
    });

    $("input[name='Property-type']").click(function(event) {
        //check if buy and sell mode and there must be two property types checked
        if ($("input[name='Property-options']:checked").val() === BUY_AND_SELL && $("input[name='Property-type-sell']:checked").length === 0) {
            return;
        }
    	window.setTimeout(function() {
    		$(".bottom-bar a.suburb-btn").click();
    	}, RADIO_CLICK_DELAY);
    	
    });

    $("input[name='Property-type-sell']").click(function(event) {
        //if other is also set
        if ($("input[name='Property-type']:checked").length) {
            window.setTimeout(function() {
                $(".bottom-bar a.suburb-btn").click();
            }, RADIO_CLICK_DELAY);
        }
    });
    
    //form validation

    //for suburb tab
    $(".about-btn").click(function() {
    	shouldCheckPostcode = true;
        var isPostcodeValid = checkPostcode();
        var isPostcodeSellValid = true;
        if ($("input[name='Property-options']:checked").val() === BUY_AND_SELL) {
            isPostcodeSellValid = checkPostcodeSell();
        }
    	if (isPostcodeValid && isPostcodeSellValid) {
    		$("a.about-you").click();
    	} else {
    		return;
    	}
    });

    $("#postcode, #postcode-sell").keyup(function() {
    	if (shouldCheckPostcode) {
    		checkPostcode();
            checkPostcodeSell();
    	}
    });

    $("#Phone-number").keyup(function() {
    	if (shouldShowValidation) {
    		checkPhoneNumber();
    	} 
    	
    });

    $("#Email-address").keyup(function() {
    	if (shouldShowValidation) {
    		checkEmail();
    	} 
    	
    });

    $(".status-select-wrapper select").change(function() {
		
		selectedStatus = $(this).val();
    
    	if (shouldShowValidation) {
    		checkStatus();
    		
    	}
    });

    $("#Name").keyup(function() {
    	if (shouldShowValidation) {
    		checkName();
    	}
    })

    $("div[data-w-tab='About you'] a.optional-btn").click(function() {
    	shouldShowValidation = true;
    	//check name
    	//#name
    	//check phone number
    	checkPhoneNumber();
    	checkEmail();
    	checkStatus();
    	checkName();
    	//check email
    	//#Email-address
    	//check status
    	//#
    	if (checkName() && checkPhoneNumber() && checkEmail() && checkStatus()) {
    		$('.tab-link.optional-questions').click();
    	}
    });


    //quote button listener
    $(".btn-green-quote").click(function() {
    	//populate text
    	populateQuote();
    	//submit mailchimp forms
    	submitToMailchimp();
    });
    
});

var PRICE_MATRIX = {
	Buy: {
		"Existing Home": "900",
		"Land": "900",
		"apartment/unit/townhouse": "1050",
		"Off the plan": "850"
	},
	Sell: {
		"Existing Home": "900",
		"Land": "900",
		"apartment/unit/townhouse": "1050",
		"Off the plan": "850"
	},
	Transfer: {
		"Existing Home": "900",
		"Land": "900",
		"apartment/unit/townhouse": "1050",
		"Off the plan": "850"
	},
	"Buy and sell": {
		"Existing Home": "Contact Us",
		"Land": "Contact Us",
		"apartment/unit/townhouse": "Contact Us",
		"Off the plan": "Contact Us"
	}
}



function populateQuote() {
	var propertyOption = $("input[name='Property-options']:checked").val();
	var propertyType = $("input[name='Property-type']:checked").val();

	//special case for buy and sell
	if (propertyOption === BUY_AND_SELL) {
		
		$(".quote-heading").html(BUY_AND_SELL_TEXT);
		$(".quote-amount").hide();
		$(".quote-inclusions").hide();
		return;
	}

	var postcode = $("#postcode").val();
	var price = PRICE_MATRIX[propertyOption][propertyType];

	//populate quote heading text
	var quoteHeadingText = $(".quote-heading").html();
	quoteHeadingText = replacePlaceholderText(quoteHeadingText, OPTION_REPLACE_TEXT, OPTION_TEXT_MATRIX[propertyOption]);
	quoteHeadingText = replacePlaceholderText(quoteHeadingText, TYPE_REPLACE_TEXT, TYPE_TEXT_MATRIX[propertyType]);
	quoteHeadingText = replacePlaceholderText(quoteHeadingText, POSTCODE_REPLACE_TEXT, postcode);

	//update quote heading
	$(".quote-heading").html(quoteHeadingText);

	//update quote amount price
	var quoteAmountText = $(".quote-amount").html();
	$(".quote-amount").html(replacePlaceholderText(quoteAmountText, PRICE_REPLACE_TEXT, price));
}

function replacePlaceholderText(text, placeholderText, replacementText) {
	var curlyPlaceholderText = "{{" + placeholderText + "}}";
	return text.replace(curlyPlaceholderText, replacementText);
}

function checkPostcode() {
	//postcode checking
	var generalPostcodeRegex = /^[^\,]+, [^\,]+, [012456789]\d{3}/;
	var vicPostcodeRegex = /^[^\,]+, [^\,]+, 3\d{3}/;
	var postcodeValue = $("#postcode").val();


	//check postcode present generally
	if (!postcodeValue) {
		$("#postcode").parent(".validation-field-wrapper").children(".validation-error:not(.outside-victoria-message)").show();
    	return false;
	}
	//if in vic postcode format
	if (vicPostcodeRegex.test(postcodeValue)) {
		$("#postcode").parent(".validation-field-wrapper").children(".validation-error").hide();
		return true;
	} else {
		if (generalPostcodeRegex.test(postcodeValue)) {
			$("#postcode").parent(".validation-field-wrapper").children(".outside-victoria-message").show();
			$("#postcode").parent(".validation-field-wrapper").children(".validation-error:not(.outside-victoria-message)").hide();
		} else {
			$("#postcode").parent(".validation-field-wrapper").children(".outside-victoria-message").hide();
			$("#postcode").parent(".validation-field-wrapper").children(".validation-error:not(.outside-victoria-message)").show();
		}
		return false;
	}
	/*
	if (!$("#postcode").val()) {
    	$("#postcode").parent(".validation-field-wrapper").children(".validation-error:not(.outside-victoria-message)").show();
    	return false;
    } else {
    	$("#postcode").parent(".validation-field-wrapper").children(".validation-error:not(.outside-victoria-message)").hide();
   		return true;
    }*/
}

function checkPostcodeSell() {
    //postcode checking
    var generalPostcodeRegex = /^[^\,]+, [^\,]+, [012456789]\d{3}/;
    var vicPostcodeRegex = /^[^\,]+, [^\,]+, 3\d{3}/;
    var postcodeValue = $("#postcode-sell").val();


    //check postcode present generally
    if (!postcodeValue) {
        $("#postcode-sell").parent(".validation-field-wrapper").children(".validation-error:not(.outside-victoria-message)").show();
        return false;
    }
    //if in vic postcode format
    if (vicPostcodeRegex.test(postcodeValue)) {
        $("#postcode-sell").parent(".validation-field-wrapper").children(".validation-error").hide();
        return true;
    } else {
        if (generalPostcodeRegex.test(postcodeValue)) {
            $("#postcode-sell").parent(".validation-field-wrapper").children(".outside-victoria-message").show();
            $("#postcode-sell").parent(".validation-field-wrapper").children(".validation-error:not(.outside-victoria-message)").hide();
        } else {
            $("#postcode-sell").parent(".validation-field-wrapper").children(".outside-victoria-message").hide();
            $("#postcode-sell").parent(".validation-field-wrapper").children(".validation-error:not(.outside-victoria-message)").show();
        }
        return false;
    }
    /*
    if (!$("#postcode").val()) {
        $("#postcode").parent(".validation-field-wrapper").children(".validation-error:not(.outside-victoria-message)").show();
        return false;
    } else {
        $("#postcode").parent(".validation-field-wrapper").children(".validation-error:not(.outside-victoria-message)").hide();
        return true;
    }*/
}

function checkName() {
	var name = $("#Name").val();
	var nameRegex = /^.+$/;
	if (!nameRegex.test(name)) {
		$("#Name").parent(".validation-field-wrapper").children(".validation-error").show();
		return false;
	} else {
		$("#Name").parent(".validation-field-wrapper").children(".validation-error").hide();
		return true;
	}
}

function checkEmail() {
	var email = $("#Email-address").val();
	var emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	if (!emailRegex.test(email)) {
		$("#Email-address").parent(".validation-field-wrapper").children(".validation-error").show();
		return false;
	} else {
		$("#Email-address").parent(".validation-field-wrapper").children(".validation-error").hide();
		return true;
	}
}

function checkStatus() {
	var NO_SELECTION = "NA";
	var statusValue = $(".validation-field-wrapper.status-select-wrapper select:visible").val();
	if (statusValue === NO_SELECTION) {
		$(".validation-field-wrapper.status-select-wrapper .validation-error").show();
		return false;
	} else {
		$(".validation-field-wrapper.status-select-wrapper .validation-error").hide();
		return true;
	}
}

function checkPhoneNumber() {
	var number = $("#Phone-number").val();
	var numberRegex = /^\({0,1}((0|\+61)(2|4|3|7|8)){0,1}\){0,1}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{1}(\ |-){0,1}[0-9]{3}$/;
	if (!numberRegex.test(number)) {
		$("#Phone-number").parent(".validation-field-wrapper").children(".validation-error").show();
		return false;
	} else {
		$("#Phone-number").parent(".validation-field-wrapper").children(".validation-error").hide();
		return true;
	}
}

function configureLoqate() {
	var fields = [{ element: "postcode", field: "{City!}" }];
	var settings = { key: "WN86-WF99-YA99-TT77", search: { countries: "AUS" }, setCountryByIP: false };
	var control = new pca.Address(fields, settings);
	return control;
}

function makeUnRequired(selectedOption) {
	$(TO_HIDE_SELECTORS[selectedOption]).removeAttr("required").attr("meta-required-removed", "true");

}

function makeRequired(selectedOption) {
	$(TO_MAKE_REQUIRED[selectedOption]).attr("required", true);
}



function Capture_Interactive_Find_v1_00Begin(Key, Text, Container, Origin, Countries, Limit, Language) {
    var script = document.createElement("script"),
        head = document.getElementsByTagName("head")[0],
        url = "https://api.addressy.com/Capture/Interactive/Find/v1.00/json3.ws?";

    // Build the query string
    url += "&Key=" + encodeURIComponent(Key);
    url += "&Text=" + encodeURIComponent(Text);
    //url += "&Container=" + encodeURIComponent(Container);
    url += "&Origin=" + encodeURIComponent(Origin);
    url += "&Countries=" + encodeURIComponent(Countries);
    //url += "&Limit=" + encodeURIComponent(Limit);
    url += "&Language=" + encodeURIComponent(Language);
    url += "&callback=Capture_Interactive_Find_v1_00End";

    script.src = url;

    // Make the request
    script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
            script.onload = script.onreadystatechange = null;
            if (head && script.parentNode)
                head.removeChild(script);
        }
    }

    head.insertBefore(script, head.firstChild);
}

function Capture_Interactive_Find_v1_00End(response) {
	console.log(response);
    // Test for an error
    if (response.Items.length == 1 && typeof(response.Items[0].Error) != "undefined") {
        // Show the error message
        alert(response.Items[0].Description);
    }
    else {
        // Check if there were any items found
        if (response.Items.length == 0)
            alert("Sorry, there were no results");
        else {
            // PUT YOUR CODE HERE
            //FYI: The output is an array of key value pairs (e.g. response.Items[0].Id), the keys being:
            //Id
            //Type
            //Text
            //Highlight
            //Description
        }
    }
}


function StoreFinder_Interactive_FindPlaceNames_v1_10Begin(Key, SearchTerm, MatchType, Country) {
    var script = document.createElement("script"),
        head = document.getElementsByTagName("head")[0],
        url = "https://api.addressy.com/StoreFinder/Interactive/FindPlaceNames/v1.10/json3.ws?";

    // Build the query string
    url += "&Key=" + encodeURIComponent(Key);
    url += "&SearchTerm=" + encodeURIComponent(SearchTerm);
    url += "&MatchType=" + encodeURIComponent(MatchType);
    url += "&Country=" + encodeURIComponent(Country);
    url += "&callback=StoreFinder_Interactive_FindPlaceNames_v1_10End";

    script.src = url;

    // Make the request
    script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
            script.onload = script.onreadystatechange = null;
            if (head && script.parentNode)
                head.removeChild(script);
        }
    }

    head.insertBefore(script, head.firstChild);
}

function StoreFinder_Interactive_FindPlaceNames_v1_10End(response) {

	console.log(response);
    // Test for an error
    if (response.Items.length == 1 && typeof(response.Items[0].Error) != "undefined") {
        // Show the error message
        alert(response.Items[0].Description);
    }
    else {
        // Check if there were any items found
        if (response.Items.length == 0)
            console.log("Sorry, there were no results");
        else {
            // PUT YOUR CODE HERE
            //FYI: The output is an array of key value pairs (e.g. response.Items[0].Id), the keys being:
            //Id
            //Place
        }
    }
}

function Geocoding_International_RetrieveNearestPlaces_v1_00Begin(Key, Country, CentrePoint, MaximumItems, MaximumRadius, FilterOptions) {
    var script = document.createElement("script"),
        head = document.getElementsByTagName("head")[0],
        url = "https://api.addressy.com/Geocoding/International/RetrieveNearestPlaces/v1.00/json3.ws?";

    // Build the query string
    url += "&Key=" + encodeURIComponent(Key);
    url += "&Country=" + encodeURIComponent(Country);
    url += "&CentrePoint=" + encodeURIComponent(CentrePoint);
    url += "&MaximumItems=" + encodeURIComponent(MaximumItems);
    url += "&MaximumRadius=" + encodeURIComponent(MaximumRadius);
    url += "&FilterOptions=" + encodeURIComponent(FilterOptions);
    url += "&callback=Geocoding_International_RetrieveNearestPlaces_v1_00End";

    script.src = url;

    // Make the request
    script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
            script.onload = script.onreadystatechange = null;
            if (head && script.parentNode)
                head.removeChild(script);
        }
    }

    head.insertBefore(script, head.firstChild);
}

function Geocoding_International_RetrieveNearestPlaces_v1_00End(response) {
	console.log(response)
    // Test for an error
    if (response.Items.length == 1 && typeof(response.Items[0].Error) != "undefined") {
        // Show the error message
        alert(response.Items[0].Description);
    }
    else {
        // Check if there were any items found
        if (response.Items.length == 0)
            console.log("Sorry, there were no results");
        else {
            // PUT YOUR CODE HERE
            //FYI: The output is an array of key value pairs (e.g. response.Items[0].Location), the keys being:
            //Location
            //Distance
            //Latitude
            //Longitude
        }
    }
}

function submitToMailchimp() {
	//property options
	var propertyOptions = $("input[name='Property-options']:checked").val();
	//property type
	var propertyType = $("input[name='Property-type']:checked").val();
	//suburb
	var postcode = $("#postcode").val();
	//about you
		//name
	var name = $("#Name").val();
		//phone
	var phone = $("#Phone-number").val();
		//email
	var email = $("#Email-address").val();
		//status
	var status = selectedStatus;
	//optionals

	var ajaxOptions = {
		url: "https://conveyancing.us18.list-manage.com/subscribe/post-json",
		data: {
			u: "a65e3f2337aa9e93485dc95bb",
			id: "cabaa28804",
			MERGE0: email,
			MERGE1: name,
			MERGE2: "",
			MERGE6: propertyOptions,
			MERGE7: propertyType,
			MERGE8: postcode,
			MERGE9: status
		},
		dataType: "jsonp",
		success: function(result) {
			console.log(result.data);
		},
		error: function(error) {
			console.log(error);
		}
	}

	$.ajax(ajaxOptions);

	//second mail chimp form
	/*
	var salesTeamFormUrl = "";
	var salesTeamU = "";
	var salesTeamId = "";
	ajaxOptions.url = salesTeamFormUrl;
	ajaxOptions.data.u = salesTeamU;
	ajaxOptions.data.id = salesTeamId;

	$.ajax(ajaxOptions);
	*/
}

function ausPostTest() {
	$.ajax(
		{
			url: "https://digitalapi.auspost.com.au/postcode/search.json",
			data: {
				q: "Melbourne",
				state: "VIC",
			},
			headers: {
			}
		})
	.done(function(resp) { 
		console.log(resp);
	});
}