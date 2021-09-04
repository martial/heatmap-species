const fs = require("fs");
const heatmap = require("@luxedo/heatmap");
const csv = require('csv-parser')
const path = require('path')

const width = 1000 ;
const height = 446;
let points = [];

function convert(lat, lon){
    var y = ((-1 * lat) + 90) * (height / 180);
    var x = (lon + 180) * (width / 360);
    return {x:x,y:y};
}

const input = process.argv[2];

const files = [];
let filedIndex = 2;

fs.readdir(input, function (err, f) {
  if (!err) {
    const csvFiles = f.filter(el => path.extname(el) === '.csv');
    csvFiles.forEach((file) => {
      if (typeof file !== 'undefined' ) {
        files.push(file);
      }
    })
    const csvUrl = files[filedIndex]
    createImage(csvUrl)
  }
})

function createImage(url) {

	points = [];
  let nIndex = 0;

	fs.createReadStream("./"+input+"/"+url)
	  .pipe(csv())
	  .on('data', (data) => {

      const dataParsed = Object.values(data);
	  	if(dataParsed.length === 6 ) {

        if (nIndex % 10 === 0) {
		  	const pnt = convert(parseFloat(dataParsed[2]), parseFloat(dataParsed[3]))
		  	points.push({
					px: pnt.x,
			    py: pnt.y,
			    value: parseFloat(dataParsed[5]),
			    sigma: 50,
		  	})
	  }
	  	nIndex++;
	  }
	}).on('end', () => {

		const colors = {
		  steps: 30,
		  values: ["#022B3A", "#1F7A8C", "#BFDBF7", "#E1E5F2", "1FFFFFF"],
		  weights: [1, 2, 3, 4 ,5],
    };

		heatmap.drawHeatmap({points, width, height, colors} ).then((result) => {
			const output = "output/output-"+filedIndex+".png"
      fs.writeFileSync(output, result);
      filedIndex++;
      const csvUrl = files[filedIndex]
      if (filedIndex < files.length - 1) {
        createImage(csvUrl)
      }
		});

	});

}






