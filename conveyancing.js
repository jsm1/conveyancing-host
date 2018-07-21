 
$(document).ready(function() {
	var loqateControl = configureLoqate();
});

function configureLoqate() {
	var fields = [{ element: "postcode", field: "Postcode" }];
	var settings = { key: "WN86-WF99-YA99-TT77", search: { countries: "AUS" }, setCountryByIP: false };
	var control = new pca.Address(fields, settings);
	return control;
}
