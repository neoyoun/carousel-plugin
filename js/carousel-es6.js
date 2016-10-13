'use strict';
let CarouselComponent = function (userConfig) {
		const defaultConfig = {
			interval : 3000,
			direction : 'left',
			pause : 'hover',
			auto : false
		}
		let self = this;
		let step = self.offsetWidth;
		let listBox,slideItems,itemsCount,prevBtn,nextBtn,indicators;
		let childs = self.getElementsByTagName('*');
		let config = defaultConfig;
		let curSlideIndex = 0;

		// find slide items's wraper and slide item;
		(function findDOM() {
			for (let i = 0; i < childs.length; i++) {
					if(childs[i].nodeType == 1) {
						if( childs[i].getAttribute('role') ) {
							let role = childs[i].getAttribute('role');
							switch(role){
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
						if( childs[i].dataset['slide'] ){
							let btnDirection = childs[i].dataset['slide'];
							if( btnDirection == 'prev') {prevBtn = childs[i]}
							if( btnDirection == 'next') {nextBtn = childs[i]}
						}
					}
				}
			if( !listBox ){
					console.error('slide item must be wraped');
					return false;
				}
			//鼠标悬停以及触摸滑动效果；
			listBox.addEventListener('mouseover' , pauseAutoSlide )
			listBox.addEventListener('mouseout' , pauseAutoSlide )
			listBox.addEventListener('touchstart',touchHandle)

			//鼠标点击滚动
			if( prevBtn && nextBtn ){
					prevBtn.addEventListener('click', slideToPrev )
					nextBtn.addEventListener('click', slideToNext )
				}

		 	slideItems = listBox.querySelectorAll('.slide-item');
			itemsCount = slideItems.length;
			if( slideItems.length <= 0 ){
				throw new Error("Element which you want to slide must contain class name '.slide-item'");
				return false;
			}
			//指示器数量不够的情况下，补足和项目一样的数量
			if(indicators != undefined){
				let indicatorItems = [...indicators.children];
				let iLen = indicatorItems.length,sLen = slideItems.length;
				if( iLen>0 && iLen < sLen){
					while(iLen < sLen){
						indicators.appendChild(indicators.firstElementChild.cloneNode(true));
						iLen++;
					}
				}
				indicators.children[curSlideIndex].classList.add('active');
			}
		})();

	let curSlidePos = listBox.style.transform;
	//获得当前滚动位置长度，根据滚动位置判断居中项索引
	if( curSlidePos ){
		curSlidePos = -(curSlidePos.split('(')[1].split('px')[0]);
		curSlideIndex = (curSlidePos / step)-1;
	}
	if( typeof userConfig === 'string' ){
			switch(userConfig) {
				case 'hover':
					pauseAutoSlide();
					break;
				case 'prev':
					slideToPrev();
					break;
				case 'next':
					slideToNext();
					break;
				default :
					break;
			}
	}else{
		if (typeof userConfig === 'object' ) {
			config = Object.assign(config,userConfig);
		}
	}


  //只有第一次调用函数才将节点初始化
	isFirstTimeEnter()? initialDOM() :'';
	function isFirstTimeEnter() {
	 	/* @return boolean 
	 	 *
	 	 * 找到每个滚动的项后,将节点放入数组
	 	 * 转换成Set结构,判断是否有重复节点
	 	 */
	 	let nodes = [];
	 	for(let i = 0; i<listBox.children.length;i++){
 			nodes.push( listBox.children[i].innerHTML)
	 	}
	 	
	 	let noRepeatNodes = new Set(nodes);
	 	return nodes.length == noRepeatNodes.size;
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
		for (let i = 0; i < itemsCount; i++) {
			slideItems[i].style.width = self.offsetWidth + 'px';
			slideItems[i].style.height = self.offsetHeight + 'px';
		}
		listBox.style.width = (slideItems[0].offsetWidth * (itemsCount+2)) +'px';
	
		let lastItem = listBox.lastElementChild.cloneNode(true);
		let firstItem = listBox.firstElementChild.cloneNode(true);
		listBox.appendChild(firstItem);
		listBox.insertBefore(lastItem,listBox.firstElementChild);
		listBox.style.transform = 'translate3d(-'+step + 'px, 0 ,0)';

		itemsCount = itemsCount+2;
		if(self.className.indexOf('slide') > -1){
			config.auto = true
		}
		if(config.auto){startAutoSlide(config.direction)}
	}

	function startAutoSlide(direction) {
		self.timer = setInterval(function () {
		if( direction == 'right'){
			curSlideIndex--;
		}else {
			curSlideIndex++;
		}
		slideTo(curSlideIndex)
		}, config.interval)
	}
	function slideTo(index) {
		curSlideIndex = index;
		listBox.style.transitionDuration = '.3s';
		listBox.style.transform = 'translate3d(-'+ (curSlideIndex+1)*step + 'px, 0 ,0)';
		if( curSlideIndex < 0 ){
				setTimeout(function () {
					listBox.style.transitionDuration = '0s';
					listBox.style.transform = 'translate3d(-'+ ((itemsCount-2)*step) +'px, 0 ,0)';
				}, 300)
				curSlideIndex = itemsCount - 3;
			}else if( curSlideIndex >= (itemsCount - 2) ){
				setTimeout(function () {
					listBox.style.transitionDuration = '0s';
					listBox.style.transform = 'translate3d(-'+ step +'px, 0 ,0)';
				}, 300)
				curSlideIndex = 0;
			}
		[].forEach.call(indicators.children,function (item) {
			item.classList.remove('active')
		})
		indicators.children[curSlideIndex].classList.add('active');
	}
	function slideToNext(e) {
		if(e != undefined){
			e.stopPropagation();
			e.preventDefault();
		}
		clearInterval(self.timer);
		slideTo(++curSlideIndex);
		startAutoSlide(config.direction);
	}
	function slideToPrev(e) {
		if(e != undefined){
			e.stopPropagation();
			e.preventDefault();
		}
		clearInterval(self.timer);
		slideTo(--curSlideIndex);
		startAutoSlide(config.direction);
	}		
	function pauseAutoSlide(e) {
		if(e != undefined){
			e.stopPropagation();
			e.preventDefault();	
		}
		if(config.pause == 'hover') {
			if(self.timer){
				clearInterval(self.timer);
				self.timer = null;
			}else {
				startAutoSlide(config.direction);
			}
		}		
	}
	function touchHandle(e) {
		e.stopPropagation();
		e.preventDefault();
		let self = this;
		let startTime = e.timeStamp;
		let startX = e.touches[0].clientX;
		if(e.touches.length > 1) return;

		self.addEventListener('touchend',touchendHandle);

		function touchendHandle(e) {
			e.stopPropagation();
			e.preventDefault();
			let endTime = e.timeStamp;
			let endX = e.changedTouches[0].clientX;
			let spanTime = endTime - startTime;
			let spanX = endX - startX;
			let touchDirection ='';
			/*if(spanTime > 800 ){
				console.log('too slow..')
			}*/
			if(spanX > 30 ){
				touchDirection = 'right';
			}else if( spanX < -30){
				touchDirection = 'left';
			}
			if(touchDirection.lenght != 0){
				touchDirection != config.direction?slideToPrev(e):slideToNext(e)
			}
		this.removeEventListener('touchend',touchendHandle)
		}
	}
}
Object.defineProperty(HTMLElement.prototype,'slide',{
			value : CarouselComponent
		})