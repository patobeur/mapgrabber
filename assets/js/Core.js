'use strict';
class Core {
	constructor() {
		this.validation = false
		// this.currentSave;
		// this.StorageDealer;
		this.StorageDealer = new LocalStorageDealer()
		this.MapGrabber = new MapGrabber()
		this.init()
	}
	// -----------------------------------------------------------------------
	init() {
		// this.StorageDealer.deleteLocalStorage()
		this.currentSave = this.StorageDealer.get_currentSave()
		this.MapGrabber.start(this.currentSave)
		// console.log('1', this.currentSave)
	}
}
