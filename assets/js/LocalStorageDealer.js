'use strict';
class LocalStorageDealer {
	constructor() {
		// console.log(this.saveZero)

		this.gameName = 'RuneTeller'
		this.currentSave = 0
		this.maxSave = 5
		// ----------------
		// this.storedDatas = false
		this.AllSavedDatas = []
		this.checks = ['types', 'maps', 'pois']
		// ----------------
		this.init()
	}
	// -----------------------------------------------------------------------
	init() {
		this.checkDatas()
		// this.storedDatas = {
		// 	types: localStorage.getItem(this.gameName + '_types'),
		// 	maps: localStorage.getItem(this.gameName + '_maps'),
		// 	pois: localStorage.getItem(this.gameName + '_pois')
		// }
		// if (this.storedDatas && this.storedDatas != 'null') {
		// 	//&& this.datas.pois.
		// 	console.log(this.storedDatas)
		// }
		// else {
		// 	console.log(this.storedDatas)
		// 	console.log('no current datas in localStorage')
		// 	localStorage.setItem(this.gameName + '_types', JSON.stringify(this.saveZero.types));
		// 	localStorage.setItem(this.gameName + '_maps', JSON.stringify(this.saveZero.maps));
		// 	localStorage.setItem(this.gameName + '_pois', JSON.stringify(this.saveZero.pois));
		// }
	}
	deleteLocalStorage() {
		// for (let saveNum = 0; saveNum < this.maxSave; saveNum++) {
		// 	this.checks.forEach(item => {
		// 		let itemName = this.gameName + '_' + saveNum + '_' + item
		// 		let storedItem = localStorage.getItem(itemName)
		// 		if (storedItem || storedItem != null) {
		// 			localStorage.removeItem(itemName)
		// 		}
		// 		this.AllSavedDatas = []
		// 	})
		// }
		localStorage.clear()
		this.init()
	}
	get_currentSave() {
		let currentsave = this.AllSavedDatas[this.currentSave]
		return typeof currentsave === 'object' ? currentsave : false;
	}
	checkStorage() {
		for (let saveNum = 0; saveNum < this.maxSave; saveNum++) {
			this.checks.forEach(item => {
				let itemName = this.gameName + '_' + saveNum + '_' + item
				let storedItem = localStorage.getItem(itemName)
				// )
				if (!this.AllSavedDatas[saveNum]) { this.AllSavedDatas[saveNum] = {} };

				if (!storedItem || storedItem === null) {
					// no data found, storring datas
					let newSave = saveNum === 0 ? this.saveZero[item] : null;
					localStorage.setItem(itemName, JSON.stringify(newSave))
					this.AllSavedDatas[saveNum][item] = newSave
				}
				else {
					// updating data with stored datas
					this.AllSavedDatas[saveNum][item] = JSON.parse(storedItem)
				}
			})
		}
	}

	// StorageDealer() {
	// 	this.gameDatas = JSON.parse(localStorage.getItem(this.gameName))
	// 	if (!this.gameDatas || datas.v > this.gameDatas.v) {
	// 		let cleanjson = datas
	// 		cleanjson = cleanjson.replace(/\"([^(\")"]+)\":/g, "$1:");  //This will remove all the quotes
	// 		localStorage.setItem('this.gameDatas', JSON.stringify(cleanjson));
	// 		this.gameDatas = JSON.parse(localStorage.getItem('this.gameDatas'))
	// 	}
	// 	let cleanjson = localStorage.getItem('this.gameDatas')
	// 	cleanjson = cleanjson.replace(/\"([^(\")"]+)\":/g, "$1:");  //This will remove all the quotes
	// 	JsonTextarea.textContent = cleanjson
	// }
	// SaveDealer() {
	// 	SavedMap = JSON.parse(localStorage.getItem('SavedMap'))
	// 	if (!SavedMap) {
	// 		localStorage.setItem('SavedMap', JSON.stringify({ save: [{ name: 'Starting map', date: new Date(), datas: this.gameDatas }] }));
	// 		SavedMap = JSON.parse(localStorage.getItem('SavedMap'))
	// 	}
	// }
	// StorageRefresh() {
	// 	this.gameDatas.v++
	// 	let jsonString = JSON.stringify(this.gameDatas)
	// 	localStorage.setItem('this.gameDatas', jsonString);

	// 	JsonTextarea.textContent = this.removeTypeQuotes(jsonString)
	// }
	removeTypeQuotes(jsonString) {
		if (typeof jsonString != 'string' && typeof jsonString == 'object') {
			jsonString = JSON.stringify(jsonString);
		}
		return jsonString.replace(/\"([^(\")"]+)\":/g, "$1:");  //This will remove all the quotes
	}


	checkDatas() {
		this.saveZero = { maps: maps, types: types, pois: pois }
		if (this.saveZero && typeof this.saveZero === 'object') {
			this.checkStorage()
		} else this.error();

		// if (this.saveZero && typeof this.saveZero === 'object') this.checkStorage();  else this.error();
	}
	error() {
		console.error('local datas files are corrupted !')
		console.table({
			maps: typeof maps === 'object' ? ' ok !' : ' /datas/maps.js corrupted!',
			types: typeof types === 'object' ? ' ok !' : ' /datas/types.js corrupted!',
			pois: typeof pois === 'object' ? ' ok !' : ' /datas/pois.js corrupted!'
		})
	}
}
