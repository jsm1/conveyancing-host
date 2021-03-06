//globals
var RADIO_CLICK_DELAY = 250;
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

var PRICE_MATRIX = {
	Buy: {
		"Existing Home": "990",
		"Land": "990",
		"apartment/unit/townhouse": "1155",
		"Off the plan": "935"
	},
	Sell: {
		"Existing Home": "990",
		"Land": "990",
		"apartment/unit/townhouse": "1155",
		"Off the plan": "935"
	},
	Transfer: {
		"Existing Home": "990",
		"Land": "990",
		"apartment/unit/townhouse": "1155",
		"Off the plan": "935"
	},
	"Buy and sell": {
		"Existing Home": "Contact Us",
		"Land": "Contact Us",
		"apartment/unit/townhouse": "Contact Us",
		"Off the plan": "Contact Us"
	}
};

var VISIBLE_OPTIONS_CLASS_MAP = {
    Buy: "buy-selected",
    Sell: "sell-selected",
    Transfer: "transfer-selected",
    "Buy and sell": "buy-sell-selected"
};
//whether to show validation
var shouldShowValidation = false;
var shouldCheckPostcode = false;
var shouldCheckPostcodeSell = false;
//global to keep track of select status
var selectedStatus = "";
$(document).ready(function() {
    //jQuery autocomplete for postcodes
    $("#postcode, #postcode-sell").autocomplete(
        {
            source: function(request, response) {
                var results = $.ui.autocomplete.filter(POSTCODES_ARRAY, request.term);
                response(results.slice(0, 10));
            }, 
            delay: 500,
            minLength: 2,
            select: function(event, ui) {
                
                $(this).val(ui.item.value);
                if ($(this).attr("id") === "postcode") {
                    shouldCheckPostcode = true;
                    checkPostcode();
                } else {
                    shouldCheckPostcodeSell = true;
                    checkPostcodeSell();
                }

                return false;
            }
        }
    );

    //listeners for step 1 and 2 radio clicks
   $("input[name='Property-options']").click(function(event) {
   		//make other inputs not required 
   		var selectedOption = event.currentTarget.value;
   		makeUnRequired(selectedOption);


   		//make sure inputs for selected option are required
   		makeRequired(selectedOption);


        //clear classes then add class to hide optionals
        $(".options-wrapper").attr("class", "options-wrapper").addClass(VISIBLE_OPTIONS_CLASS_MAP[selectedOption]);

    	window.setTimeout(function() {
    		$(".bottom-bar.first-bar a").click();
    	}, RADIO_CLICK_DELAY);
    	
    });

    $("input[name='Property-type-1']").click(function(event) {
        //check if buy and sell mode and there must be two property types checked
        if ($("input[name='Property-options']:checked").val() === BUY_AND_SELL && $("input[name='Property-type-2']:checked").length === 0) {
            return;
        }
    	window.setTimeout(function() {
    		$(".bottom-bar a.suburb-btn").click();
    	}, RADIO_CLICK_DELAY);
    	
    });

    $("input[name='Property-type-2']").click(function(event) {
        //if other is also set
        if ($("input[name='Property-type-1']:checked").length) {
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
    	}
        if (shouldCheckPostcodeSell) {
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
        //get options
        var optionals = [];
        $(".optional-question-list:visible input:checked").each(function() {
            optionals.push($(this).attr("id"));
        })
        var optionalsString;
        if (optionals.length > 0) {
            optionalsString = optionals.join(", ");
        }




    	//populate text
    	populateQuote();
    	//submit mailchimp forms
    	submitToMailchimp(optionalsString);

        $("#quote-price").val(getQuoteAmount());


        //remove unfilled fields
        removeUnfilledFields();
    });

    //listeners for ga events
    $("#postcode").blur(function() {
    	if (!$(this).val()) {
    		return;
    	}
        window.dataLayer.push({
          'event' : 'ENTERED SUBURB',
          'eventCategory' : 'ENTERED SUBURB',
          'eventAction' : $(this).val()
        });
    });

    $("#postcode-sell").blur(function() {
    	if (!$(this).val()) {
    		return;
    	}
        window.dataLayer.push({
          'event' : 'ENTERED SUBURB',
          'eventCategory' : 'SELLING SUBURB ENTERED',
          'eventAction' : $(this).val()
        });
    });


    //query string skip ahead
    checkQueryParams();
    
    
});

function removeUnfilledFields() {
    //remove all empty text inputs
    $("input:not([type='radio'], [type='checkbox'])").filter(function() {
        if ($(this).val() === "" || !$(this).val()) {
            return true;
        }
    }).remove();

    //remove all empty checkboxes
    $("input[type='checkbox']:not(:checked)").remove();

    //remove Property-type-2 if empty
    if ($("input[name='Property-type-2']:checked").length === 0) {
    	$("input[name='Property-type-2']").remove();
    }

    //remove all unselected selects
    $("select").filter(function() {
        if ($(this).val() === "NA") {
            return true;
        }
    }).remove();
}

function checkQueryParams() {
    var params = getQueryParams();

    const REQUIRED_PARAMS = ["option", "type", "suburb"];

    for (var i = 0; i < REQUIRED_PARAMS.length; i++) {
        if (!params[REQUIRED_PARAMS[i]]) {
            return;
        }
    }


    //option
    $("input[name='Property-options'][value='" + decodeURIComponent(params["option"]) + "']").click();
    
    //special case for buy and sell
    if (decodeURIComponent(params["option"]) === "Buy and sell") {
        return;
    }

    //$(".bottom-bar.first-bar a").click();
    //type
    $("input[name='Property-type-1'][value='" + decodeURIComponent(params["type"]) + "']").click();
    //$("a.suburb-btn").click();
    
    //postcode
    $("#postcode").val(decodeURIComponent(params["suburb"]));
    //send ga tag event for postcode
    window.dataLayer.push({
          'event' : 'ENTERED SUBURB',
          'eventCategory' : 'ENTERED SUBURB',
          'eventAction' : decodeURIComponent(params["suburb"])
    });

    window.setTimeout(function() {
        $("a.about-btn").click();

    }, 500);

    //$("a[data-w-tab='About you']").click();
}


function getQuoteAmount() {
    var propertyOption = $("input[name='Property-options']:checked").val();
    var propertyType = $("input[name='Property-type-1']:checked").val();

    var price = PRICE_MATRIX[propertyOption][propertyType];

    return price;
}

function populateQuote() {
	var propertyOption = $("input[name='Property-options']:checked").val();
	var propertyType = $("input[name='Property-type-1']:checked").val();

	//special case for buy and sell
	if (propertyOption === BUY_AND_SELL) {
		
		$(".quote-heading").html(BUY_AND_SELL_TEXT);
		$(".quote-amount").hide();
		$(".quote-inclusions").hide();
		$("#gst-text").hide();
		return;
	}

	var postcode = formatPostcode($("#postcode").val());
	var price = getQuoteAmount();

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

function formatPostcode(postcode) {
    if (!postcode) {
        return;
    }

    var postcodeElements = postcode.split(/, /);
    var suburb = postcodeElements[0];
    var postcodeNum = postcodeElements[2];

    //convert suburb to title case
    var suburbWords = suburb.split(/[\s\-]/);
    for (var i = 0; i < suburbWords.length; i++) {
        //get first char and capitalise then extract rest of the string and conver to lower case
        suburbWords[i] = suburbWords[i].charAt(0).toUpperCase() + suburbWords[i].slice(1).toLowerCase();
    }

    var formattedSuburb = suburbWords.join(" ");

    return formattedSuburb + ", " + postcodeNum;

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
        $("#postcode-sell").parent(".validation-field-wrapper").children(".outside-victoria-message").hide();

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
}

function checkPostcodeSell() {
    //postcode checking
    var generalPostcodeRegex = /^[^\,]+, [^\,]+, [012456789]\d{3}/;
    var vicPostcodeRegex = /^[^\,]+, [^\,]+, 3\d{3}/;
    var postcodeValue = $("#postcode-sell").val();


    //check postcode present generally
    if (!postcodeValue) {
        $("#postcode-sell").parent(".validation-field-wrapper").children(".validation-error:not(.outside-victoria-message)").show();
        $("#postcode-sell").parent(".validation-field-wrapper").children(".outside-victoria-message").hide();

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

function makeUnRequired(selectedOption) {
	$(TO_HIDE_SELECTORS[selectedOption]).removeAttr("required").attr("meta-required-removed", "true");

}

function makeRequired(selectedOption) {
	$(TO_MAKE_REQUIRED[selectedOption]).attr("required", true);
}


function submitToMailchimp(optionals) {
	//property options
	var propertyOptions = $("input[name='Property-options']:checked").val();
	//property type
	var propertyType = $("input[name='Property-type-1']:checked").val();
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

    var quoteText = $(".quote-heading").text();
	

    //add today's date
    var dateToday = today;
    var quote = "";
    if (propertyOptions !== BUY_AND_SELL) {
        quote = PRICE_MATRIX[propertyOptions][propertyType];
    }

        

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
			MERGE9: status,
            MERGE10: optionals,
            MERGE11: dateToday,
            MERGE12: quote,
            MERGE13: quoteText
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

	
}

function getQueryParams() {
    if (!window.location.search) {
        return {};
    }
    //get query string excluding ?
    var queryString = window.location.search.substring(1);
    //split on &
    var paramsSplit = queryString.split("&");

    var params = {};
    //iterate through, split params

    for (var i = 0; i < paramsSplit.length; i++) {
        var keyValue = paramsSplit[i].split("=");
        //if key and value present
        if (keyValue.length > 1) {
            params[keyValue[0]] = keyValue[1];
        } else {
            params[keyValue[0]] = "";
        }
    }

    return params;

}