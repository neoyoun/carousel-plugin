'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var CarouselComponent = function CarouselComponent(userConfig) {
	var defaultConfig = {
		interval: 5000,
		direction: 'left',
		pause: 'hover',
		auto: false
	};
	var self = this;
	var step = self.offsetWidth;
	var listBox = void 0,
	    slideItems = void 0,
	    itemsCount = void 0,
	    prevBtn = void 0,
	    nextBtn = void 0,
	    indicators = void 0;
	var childs = self.getElementsByTagName('*');
	var config = defaultConfig;
	var curSlideIndex = 0;

	// find slide items's wraper and slide item;
	(function findDOM() {
		for (var i = 0; i < childs.length; i++) {
			if (childs[i].nodeType == 1) {
				if (childs[i].getAttribute('role')) {
					var role = childs[i].getAttribute('role');
					switch (role) {
						case 'list-box':
							listBox = childs[i];
							break;
						case 'indicators':
							indicators = childs[i];
							break;
						default:
							break;
					}
				}
				//get prev and next control btn
				if (childs[i].dataset['slide']) {
					var btnDirection = childs[i].dataset['slide'];
					if (btnDirection == 'prev') {
						prevBtn = childs[i];
					}
					if (btnDirection == 'next') {
						nextBtn = childs[i];
					}
				}
			}
		}
		if (!listBox) {
			console.error('slide item must be wraped');
			return false;
		}
		//鼠标悬停以及触摸滑动效果；
		listBox.addEventListener('mouseover', pauseAutoSlide);
		listBox.addEventListener('mouseout', pauseAutoSlide);
		listBox.addEventListener('touchstart', touchHandle);

		//鼠标点击滚动
		if (prevBtn && nextBtn) {
			prevBtn.addEventListener('click', slideToPrev);
			nextBtn.addEventListener('click', slideToNext);
		}

		slideItems = listBox.querySelectorAll('.slide-item');
		itemsCount = slideItems.length;
		if (slideItems.length <= 0) {
			throw new Error("Element which you want to slide must contain class name '.slide-item'");
			return false;
		}
		//只有一个项的时候，不执行
		if (slideItems.length == 1) {
			prevBtn.style.display = 'none';
			nextBtn.style.display = 'none';
			return;
		}
	})();
	if (typeof userConfig === 'string') {
		switch (userConfig) {
			case 'hover':
				pauseAutoSlide();
				break;
			case 'prev':
				slideToPrev();
				break;
			case 'next':
				slideToNext();
				break;
			default:
				break;
		}
	} else {
		if ((typeof userConfig === 'undefined' ? 'undefined' : _typeof(userConfig)) === 'object') {
			config = Object.assign(config, userConfig);
		}
	}
	checkEnterTimes();
	function checkEnterTimes() {
		/*
   * 通过检查节点是否存在添加的样式 检验是第几次调用函数
   * 如果是第一次 则初始化DOM
   * 如果是第二次或以上 检查是否需要重新设置样式
   */
		if (firstTime()) {
			initialDOM();
			return;
		} else {
			/*
    * 通过 偏移量 和 项的长度比例 判断当前项的 索引 
    * 即 curSlideIndex
    */
			var listBoxOffset = -listBox.style.transform.split('(')[1].split('px')[0];
			var firstItem = listBox.children[0];
			curSlideIndex = listBoxOffset / firstItem.offsetWidth - 1;

			if (firstItem.style.width && firstItem.offsetWidth !== self.offsetWidth) {
				step = self.offsetWidth;
				for (var i = 0; i < listBox.children.length; i++) {
					listBox.children[i].style.width = self.offsetWidth + 'px';
					listBox.children[i].style.height = self.offsetHeight + 'px';
				}
				listBox.style.width = self.offsetWidth * listBox.children.length + 'px';
				listBox.style.transform = 'translate3d(-' + step + 'px, 0 ,0)';
				listBox.style.transform = 'translate3d(-' + (curSlideIndex + 1) * step + 'px, 0 ,0)';
			}
		}
		if (self.className.indexOf('slide') > -1) {
			config.auto = true;
		}
		if (config.auto) {
			startAutoSlide(config.direction);
		}

		function firstTime() {
			var nodes = [];
			for (var _i = 0; _i < listBox.children.length; _i++) {
				nodes.push(listBox.children[_i].outerHTML.toString());
			}
			if (nodes.length <= 2) {
				return true;
			} else {
				if (window.Set && typeof Set == 'function') {
					var noRepeatNodes = new Set(nodes);
					return nodes.length == noRepeatNodes.size;
				} else {
					return nodes[0] != nodes[nodes.length - 1];
				}
			}
		}
	}

	function initialDOM() {
		/*
  *初始化节点，只调用一次。包括样式和DOM结构的创建。
  *防止滚动到最后一个节点的时候出现空白，在头一个滚动的
  *的节点复制到队列最后。
  *因此样式上盒子的宽度比滚动项多一个。高度在css中设置一致。
  *滚动项的高度和宽度保持和祖先元素一致；
  *最后调用动画方法
  */
		for (var i = 0; i < itemsCount; i++) {
			slideItems[i].style.width = self.offsetWidth + 'px';
			slideItems[i].style.height = self.offsetHeight + 'px';
		}

		var lastItem = listBox.lastElementChild.cloneNode(true);
		var firstItem = listBox.firstElementChild.cloneNode(true);
		listBox.appendChild(firstItem);
		listBox.insertBefore(lastItem, listBox.firstElementChild);
		listBox.style.transform = 'translate3d(-' + step + 'px, 0 ,0)';
		listBox.style.width = self.offsetWidth * listBox.children.length + 'px';

		if (self.className.indexOf('slide') > -1) {
			config.auto = true;
		}
		if (config.auto) {
			startAutoSlide(config.direction);
		}

		//指示器数量不够的情况下，补足和项目一样的数量
		if (indicators != undefined) {
			var indicatorItems = [].concat(_toConsumableArray(indicators.children));
			var iLen = indicatorItems.length,
			    sLen = slideItems.length;
			if (iLen > 0 && iLen < sLen) {
				while (iLen < sLen) {
					indicators.appendChild(indicators.firstElementChild.cloneNode(true));
					iLen++;
				}
			}
			indicators.children[curSlideIndex].classList.add('active');
		}
	}

	function startAutoSlide(direction) {
		if (self.timer) {
			clearInterval(self.timer);
		}
		self.timer = setInterval(function () {
			if (direction == 'right') {
				curSlideIndex--;
			} else {
				curSlideIndex++;
			}
			slideTo(curSlideIndex);
		}, config.interval);
	}
	function slideTo(index) {
		var domsLen = listBox.children.length;
		var itemsLen = domsLen - 2;
		curSlideIndex = index;
		listBox.style.transitionDuration = '.3s';
		listBox.style.transform = 'translate3d(-' + (curSlideIndex + 1) * step + 'px, 0 ,0)';
		if (curSlideIndex < 0) {
			setTimeout(function () {
				listBox.style.transitionDuration = '0s';
				listBox.style.transform = 'translate3d(-' + itemsLen * step + 'px, 0 ,0)';
			}, 300);
			curSlideIndex = itemsLen - 1;
		} else if (curSlideIndex >= itemsLen) {
			setTimeout(function () {
				listBox.style.transitionDuration = '0s';
				listBox.style.transform = 'translate3d(-' + step + 'px, 0 ,0)';
			}, 300);
			curSlideIndex = 0;
		}
		if (indicators != undefined && indicators.children.length > 0) {
			[].forEach.call(indicators.children, function (item) {
				item.classList.remove('active');
			});
			indicators.children[curSlideIndex].classList.add('active');
		}
	}
	function slideToNext(e) {
		if (e != undefined) {
			e.stopPropagation();
			e.preventDefault();
		}
		clearInterval(self.timer);
		slideTo(++curSlideIndex);
		startAutoSlide(config.direction);
	}
	function slideToPrev(e) {
		if (e != undefined) {
			e.stopPropagation();
			e.preventDefault();
		}
		clearInterval(self.timer);
		slideTo(--curSlideIndex);
		startAutoSlide(config.direction);
	}
	function pauseAutoSlide(e) {
		if (e != undefined) {
			e.stopPropagation();
			e.preventDefault();
		}
		if (config.pause == 'hover') {
			if (self.timer) {
				clearInterval(self.timer);
				self.timer = null;
			} else {
				startAutoSlide(config.direction);
			}
		}
	}
	function touchHandle(e) {
		e.stopPropagation();
		e.preventDefault();
		var self = this;
		var startTime = e.timeStamp;
		var startX = e.touches[0].clientX;
		if (e.touches.length > 1) return;

		self.addEventListener('touchend', touchendHandle);

		function touchendHandle(e) {
			e.stopPropagation();
			e.preventDefault();
			var endTime = e.timeStamp;
			var endX = e.changedTouches[0].clientX;
			var spanTime = endTime - startTime;
			var spanX = endX - startX;
			var touchDirection = '';
			/*if(spanTime > 800 ){
   	console.log('too slow..')
   }*/
			if (spanX > 30) {
				touchDirection = 'right';
			} else if (spanX < -30) {
				touchDirection = 'left';
			}
			if (touchDirection.lenght != 0) {
				touchDirection != config.direction ? slideToPrev(e) : slideToNext(e);
			}
			this.removeEventListener('touchend', touchendHandle);
		}
	}
};
Object.defineProperty(HTMLElement.prototype, 'slide', {
	value: CarouselComponent
});
