
var payroll_receipt = require("./recibo_test.json");
var receipt_to_pdf = require("./receipt_to_pdf.js");

//Add the logo path to the JSON
payroll_receipt.Logo = "file:///C://Users/migue/Desktop/recibo_pdf/its_logo.png";

//Generate the receipt
receipt_to_pdf(payroll_receipt, './receipt_template1.pdf', function(err, result){
	if(err) {
		console.log(err);
		return;
	}
	console.log(result);
});

