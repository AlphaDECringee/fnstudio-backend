const sails = require('sails');
const NeoLog = require('./structs/NeoLog')
const { default: axios } = require('axios');
const fs = require("fs");
require('machinepack-redis/machines/create-manager');


async function compareAndUpdateKeychain() {
	try {
	  const response = await axios.get('https://spush-tracker-v3.up.railway.app/keychain');
	  const data = response.data;
	  const localData = JSON.parse(fs.readFileSync('./responses/keychain.json'));
	  for (const entry of data) {
		if (!localData.includes(entry)) {
		  localData.push(entry);
		}
	  }
	  fs.writeFileSync('./responses/keychain.json', JSON.stringify(localData));
	  
	} catch {

		const response = await axios.get('https://api.nitestats.com/v1/epic/keychain');
	  	const data = response.data;
		const localData = JSON.parse(fs.readFileSync('./responses/keychain.json'));
		for (const entry of data) {
			if (!localData.includes(entry)) {
			localData.push(entry);
			}
		}
		fs.writeFileSync('./responses/keychain.json', JSON.stringify(localData));
		}
		fs.readFile('./responses/keychain.json', 'utf8', (err, data) => {
		if (err) throw err;

		const updated = data.replace(/,/g, ',\n');
		fs.writeFile('./responses/keychain.json', updated, 'utf8', (err) => {
	 	 if (err) throw err;
		});
  });
  NeoLog.Debug(`'keychain.json' wurde aktualisiert.`);
}

async function startbackend(){
    sails.lift({
      port: 5595,
	  environment: "production",
	  hooks: {
		session: false,
	  },
	  log:{
	  	level: 'silent'
	  },
    }, (err) => {
		if(err){
			console.log(err)
		}
    });
	NeoLog.Log('Backend ist auf Port 5595 gestartet.');
  }

  async function runfunctions(){
		await compareAndUpdateKeychain();
		await startbackend();
	}
	runfunctions()