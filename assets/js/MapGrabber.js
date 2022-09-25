'use strict';
class MapGrabber {
	constructor() {
		this.isPause = false
		this.isDown = false
		// ---
		// ---
		this.icoHalfSize = Number(7) // in px
		this.mpp = 10; // meters per Pixel
		this.ratioZoom = 1
		this.ratio = { pos: 6, set: [.5, .6, .7, .8, .9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2, 2.5] }
		// ---
		this.currentMapNum = Number(0)
		this.currentGameNum = Number(0)
		this.mapPath = String('./assets/maps/' + this.currentGameNum + '/')
		// ---
		this.mousePosition = { x: Number(0), y: Number(0), z: Number(0) }
		this.mousePositionOnMap = { x: Number(0), y: Number(0), z: Number(0) }
		this.realPositionOnMap = { x: Number(0), y: Number(0), z: Number(1) }
		this.mapOffset = [Number(0), Number(0)]
		this.MapPos = { x: Number(0), y: Number(0), z: Number(0) }
		this.mapWidth
		this.mapHeight
		// ---
		this.modalActive = false
		// ---
		this.init()
	}
	// -----------------------------------------------------------------------
	init() {
		let divs = ['topModalDiv']
		// store element from dom before removing them
		divs.forEach(element => {
			this[element] = document.getElementById(element)
			this[element].remove()
			// console.log(this[element])
		}
		);
	}
	start(currentSave) {
		this.currentSave = currentSave
		this.defineWorldDiv()
		this.addPoisToMap()
		this.refreshBoardInfo()
		this.addListener()
	}
	// -----------------------------------------------------------------------
	addListener() {
		document.addEventListener('mousedown', (event) => {
			// when document is clicked
			// console.log(event.buttons, event.button)
			// if left click and map is target
			if (event.buttons === 1 && event.target.id === 'map') {
				this.isDown = true;
				this.mapOffset = [
					this.wordlDiv.offsetLeft - event.clientX,
					this.wordlDiv.offsetTop - event.clientY
				];
				// this.wordlDiv.classList.add('grabed')
				document.body.classList.add('grabed')
			}
		}, true);
		document.addEventListener('mouseup', (event) => {
			// console.log(event.buttons, event.button)
			if (event.buttons === 0) {
				this.isDown = false;
				// this.wordlDiv.classList.remove('grabed')
				document.body.classList.remove('grabed')
			}
		}, true);
		document.addEventListener('mousemove', (event) => {
			// event.preventDefault();
			this.mousePosition = {
				x: event.clientX,
				y: event.clientY
			};
			let ok = { x: false, y: false }

			if (this.isDown) {
				let tMapPos = {
					x: Number(this.mousePosition.x + this.mapOffset[0]),
					y: Number(this.mousePosition.y + this.mapOffset[1])
				}
				// if (tMapPos.x <= 0 && tMapPos.x >= window.innerWidth - (this.wordlDiv.offsetWidth)) {
				this.MapPos.x = tMapPos.x
				this.wordlDiv.style.left = this.MapPos.x + 'px';
				// ok.x = true
				// }
				// if (0 >= tMapPos.y && tMapPos.y >= (window.innerHeight - (this.wordlDiv.offsetHeight))) {
				this.MapPos.y = tMapPos.y
				this.wordlDiv.style.top = this.MapPos.y + 'px';
				// ok.y = true
				// }
			}
			this.refreshBoardInfo()

		}, true);
		document.addEventListener('contextmenu', (event) => {
			// event.preventDefault();
		});

		this.wordlDiv.addEventListener('mousemove', (event) => {
			if (!this.isDown) {
				this.mousePosition = {
					x: event.clientX,
					y: event.clientY
				};
				let newMousePositionOnMapX = this.mousePosition.x - this.MapPos.x
				let newMousePositionOnMapY = this.wordlDiv.offsetHeight - this.mousePosition.y + this.MapPos.y

				this.realPositionOnMap = {
					x: Math.floor(newMousePositionOnMapX / this.ratioZoom),
					y: Math.floor(newMousePositionOnMapY / this.ratioZoom),
					z: 0
				};
				// grabbing and mooving limites rules
				// this.mousePositionOnMap.x = (newX > 0 && newX < (this.mapWidth * this.ratioZoom)) ? newX : false;
				// this.mousePositionOnMap.y = (newY > 0 && newY < (this.mapHeight * this.ratioZoom)) ? (this.mapHeight * this.ratioZoom) - newY : false;

				this.mousePositionOnMap.x = newMousePositionOnMapX;
				this.mousePositionOnMap.y = newMousePositionOnMapY;

				this.refreshBoardInfo()
			}

		}, true);
		this.wordlDiv.addEventListener('contextmenu', (event) => {
			event.preventDefault();
			this.refreshBoardInfo()
			if (!this.modalActive) this.addModal();
		})
		onwheel = (event) => {

			console.log(event.ctrlKey)
			// if (event.ctrlKey) event.preventDefault();
			this.ratio.pos += event.wheelDelta < 0 ? -1 : 1;
			// min & max
			this.ratio.pos = this.ratio.pos < 0
				? 0
				: this.ratio.pos >= this.ratio.set.length
					? this.ratio.set.length - 1
					: this.ratio.pos;


			this.ratioZoom = this.ratio.set[this.ratio.pos]
			this.resizeMap()
		};
	}
	resizeMap() {
		// console.log(this.ratioZoom)
		this.wordlDiv.style.scale = this.ratioZoom
	}
	// -----------------------------------------------------------------------
	// -----------------------------------------------------------------------
	addModal() {
		if (!this.modalActive) {
			this.modalActive = true
			this.topModalDiv.addEventListener('click', ele => {
				if (ele.target.id === "topModalDiv") this.removeModal();
			})
			this.topModalDiv.addEventListener('contextmenu', (ele) => {
				ele.preventDefault();
				if (ele.target.id === "topModalDiv") this.removeModal();
			})
			document.body.appendChild(this.topModalDiv)
			let loopmap = document.getElementById('loopmap')
			loopmap.style.width = this.mapWidth + 'px'
			loopmap.style.height = this.mapHeight + 'px'

			document.getElementById('poiposx').value = this.realPositionOnMap.x
			document.getElementById('poiposy').value = this.realPositionOnMap.y
			document.getElementById('poiposz').value = this.realPositionOnMap.z
			loopmap.style.backgroundImage = "url('" + this.mapPath + this.currentSave.maps[this.currentMapNum].src + "')";
			loopmap.style.backgroundPositionX = (0 - this.realPositionOnMap.x + 75) + 'px'
			loopmap.style.backgroundPositionY = (0 - (this.mapHeight - this.mousePositionOnMap.y) + 75) + 'px'//(0 - this.realPositionOnMap.y - 100) + 'px'
		}
	}
	removeModal() {
		if (this.modalActive) {
			this.modalActive = false
			this.topModalDiv.remove()
		}
	}
	// -----------------------------------------------------------------------
	// -----------------------------------------------------------------------
	defineWorldDiv() {
		let src = this.mapPath + this.currentSave.maps[this.currentMapNum].src
		this.mapWidth = this.currentSave.maps[this.currentMapNum].width
		this.mapHeight = this.currentSave.maps[this.currentMapNum].height
		// console.log(src)
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
		this.wordlDiv.style.width = (this.ratioZoom * this.mapWidth) + 'px';
		this.wordlDiv.style.height = (this.ratioZoom * this.mapHeight) + 'px';
		this.wordlDiv.style.backgroundImage = "url('" + src + "')";
	}
	// -----------------------------------------------------------------------
	refreshBoardInfo() {
		let needs = [
			'posX', 'posY',
			'mapName', 'MouseX', 'MouseY',
			'OnMapX', 'OnMapY', 'OnMapZ',
			'RealOnMapX', 'RealOnMapY',
			'WinW', 'WinH',
			'ratioZoom',
			'mapwidth', 'mapheight',
			'currentMapNum', 'currentGameNum'
		]
		let values = [
			'MapPosx:' + this.MapPos.x + 'px',
			'MapPosy:' + this.MapPos.y + 'px',
			'mapName:' + this.currentSave.maps[this.currentMapNum].name,
			'MouseX:' + this.mousePosition.x,
			'MouseY:' + this.mousePosition.y,
			'OnMapX:' + this.mousePositionOnMap.x,
			'OnMapY:' + this.mousePositionOnMap.y,
			'OnMapZ:' + this.mousePositionOnMap.z,
			'RealOnMapX:' + this.realPositionOnMap.x,
			'RealOnMapY:' + this.realPositionOnMap.y,
			'WinW:' + window.innerWidth,
			'WinH:' + window.innerHeight,
			'ratioZoom:' + this.ratioZoom,
			'mapwidth:' + (this.mapWidth * this.ratioZoom),
			'mapheight:' + (this.mapHeight * this.ratioZoom),
			'currentMapNum:' + this.currentMapNum,
			'currentGameNum:' + this.currentGameNum,
		]
		let divs = {}
		for (let index = 0; index < needs.length; index++) {
			divs[needs[index]] = document.getElementById(needs[index])
			if (!divs[needs[index]]) {
				let newdiv = document.createElement('div');
				newdiv.id = needs[index]
				newdiv.className = 'info'
				document.body.appendChild(newdiv)
				divs[needs[index]] = newdiv
			}
			divs[needs[index]].textContent = values[index];
		}
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

		this.currentSave.pois.forEach(
			poi => {
				// poi.id = iter
				if (poi.mapid === this.currentMapNum) {
					// item can be stored ... but ....
					let item = this.createPoiDiv(iter, poi)
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

		let nicePos = this.nicePosition(index.pos.x, index.pos.y, 0)
		let newX = (nicePos.x - this.icoHalfSize) * this.ratioZoom
		let newY = (nicePos.y - this.icoHalfSize) * this.ratioZoom
		poiDiv.style.left = newX + 'px'
		poiDiv.style.top = newY + 'px'
		// poiDiv.setAttribute('data-x', newX)
		// poiDiv.setAttribute('data-y', newY)
		poiDiv.setAttribute('data-i', iter)
		poiDiv.setAttribute('data-x', index.pos.x)
		poiDiv.setAttribute('data-y', index.pos.y)
		poiDiv.setAttribute('data-type', index.type)

		// console.log(index)
		let ico = this.currentSave.types[index.type].ico
		poiDiv.textContent = ico

		poiDiv.addEventListener('click', () => {
			// formPoiRefresh(iter, index)
			console.log(index, this.currentSave.types[index.type].name)
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
}








































