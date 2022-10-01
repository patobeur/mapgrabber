'use strict';
class MapGrabber {
	constructor() {
		this.activeBoard = false
		this.isPause = false
		this.isDown = false
		// ---
		this.zoom = {
			active: true,
			ratio: 1,
			pos: 7,
			list: [.2, .5, .6, .7, .8, .9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2, 2.5],
			getRatio: () => { return this.zoom.active ? this.zoom.ratio : 1 }
		}
		// ---
		this.icoHalfSize = Number(7) // in px
		this.loopHalfSize = Number(75) // in px
		// ---
		this.currentMapNum = Number(0)
		this.currentGameNum = Number(0)
		this.mapPath = String('./assets/maps/' + this.currentGameNum + '/')
		// ---
		this.mousePositionOnScreen = { x: Number(0), y: Number(0), z: Number(0) }
		this.mousePositionOnMap = { x: Number(0), y: Number(0), z: Number(0) }
		this.realPositionOnMap = { x: Number(0), y: Number(0), z: Number(1) }
		this.mapOffset = [Number(0), Number(0)]
		this.MapPos = { x: Number(0), y: Number(0), z: Number(0) }

		this.mapWidth
		this.mapHeight
		// ---
		this.modalActive = false
		// ---
		this.allCurrentPois = []
		this.init()
	}
	// -----------------------------------------------------------------------
	init() {
		// store element from dom before removing them
		let divs = ['topModalDiv']
		divs.forEach(element => {
			this[element] = document.getElementById(element)
			this[element].remove()
		});
	}
	start(currentSave) {
		this.currentSave = currentSave
		this.defineWorldDiv()
		this.addPoisToMap()
		this.refreshBoardInfo()
		this.addListener()
	}
	// -----------------------------------------------------------------------
	set_mapOffset(event) {
		this.mapOffset = [
			this.wordlDiv.offsetLeft - event.clientX,
			this.wordlDiv.offsetTop - event.clientY
		];
	}
	set_mousePositionOnScreen(event) {
		this.mousePositionOnScreen = {
			x: event.clientX,
			y: event.clientY
		};
	}
	set_MapPos() {
		this.MapPos.x = Number(this.mousePositionOnScreen.x + this.mapOffset[0])
		this.MapPos.y = Number(this.mousePositionOnScreen.y + this.mapOffset[1])
	}
	set_mousePositionOnMap() {
		this.mousePositionOnMap.x = this.mousePositionOnScreen.x - this.MapPos.x;
		this.mousePositionOnMap.y = this.mousePositionOnScreen.y - this.MapPos.y;
	}
	set_realPositionOnMap() {
		this.realPositionOnMap = {
			x: Math.floor(this.mousePositionOnMap.x / this.zoom.getRatio()),
			y: Math.floor(this.mapHeight - (this.mousePositionOnMap.y / this.zoom.getRatio())),
			z: 0
		};
	}
	refresh_wordlDivPos() {
		this.wordlDiv.style.left = this.MapPos.x + 'px';
		this.wordlDiv.style.top = this.MapPos.y + 'px';
	}
	// -----------------------------------------------------------------------
	addListener() {
		document.addEventListener('contextmenu', (event) => {
			this.set_mousePositionOnScreen(event)
			event.preventDefault();
			if (event.target.id === 'map') {
				// this.set_MapPos()
				this.set_mousePositionOnMap()
				this.set_realPositionOnMap()
				this.refreshBoardInfo()
				if (!this.modalActive) this.addModal(false);
			}
		});
		document.addEventListener('mousemove', (event) => {
			this.set_mousePositionOnScreen(event)
			if (event.target.id === 'map') {
				this.set_mousePositionOnMap()
				this.set_realPositionOnMap()

				if (this.isDown) {
					this.set_MapPos()
					this.refresh_wordlDivPos()
				}
			}
			this.refreshBoardInfo()
		}, true);
		document.addEventListener('mousedown', (event) => {
			if (event.buttons === 1 && event.target.id === 'map') {
				this.isDown = true;
				this.set_mapOffset(event)
				document.body.classList.add('grabed')
			}
		}, true);
		document.addEventListener('mouseup', (event) => {
			if (event.buttons === 0) {
				this.isDown = false;
				document.body.classList.remove('grabed')
			}
		}, true);
		onwheel = (event) => {
			if (event.ctrlKey) event.preventDefault();
			this.zoom.pos += event.wheelDelta < 0 ? -1 : 1;
			// min & max
			this.zoom.pos = this.zoom.pos < 0
				? 0
				: this.zoom.pos >= this.zoom.list.length
					? this.zoom.list.length - 1
					: this.zoom.pos;
			this.zoom.ratio = this.zoom.list[this.zoom.pos]
			this.set_mapScale()
			this.refreshBoardInfo()
		};
	}
	set_mapScale() {
		let ratio = this.zoom.getRatio()
		this.wordlDiv.style.scale = ratio
	}
	// -----------------------------------------------------------------------
	// -----------------------------------------------------------------------
	addModal(poiId = false) {
		if (!this.modalActive) {
			this.modalActive = true
			this.topModalDiv.addEventListener('click', event => {
				if (event.target.id === "topModalDiv") this.removeModal();
			})
			this.topModalDiv.addEventListener('contextmenu', (event) => {
				event.preventDefault();
				if (event.target.id === "topModalDiv") this.removeModal();
			})
			document.body.appendChild(this.topModalDiv)
			this.refresh_currentPoiDatasForm(poiId)
		}
	}
	refresh_currentPoiDatasForm(poiId = false) {

		let loopmap = document.getElementById('loopmap')
		loopmap.style.width = this.mapWidth + 'px'
		loopmap.style.height = this.mapHeight + 'px'
		loopmap.style.backgroundImage = "url('" + this.mapPath + this.currentSave.maps[this.currentMapNum].src + "')";
		loopmap.style.backgroundSize = (this.mapWidth) + "px " + (this.mapHeight) + "px";
		console.log('Number', typeof poiId)
		if (typeof poiId === 'number') {
			this.currentPoi = this.currentSave.pois[poiId]
		} else {
			this.currentPoi = {
				gameid: this.currentGameNum,
				mapid: this.currentMapNum,
				type: 1,
				pos: {
					x: this.realPositionOnMap.x,
					y: this.realPositionOnMap.y,
					z: this.mousePositionOnMap.z
				},
				name: "New",
				comment: "New comment.",
				shop: false,
				quest: false
			}
		}
		loopmap.style.backgroundPositionX = Math.floor(0 - this.currentPoi.pos.x + this.loopHalfSize) + 'px'
		loopmap.style.backgroundPositionY = Math.floor(0 - this.mapHeight + this.currentPoi.pos.y + this.loopHalfSize) + 'px'
		let icolist = document.getElementById('icolist')
		if (icolist.childNodes.length < 1) {
			let iter = 0;
			let classname = "icolistitem";
			this.currentSave.types.forEach(element => {
				let itemType = this.createEle('div', 'ico_' + iter, true)
				itemType.classList = classname + (iter === Number(poiId) ? ' up' : '')
				itemType.setAttribute('data-id', iter)
				itemType.title = element.name
				itemType.textContent = element.ico
				icolist.appendChild(itemType)
				iter++;
			});
		}
		document.getElementById('poiid').value = poiId ? Number(poiId) : this.currentSave.pois.length;
		document.getElementById('poitype').value = this.currentPoi.type
		document.getElementById('poiposx').value = this.currentPoi.pos.x
		document.getElementById('poiposy').value = this.currentPoi.pos.y
		document.getElementById('poiposz').value = this.currentPoi.pos.z
		document.getElementById('poiname').value = this.currentPoi.name
		document.getElementById('poicomment').value = this.currentPoi.comment
		document.getElementById('poishop').checked = this.currentPoi.shop
		document.getElementById('poiquest').checked = this.currentPoi.quest
	}
	removeModal() {
		if (this.modalActive) {
			this.modalActive = false
			this.topModalDiv.remove()
		}
	}
	// -----------------------------------------------------------------------
	defineWorldDiv() {
		let src = this.mapPath + this.currentSave.maps[this.currentMapNum].src
		this.mapWidth = this.currentSave.maps[this.currentMapNum].width
		this.mapHeight = this.currentSave.maps[this.currentMapNum].height
		this.wordlDiv = document.getElementById('map')
		if (this.wordlDiv) {
			this.wordlDiv.textContent = "";
		} else {
			this.wordlDiv = document.createElement("div");
			this.wordlDiv.id = "map";
			this.wordlDiv.style.transformOrigin = 'top left'
			document.body.appendChild(this.wordlDiv);
		}
		this.wordlDiv.style.left = "0px";
		this.wordlDiv.style.top = "0px";
		this.wordlDiv.style.width = (this.mapWidth) + 'px';
		this.wordlDiv.style.height = (this.mapHeight) + 'px';
		this.wordlDiv.style.backgroundImage = "url('" + src + "')";
		this.wordlDiv.style.backgroundSize = (this.mapWidth) + "px " + (this.mapHeight) + "px";
	}
	// -----------------------------------------------------------------------
	refreshPoisPos() {
		let allPoiDivs = document.getElementsByClassName('poi')

		for (let item in allPoiDivs) {
			if (typeof allPoiDivs[item] == 'object') {
				let x = Number(allPoiDivs[item].getAttribute('data-x'))
				let y = Number(allPoiDivs[item].getAttribute('data-y'))
				let newPos = {
					x: x + this.MapPos.x,
					y: y + this.MapPos.y
				}
				allPoiDivs[item].style.left = (this.ratioZoom * newPos.x) + 'px'
				allPoiDivs[item].style.top = (this.ratioZoom * newPos.y) + 'px'
			}
		}
	}
	addPoisToMap() {
		let iter = 0
		let poisCount = 0
		this.allCurrentPois = []
		this.currentSave.pois.forEach(
			poi => {
				// poi.id = iter
				if (poi.mapid === this.currentMapNum) {
					// item can be stored ... but ....
					let item = this.createPoiDiv(iter, poi)
					this.allCurrentPois.push(item)
					poisCount++
				}
				iter++
			}
		);
	}
	nicePosition(x, y, z) {
		let imgH = Number(this.currentSave.maps[this.currentMapNum].height)
		let nicePos = {
			x: x - this.MapPos.x,
			y: imgH - y + this.MapPos.y,
			z: z
		}
		return nicePos
	}
	createPoiDiv(iter, index) {
		let poiDiv = this.createEle('div', 'poi poi_' + iter)
		poiDiv.title = index.name + '\n' + index.comment

		// work with this.zoom.getratio() = 1
		let nicePos = this.nicePosition(index.pos.x, index.pos.y, 0)
		let newX = (nicePos.x - this.icoHalfSize)
		let newY = (nicePos.y - this.icoHalfSize)
		poiDiv.style.left = newX + 'px'
		poiDiv.style.top = newY + 'px'

		poiDiv.setAttribute('data-i', iter)
		poiDiv.setAttribute('data-x', index.pos.x)
		poiDiv.setAttribute('data-y', index.pos.y)
		poiDiv.setAttribute('data-type', index.type)
		let ico = this.currentSave.types[index.type].ico
		poiDiv.textContent = ico
		poiDiv.addEventListener('click', (event) => {
			let poiId = Number(event.target.getAttribute('data-i'))
			if (!this.modalActive) this.addModal(Number(poiId));
		})
		this.wordlDiv.appendChild(poiDiv)
		return poiDiv
	}
	// -----------------------------------------------------------------------
	createEle(tag = 'div', name = false, type = false) {
		let ele = document.createElement(tag)
		if (name) { if (!type) { ele.className = name } else { ele.id = name } }
		return ele
	}
	// -----------------------------------------------------------------------
	refreshBoardInfo() {
		if (this.activeBoard) {
			let needs = [
				'currentMapNum',
				'currentGameNum',
				'currentMapName',
				'MapPosx',
				'MapPosy',
				'this.mapOffset0',
				'this.mapOffset1',
				'mousePositionX',
				'mousePositionY',
				'mousePositionOnMapX',
				'mousePositionOnMapY',
				'mousePositionOnMapZ',
				'realPositionOnMapX',
				'realPositionOnMapY',
				'WinnerWidth',
				'WinnerHeight',
				'zoomratio',
				'mapWidth',
				'mapheight',
				'mapWidthXratio',
				'mapheightXratio',
			]
			let values = [
				'currentMapNum:' + this.currentMapNum,
				'currentGameNum:' + this.currentGameNum,
				'currentMapName:' + this.currentSave.maps[this.currentMapNum].name,
				'MapPosx:' + this.MapPos.x + 'px',
				'MapPosy:' + this.MapPos.y + 'px',
				'this.mapOffset0:' + this.mapOffset[0],
				'this.mapOffset1:' + this.mapOffset[1],

				'mousePositionOnScreenX:' + this.mousePositionOnScreen.x,
				'mousePositionOnScreenY:' + this.mousePositionOnScreen.y,

				'mousePositionOnMapX:' + this.mousePositionOnMap.x,
				'mousePositionOnMapY:' + this.mousePositionOnMap.y,
				'mousePositionOnMapZ:' + this.mousePositionOnMap.z,

				'realPositionOnMapX:' + this.realPositionOnMap.x,
				'realPositionOnMapY:' + this.realPositionOnMap.y,

				'WinnerWidth:' + window.innerWidth,
				'WinnerHeight:' + window.innerHeight,
				'zoomratio:' + this.zoom.getRatio(),
				'mapWidth:' + (this.mapWidth),
				'mapheight:' + (this.mapHeight),
				'mapWidthXratio:' + (this.mapWidth * this.zoom.getRatio()),
				'mapheightXratio:' + (this.mapHeight * this.zoom.getRatio()),
			]
			let divs = {}
			let board = document.getElementById('board')
			if (!board) { board = this.createEle('div', 'board', true); document.body.appendChild(board) }
			for (let index = 0; index < needs.length; index++) {
				divs[needs[index]] = document.getElementById(needs[index])
				if (!divs[needs[index]]) {
					let newdiv = document.createElement('div');
					newdiv.id = needs[index]
					newdiv.className = 'info'
					board.appendChild(newdiv)
					divs[needs[index]] = newdiv
				}
				divs[needs[index]].textContent = values[index];
			}
		}
	}
}


































