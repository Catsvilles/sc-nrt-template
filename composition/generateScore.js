var fs = require('fs');
var osc = require("osc");

function toBytesInt32 (num) {
    arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
    view = new DataView(arr);
    view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
    return new Uint8Array(arr);
}

const noteMsg = (id, freq) => ({
    address: "/s_new",
    args: [
	{
	    type: "s",
	    value: 'nrtPing'
	},
	{
	    type: "i",
	    value: id
	},
	{
	    type: "i",
	    value: 0
	},
	{
	    type: "i",
	    value: 0
	},
	{
	    type: "s",
	    value: "freq"
	},
	{
	    type: "f",
	    value: freq
	}
    ]
});

const ratios = [1,1,2,3/2,3/4,6/5,1/2,1,1];

const timetag = (s) => ({
    raw: [
	Math.floor(s),
	(s - Math.floor(s)) * 4294967296
    ]
})

const bundles = ratios.map(
    (ratio, i) => ({
	timeTag: timetag(i * 2),
	packets: [noteMsg(1000 + i, 440 * ratio)]
    })
)

const binaryBundles = bundles.map((bundle) => osc.writePacket(bundle));

const overallSize = binaryBundles.reduce(
    (acc, bundle) => acc + bundle.byteLength,
    0
) + (binaryBundles.length * 4);

const outputArray = new Uint8Array(overallSize);

let outputIndex = 0;
for (let bundleIndex = 0; bundleIndex < binaryBundles.length; bundleIndex++) {
    let bundle = binaryBundles[bundleIndex];
    let bundleLength = binaryBundles[bundleIndex].byteLength;
    outputArray.set(
	toBytesInt32(binaryBundles[bundleIndex].byteLength),
	outputIndex
    );
    outputIndex += 4;
    outputArray.set(
	bundle,
	outputIndex
    );
    outputIndex += bundleLength;
}

console.log();

fs.writeFileSync('./build/javascriptScore.osc', outputArray);
