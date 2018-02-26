var fs = require('fs');
var pdf = require('html-pdf');
var formatCurrency = require('format-currency');


var extract_xml_field = function(xml, field) {

	field = field+'="';
	let pos1 = xml.indexOf(field)+field.length;
	let res = xml.substring(pos1)
	pos2 = res.indexOf('"');
	res = res.substring(0, pos2)


	
	return res;
};





var receipt_to_pdf = function(json, output_path, callback) {
	var html = fs.readFileSync('./receipt_template.html', 'utf8');
	var options = { 
		format: 'Letter',
		base: "./",
	};

	let html_receipt = html;
	html_receipt = html_receipt.replace("{{NumEmpleado}}", json.Complemento.Nomina.Receptor.NumEmpleado);
	html_receipt = html_receipt.replace("{{Nombre}}", json.Receptor.Nombre);
	html_receipt = html_receipt.replace("{{Curp}}", json.Complemento.Nomina.Receptor.Curp);
	html_receipt = html_receipt.replace("{{Rfc}}", json.Receptor.Rfc);

	html_receipt = html_receipt.replace("{{FechaInicioRelLaboral}}", json.Complemento.Nomina.Receptor.FechaInicioRelLaboral);
	
	html_receipt = html_receipt.replace("{{FechaPago}}", json.Complemento.Nomina.FechaPago);
	html_receipt = html_receipt.replace("{{FechaInicialPago}}", json.Complemento.Nomina.FechaInicialPago);
	html_receipt = html_receipt.replace("{{FechaFinalPago}}", json.Complemento.Nomina.FechaFinalPago);

	var ant = json.Complemento.Nomina.Receptor.Antigüedad;
	ant= ant.replace("P", "");
	ant= ant.replace("W", "");
	ant = Math.floor(ant/52);
	html_receipt = html_receipt.replace("{{Antigüedad}}", ant);

	//Percepciones
	var percs = json.Complemento.Nomina.Percepciones.Percepcion;
	var percepciones = "";
	percs.forEach(function(per) {
		per = per.Percepcion;
		var total = formatCurrency(parseFloat(per.ImporteGravado)+parseFloat(per.ImporteExento));
		percepciones = percepciones + '\
				<div class="concept_row">\
			       	<div class="concept_td_clave">'+per.Clave+'</div>\
			        <div class="concept_td_name">'+per.Concepto+'</div>\
			        <div class="concept_td_amount"> $'+total+'</div>\
			    </div>\
		';
	});

	//Deducciones
	var deds = json.Complemento.Nomina.Deducciones.Deduccion;
	var deducciones = "";
	deds.forEach(function(ded) {
		ded = ded.Deduccion;
		var total = formatCurrency(parseFloat(ded.Importe));
		deducciones = deducciones + '\
				<div class="concept_row">\
			       	<div class="concept_td_clave">'+ded.Clave+'</div>\
			        <div class="concept_td_name">'+ded.Concepto+'</div>\
			        <div class="concept_td_amount"> $'+total+'</div>\
			    </div>\
		';
	});




	html_receipt = html_receipt.replace("{{Percepciones}}", percepciones);
	html_receipt = html_receipt.replace("{{Deducciones}}", deducciones);

	html_receipt = html_receipt.replace("{{TotalPercepciones}}", "$"+json.Complemento.Nomina.TotalPercepciones);
	html_receipt = html_receipt.replace("{{TotalDeducciones}}", "$"+json.Complemento.Nomina.TotalDeducciones);
	html_receipt = html_receipt.replace("{{Total}}", "$"+json.Total);

	html_receipt = html_receipt.replace("{{Logo}}", json.Logo);

	html_receipt = html_receipt.replace("{{uuid}}", json.Timbre.uuid);
	html_receipt = html_receipt.replace("{{RfcEmisor}}", json.Emisor.Rfc);
	html_receipt = html_receipt.replace("{{Sello}}", extract_xml_field(json.Timbre.xml, "Sello"));
	html_receipt = html_receipt.replace("{{SelloCFD}}", extract_xml_field(json.Timbre.xml, "SelloCFD"));
	html_receipt = html_receipt.replace("{{SelloSAT}}", extract_xml_field(json.Timbre.xml, "SelloSAT"));

	pdf.create(html_receipt, options).toFile(output_path, function(err, res) {
	  if (err) {callback(err); return};
	  callback(undefined, res); // { filename: '/app/businesscard.pdf' }
	});
};

module.exports = receipt_to_pdf;